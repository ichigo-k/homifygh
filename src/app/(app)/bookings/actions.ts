"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit, notify } from "@/lib/events"

/** Thrown inside a transaction to roll back a top-up that can't be covered. */
class InsufficientFunds extends Error {}

export async function rebookBooking(bookingId: string) {
  const user = await requireRole("CUSTOMER")
  const previous = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: user.id },
    include: { provider: { select: { status: true, storeSetupComplete: true } } },
  })
  if (!previous) return { ok: false as const, message: "Booking not found." }
  if (previous.provider.status !== "APPROVED" || !previous.provider.storeSetupComplete) {
    return { ok: false as const, message: "This provider is not currently accepting bookings." }
  }
  const scheduledAt = new Date()
  scheduledAt.setDate(scheduledAt.getDate() + 7)
  scheduledAt.setHours(10, 0, 0, 0)
  await prisma.booking.create({ data: { customerId: user.id, providerId: previous.providerId, category: previous.category, scheduledAt, address: previous.address, notes: previous.notes } })
  revalidatePath("/bookings")
  return { ok: true as const }
}

export async function cancelBooking(bookingId: string) {
  const user = await requireRole("CUSTOMER")
  const cancelled = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, customerId: user.id, status: { in: ["PENDING", "ACCEPTED"] } },
      select: { id: true, depositAmount: true },
    })
    if (!booking) return false
    await tx.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED", depositAmount: null, counterAmount: null, counterAt: null } })
    if (booking.depositAmount) {
      await tx.user.update({ where: { id: user.id }, data: { walletBalance: { increment: booking.depositAmount } } })
      await tx.walletTransaction.create({ data: { userId: user.id, amount: booking.depositAmount, type: "CREDIT", description: "Booking cancelled — refund" } })
    }
    return true
  })
  if (!cancelled) return { ok: false as const, message: "This booking can no longer be cancelled." }
  revalidatePath("/bookings")
  revalidatePath("/provider")
  revalidatePath("/admin/bookings")
  revalidatePath("/wallet")
  revalidatePath("/more")
  return { ok: true as const }
}

/**
 * Answers a price the provider proposed. This is the only place the customer's
 * hold changes size after booking: accepting trues it up to the new price,
 * rejecting cancels the job and refunds in full. Nothing moved while the
 * counter was merely outstanding.
 */
export async function respondToCounter(bookingId: string, accept: boolean) {
  const user = await requireRole("CUSTOMER")
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: user.id, status: "PENDING", counterAmount: { not: null } },
    select: { id: true, counterAmount: true, depositAmount: true, provider: { select: { userId: true, storeName: true } } },
  })
  if (!booking) return { ok: false as const, message: "This price is no longer on the table." }
  const counter = booking.counterAmount!
  const held = booking.depositAmount ?? 0
  const diff = counter - held

  const outcome = await prisma.$transaction(async (tx) => {
    // Claiming the counter is what makes this safe to double-submit: the first
    // response clears counterAmount, so a second finds nothing to act on.
    const { count } = await tx.booking.updateMany({
      where: { id: bookingId, status: "PENDING", counterAmount: { not: null } },
      data: accept
        ? { status: "ACCEPTED", amount: counter, depositAmount: counter, counterAmount: null, counterAt: null }
        : { status: "CANCELLED", depositAmount: null, counterAmount: null, counterAt: null },
    })
    if (!count) return "STALE" as const
    if (!accept) {
      if (held > 0) {
        await tx.user.update({ where: { id: user.id }, data: { walletBalance: { increment: held } } })
        await tx.walletTransaction.create({ data: { userId: user.id, amount: held, type: "CREDIT", description: `Price declined — refund from ${booking.provider.storeName ?? "provider"}` } })
      }
      return "OK" as const
    }
    if (diff > 0) {
      const debited = await tx.user.updateMany({ where: { id: user.id, walletBalance: { gte: diff } }, data: { walletBalance: { decrement: diff } } })
      if (!debited.count) throw new InsufficientFunds()
      await tx.walletTransaction.create({ data: { userId: user.id, amount: diff, type: "DEBIT", description: `Agreed price — ${booking.provider.storeName ?? "provider"}` } })
    } else if (diff < 0) {
      await tx.user.update({ where: { id: user.id }, data: { walletBalance: { increment: -diff } } })
      await tx.walletTransaction.create({ data: { userId: user.id, amount: -diff, type: "CREDIT", description: `Agreed price — ${booking.provider.storeName ?? "provider"}` } })
    }
    return "OK" as const
  }).catch((err) => {
    if (err instanceof InsufficientFunds) return "FUNDS" as const
    throw err
  })

  if (outcome === "FUNDS") return { ok: false as const, message: `You need GH₵${diff.toLocaleString()} more in your wallet to accept this price. Top up and try again.` }
  if (outcome === "STALE") return { ok: false as const, message: "This price is no longer on the table." }

  try {
    await notify(prisma, {
      userId: booking.provider.userId,
      type: "BOOKING",
      title: accept ? "Price accepted" : "Price declined",
      message: accept ? `The customer accepted GH₵${counter.toLocaleString()}. The job is confirmed.` : `The customer declined GH₵${counter.toLocaleString()} and the request was cancelled.`,
      href: "/provider",
    })
    await audit(prisma, { actorId: user.id, action: accept ? "BOOKING_COUNTER_ACCEPTED" : "BOOKING_COUNTER_DECLINED", entityType: "Booking", entityId: bookingId, metadata: { amount: counter } })
  } catch (err) {
    console.error("[respondToCounter] side-effect failed:", err)
  }

  revalidatePath("/bookings")
  revalidatePath("/provider")
  revalidatePath("/admin/bookings")
  revalidatePath("/wallet")
  revalidatePath("/more")
  return { ok: true as const }
}

/** Permanently remove a cancelled booking from the customer's history. */
export async function deleteBooking(bookingId: string) {
  const user = await requireRole("CUSTOMER")
  // Only the owner, and only CANCELLED bookings, can be deleted — active or
  // completed jobs stay for the record. Reviews are removed alongside.
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: user.id, status: "CANCELLED" },
    select: { id: true },
  })
  if (!booking) return { ok: false as const, message: "Only cancelled bookings can be deleted." }
  await prisma.$transaction([
    prisma.review.deleteMany({ where: { bookingId } }),
    prisma.booking.delete({ where: { id: bookingId } }),
  ])
  revalidatePath("/bookings")
  revalidatePath("/admin/bookings")
  return { ok: true as const }
}

const reviewSchema = z.object({ bookingId: z.string().min(1), rating: z.number().int().min(1).max(5), comment: z.string().trim().max(600) })

export async function submitReview(input: z.infer<typeof reviewSchema>) {
  const user = await requireRole("CUSTOMER")
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, message: "Choose a rating from 1 to 5 stars." }
  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data.bookingId, customerId: user.id, status: "COMPLETED" },
    select: { providerId: true, review: { select: { id: true } } },
  })
  if (!booking) return { ok: false as const, message: "Only completed jobs can be reviewed." }
  if (booking.review) return { ok: false as const, message: "You have already reviewed this job." }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({ data: { bookingId: parsed.data.bookingId, customerId: user.id, providerId: booking.providerId, rating: parsed.data.rating, comment: parsed.data.comment || null } })
    const ratings = await tx.review.aggregate({ where: { providerId: booking.providerId }, _avg: { rating: true }, _count: { rating: true } })
    await tx.provider.update({ where: { id: booking.providerId }, data: { avgRating: ratings._avg.rating ?? 0, totalReviews: ratings._count.rating } })
  })
  revalidatePath("/bookings")
  revalidatePath("/search")
  revalidatePath("/provider")
  return { ok: true as const }
}
