"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { notify } from "@/lib/events"

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
    await tx.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED", depositAmount: null } })
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

export async function customerAcceptPrice(input: { bookingId: string }) {
  const user = await requireRole("CUSTOMER")
  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, customerId: user.id },
    select: { id: true, offeredAmount: true, provider: { select: { userId: true } } },
  })
  if (!booking) return { ok: false as const, message: "Booking not found." }

  const agreed = booking.offeredAmount ?? 0

  await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      priceStatus: "AGREED",
      agreedAmount: booking.offeredAmount,
      amount: booking.offeredAmount,
    },
  })

  try {
    await notify(prisma, {
      userId: booking.provider.userId,
      type: "BOOKING",
      title: "Price Proposal Accepted",
      message: `Customer accepted the price proposal of GH₵${agreed.toLocaleString()}.`,
      href: "/provider",
    })
  } catch (err) {
    console.error("[customerAcceptPrice] notification failed:", err)
  }

  revalidatePath("/bookings")
  revalidatePath("/provider")
  return { ok: true as const }
}

export async function customerCounterOffer(input: { bookingId: string; price: number }) {
  const user = await requireRole("CUSTOMER")
  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, customerId: user.id },
    select: { id: true, provider: { select: { userId: true } } },
  })
  if (!booking) return { ok: false as const, message: "Booking not found." }

  if (typeof input.price !== "number" || input.price <= 0) {
    return { ok: false as const, message: "Invalid price specified." }
  }

  await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      offeredAmount: input.price,
      priceStatus: "PROPOSED_BY_CUSTOMER",
    },
  })

  try {
    await notify(prisma, {
      userId: booking.provider.userId,
      type: "BOOKING",
      title: "Counter Offer Received",
      message: `Customer proposed a price of GH₵${input.price.toLocaleString()}.`,
      href: "/provider",
    })
  } catch (err) {
    console.error("[customerCounterOffer] notification failed:", err)
  }

  revalidatePath("/bookings")
  revalidatePath("/provider")
  return { ok: true as const }
}

export async function customerRejectPrice(input: { bookingId: string }) {
  const user = await requireRole("CUSTOMER")
  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, customerId: user.id },
    select: { id: true },
  })
  if (!booking) return { ok: false as const, message: "Booking not found." }

  await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      priceStatus: "REJECTED",
    },
  })

  revalidatePath("/bookings")
  revalidatePath("/provider")
  return { ok: true as const }
}
