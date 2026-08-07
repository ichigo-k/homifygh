"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { BookingStatus, Prisma, PrismaClient } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit, notify } from "@/lib/events"
import { splitPayout } from "@/lib/payouts"

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("ACCEPT"), bookingId: z.string().min(1), amount: z.coerce.number().positive().max(1_000_000) }),
  z.object({ action: z.literal("DECLINE"), bookingId: z.string().min(1) }),
  z.object({ action: z.literal("START"), bookingId: z.string().min(1) }),
  z.object({ action: z.literal("COMPLETE"), bookingId: z.string().min(1) }),
])
export type ProviderBookingAction = z.infer<typeof updateSchema>

const STALE = "This booking has already changed. Refresh and try again."

/**
 * Moves a booking out of `from` and reports whether this caller was the one to
 * do it. Every money-moving branch below claims the transition inside its own
 * transaction, so of two concurrent submits only the winner moves funds — the
 * status check before the transaction narrows the race but can't close it.
 */
async function claim(db: PrismaClient | Prisma.TransactionClient, id: string, from: BookingStatus, data: Prisma.BookingUpdateManyMutationInput) {
  const { count } = await db.booking.updateMany({ where: { id, status: from }, data })
  return count > 0
}

/** Unwinds a settlement transaction with a reason instead of a raw throw. */
class Unwind extends Error {
  constructor(readonly reason: "STALE" | "FUNDS") { super(reason) }
}

async function settle(work: () => Promise<unknown>): Promise<"OK" | "STALE" | "FUNDS"> {
  try {
    await work()
    return "OK"
  } catch (err) {
    if (err instanceof Unwind) return err.reason
    throw err
  }
}

export async function updateProviderBooking(input: ProviderBookingAction) {
  const user = await requireRole("PROVIDER")
  const data = updateSchema.parse(input)
  const provider = await prisma.provider.findUnique({ where: { userId: user.id }, select: { id: true, storeName: true, status: true, storeSetupComplete: true } })
  if (!provider || provider.status !== "APPROVED" || !provider.storeSetupComplete) return { ok: false as const, message: "Your store is not ready to manage bookings." }
  const booking = await prisma.booking.findFirst({ where: { id: data.bookingId, providerId: provider.id }, select: { status: true, customerId: true, depositAmount: true, amount: true } })
  if (!booking) return { ok: false as const, message: "Booking not found." }
  const expected = data.action === "ACCEPT" || data.action === "DECLINE" ? "PENDING" : data.action === "START" ? "ACCEPTED" : "IN_PROGRESS"
  if (booking.status !== expected) return { ok: false as const, message: STALE }
  const nextStatus = data.action === "ACCEPT" ? "ACCEPTED" : data.action === "DECLINE" ? "CANCELLED" : data.action === "START" ? "IN_PROGRESS" : "COMPLETED"
  const copy = data.action === "ACCEPT"
    ? { title: "Booking confirmed", message: `${provider.storeName ?? "Your provider"} accepted your request with an estimate of GH₵${data.amount.toLocaleString()}.` }
    : data.action === "DECLINE"
      ? { title: "Booking unavailable", message: `${provider.storeName ?? "The provider"} could not accept this request.` }
      : data.action === "START"
        ? { title: "Work started", message: `${provider.storeName ?? "Your provider"} marked the job as in progress.` }
        : { title: "Work completed", message: "Your job was marked complete. You can now leave a verified review." }

  let settledPayout = 0

  if (data.action === "ACCEPT") {
    // True up the wallet hold to the provider's actual quote: charge more if
    // it's higher than what was held at request time, refund if it's lower.
    const held = booking.depositAmount ?? 0
    const diff = data.amount - held
    const outcome = await settle(() => prisma.$transaction(async (tx) => {
      if (!await claim(tx, data.bookingId, "PENDING", { status: "ACCEPTED", amount: data.amount, depositAmount: data.amount })) throw new Unwind("STALE")
      if (diff > 0) {
        const debited = await tx.user.updateMany({ where: { id: booking.customerId, walletBalance: { gte: diff } }, data: { walletBalance: { decrement: diff } } })
        if (!debited.count) throw new Unwind("FUNDS")
        await tx.walletTransaction.create({ data: { userId: booking.customerId, amount: diff, type: "DEBIT", description: `Booking estimate updated — ${provider.storeName ?? "provider"}` } })
      } else if (diff < 0) {
        await tx.user.update({ where: { id: booking.customerId }, data: { walletBalance: { increment: -diff } } })
        await tx.walletTransaction.create({ data: { userId: booking.customerId, amount: -diff, type: "CREDIT", description: `Booking estimate updated — ${provider.storeName ?? "provider"}` } })
      }
    }))
    if (outcome === "FUNDS") return { ok: false as const, message: "The customer's wallet balance can't cover this estimate. Ask them to top up, or quote a lower amount." }
    if (outcome === "STALE") return { ok: false as const, message: STALE }
  } else if (data.action === "DECLINE") {
    const outcome = await settle(() => prisma.$transaction(async (tx) => {
      if (!await claim(tx, data.bookingId, "PENDING", { status: "CANCELLED", depositAmount: null })) throw new Unwind("STALE")
      if (booking.depositAmount) {
        await tx.user.update({ where: { id: booking.customerId }, data: { walletBalance: { increment: booking.depositAmount } } })
        await tx.walletTransaction.create({ data: { userId: booking.customerId, amount: booking.depositAmount, type: "CREDIT", description: `Booking declined — refund from ${provider.storeName ?? "provider"}` } })
      }
    }))
    if (outcome !== "OK") return { ok: false as const, message: STALE }
  } else if (data.action === "COMPLETE") {
    // Release the hold. The customer was already debited when the booking was
    // placed and trued up on accept, so this is the only step that moves that
    // money on to the provider — before this it was held and credited to nobody.
    const gross = booking.depositAmount ?? booking.amount ?? 0
    const { platformFee, providerPayout } = splitPayout(gross)
    const outcome = await settle(() => prisma.$transaction(async (tx) => {
      if (!await claim(tx, data.bookingId, "IN_PROGRESS", { status: "COMPLETED", platformFee, providerPayout, payoutAt: new Date(), ...(gross > 0 ? { paymentStatus: "PAID" as const, paidAt: new Date() } : {}) })) throw new Unwind("STALE")
      if (providerPayout > 0) {
        await tx.user.update({ where: { id: user.id }, data: { walletBalance: { increment: providerPayout } } })
        await tx.walletTransaction.create({ data: { userId: user.id, amount: providerPayout, type: "CREDIT", description: `Job completed — payout${platformFee > 0 ? ` (GH₵${gross.toLocaleString()} less GH₵${platformFee.toLocaleString()} commission)` : ""}` } })
      }
    }))
    if (outcome !== "OK") return { ok: false as const, message: STALE }
    settledPayout = providerPayout
  } else if (!await claim(prisma, data.bookingId, "ACCEPTED", { status: "IN_PROGRESS" })) {
    return { ok: false as const, message: STALE }
  }

  // Notification + audit are best-effort afterwards, so a slow side-effect
  // can't blow the interactive-transaction limit and fail the status change
  // (see the same fix in the customer createBooking action).
  try {
    await notify(prisma, { userId: booking.customerId, type: "BOOKING", ...copy, href: "/bookings" })
    if (settledPayout > 0) await notify(prisma, { userId: user.id, type: "PAYMENT", title: "Payout released", message: `GH₵${settledPayout.toLocaleString()} was added to your wallet for a completed job.`, href: "/provider/payments" })
    await audit(prisma, { actorId: user.id, action: `BOOKING_${nextStatus}`, entityType: "Booking", entityId: data.bookingId })
  } catch (err) {
    console.error("[updateProviderBooking] side-effect failed:", err)
  }
  revalidatePath("/provider")
  revalidatePath("/provider/payments")
  revalidatePath("/bookings")
  revalidatePath("/admin/bookings")
  revalidatePath("/wallet")
  revalidatePath("/more")
  return { ok: true as const }
}
