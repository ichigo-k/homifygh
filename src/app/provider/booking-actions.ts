"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit, notify } from "@/lib/events"

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("ACCEPT"), bookingId: z.string().min(1), amount: z.coerce.number().positive().max(1_000_000) }),
  z.object({ action: z.literal("DECLINE"), bookingId: z.string().min(1) }),
  z.object({ action: z.literal("START"), bookingId: z.string().min(1) }),
  z.object({ action: z.literal("COMPLETE"), bookingId: z.string().min(1) }),
])
export type ProviderBookingAction = z.infer<typeof updateSchema>

export async function updateProviderBooking(input: ProviderBookingAction) {
  const user = await requireRole("PROVIDER")
  const data = updateSchema.parse(input)
  const provider = await prisma.provider.findUnique({ where: { userId: user.id }, select: { id: true, storeName: true, status: true, storeSetupComplete: true } })
  if (!provider || provider.status !== "APPROVED" || !provider.storeSetupComplete) return { ok: false as const, message: "Your store is not ready to manage bookings." }
  const booking = await prisma.booking.findFirst({ where: { id: data.bookingId, providerId: provider.id }, select: { status: true, customerId: true, depositAmount: true } })
  if (!booking) return { ok: false as const, message: "Booking not found." }
  const expected = data.action === "ACCEPT" || data.action === "DECLINE" ? "PENDING" : data.action === "START" ? "ACCEPTED" : "IN_PROGRESS"
  if (booking.status !== expected) return { ok: false as const, message: "This booking has already changed. Refresh and try again." }
  const nextStatus = data.action === "ACCEPT" ? "ACCEPTED" : data.action === "DECLINE" ? "CANCELLED" : data.action === "START" ? "IN_PROGRESS" : "COMPLETED"
  const copy = data.action === "ACCEPT"
    ? { title: "Booking confirmed", message: `${provider.storeName ?? "Your provider"} accepted your request with an estimate of GH₵${data.amount.toLocaleString()}.` }
    : data.action === "DECLINE"
      ? { title: "Booking unavailable", message: `${provider.storeName ?? "The provider"} could not accept this request.` }
      : data.action === "START"
        ? { title: "Work started", message: `${provider.storeName ?? "Your provider"} marked the job as in progress.` }
        : { title: "Work completed", message: "Your job was marked complete. You can now leave a verified review." }

  if (data.action === "ACCEPT") {
    // True up the wallet hold to the provider's actual quote: charge more if
    // it's higher than what was held at request time, refund if it's lower.
    const held = booking.depositAmount ?? 0
    const diff = data.amount - held
    const accepted = await prisma.$transaction(async (tx) => {
      if (diff > 0) {
        const debited = await tx.user.updateMany({ where: { id: booking.customerId, walletBalance: { gte: diff } }, data: { walletBalance: { decrement: diff } } })
        if (!debited.count) return false
        await tx.walletTransaction.create({ data: { userId: booking.customerId, amount: diff, type: "DEBIT", description: `Booking estimate updated — ${provider.storeName ?? "provider"}` } })
      } else if (diff < 0) {
        await tx.user.update({ where: { id: booking.customerId }, data: { walletBalance: { increment: -diff } } })
        await tx.walletTransaction.create({ data: { userId: booking.customerId, amount: -diff, type: "CREDIT", description: `Booking estimate updated — ${provider.storeName ?? "provider"}` } })
      }
      await tx.booking.update({ where: { id: data.bookingId }, data: { status: "ACCEPTED", amount: data.amount, depositAmount: data.amount } })
      return true
    })
    if (!accepted) return { ok: false as const, message: "The customer's wallet balance can't cover this estimate. Ask them to top up, or quote a lower amount." }
  } else if (data.action === "DECLINE") {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({ where: { id: data.bookingId }, data: { status: "CANCELLED", depositAmount: null } })
      if (booking.depositAmount) {
        await tx.user.update({ where: { id: booking.customerId }, data: { walletBalance: { increment: booking.depositAmount } } })
        await tx.walletTransaction.create({ data: { userId: booking.customerId, amount: booking.depositAmount, type: "CREDIT", description: `Booking declined — refund from ${provider.storeName ?? "provider"}` } })
      }
    })
  } else {
    await prisma.booking.update({ where: { id: data.bookingId }, data: { status: nextStatus } })
  }

  // Notification + audit are best-effort afterwards, so a slow side-effect
  // can't blow the interactive-transaction limit and fail the status change
  // (see the same fix in the customer createBooking action).
  try {
    await notify(prisma, { userId: booking.customerId, type: "BOOKING", ...copy, href: "/bookings" })
    await audit(prisma, { actorId: user.id, action: `BOOKING_${nextStatus}`, entityType: "Booking", entityId: data.bookingId })
  } catch (err) {
    console.error("[updateProviderBooking] side-effect failed:", err)
  }
  revalidatePath("/provider")
  revalidatePath("/bookings")
  revalidatePath("/admin/bookings")
  revalidatePath("/wallet")
  revalidatePath("/more")
  return { ok: true as const }
}

export async function proposePrice(input: { bookingId: string; price: number }) {
  const user = await requireRole("PROVIDER")
  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true, storeName: true, status: true, storeSetupComplete: true },
  })
  if (!provider || provider.status !== "APPROVED" || !provider.storeSetupComplete) {
    return { ok: false as const, message: "Your store is not ready to manage bookings." }
  }

  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, providerId: provider.id },
    select: { id: true, customerId: true },
  })
  if (!booking) return { ok: false as const, message: "Booking not found." }

  if (typeof input.price !== "number" || input.price <= 0) {
    return { ok: false as const, message: "Invalid price specified." }
  }

  await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      offeredAmount: input.price,
      priceStatus: "PROPOSED_BY_PROVIDER",
    },
  })

  try {
    await notify(prisma, {
      userId: booking.customerId,
      type: "BOOKING",
      title: "Price Proposed",
      message: `${provider.storeName ?? "Your provider"} proposed a price of GH₵${input.price.toLocaleString()}.`,
      href: "/bookings",
    })
  } catch (err) {
    console.error("[proposePrice] notification failed:", err)
  }

  revalidatePath("/provider")
  revalidatePath("/bookings")
  return { ok: true as const }
}

export async function acceptPriceProposal(input: { bookingId: string }) {
  const user = await requireRole("PROVIDER")
  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true, storeName: true, status: true, storeSetupComplete: true },
  })
  if (!provider || provider.status !== "APPROVED" || !provider.storeSetupComplete) {
    return { ok: false as const, message: "Your store is not ready to manage bookings." }
  }

  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, providerId: provider.id },
    select: { id: true, customerId: true, offeredAmount: true },
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
      userId: booking.customerId,
      type: "BOOKING",
      title: "Price Proposal Accepted",
      message: `${provider.storeName ?? "Your provider"} accepted the price proposal of GH₵${agreed.toLocaleString()}.`,
      href: "/bookings",
    })
  } catch (err) {
    console.error("[acceptPriceProposal] notification failed:", err)
  }

  revalidatePath("/provider")
  revalidatePath("/bookings")
  return { ok: true as const }
}

export async function rejectPriceProposal(input: { bookingId: string }) {
  const user = await requireRole("PROVIDER")
  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, storeSetupComplete: true },
  })
  if (!provider || provider.status !== "APPROVED" || !provider.storeSetupComplete) {
    return { ok: false as const, message: "Your store is not ready to manage bookings." }
  }

  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, providerId: provider.id },
    select: { id: true },
  })
  if (!booking) return { ok: false as const, message: "Booking not found." }

  await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      priceStatus: "REJECTED",
    },
  })

  revalidatePath("/provider")
  revalidatePath("/bookings")
  return { ok: true as const }
}
