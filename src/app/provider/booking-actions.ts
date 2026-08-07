"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { BookingStatus, Prisma, PrismaClient } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit, notify } from "@/lib/events"
import { splitPayout } from "@/lib/payouts"

const updateSchema = z.discriminatedUnion("action", [
  // ACCEPT carries no price: it takes the deal the customer already agreed to
  // and paid for. Charging more than that needs their consent, which is what
  // COUNTER is for.
  z.object({ action: z.literal("ACCEPT"), bookingId: z.string().min(1) }),
  z.object({ action: z.literal("COUNTER"), bookingId: z.string().min(1), amount: z.coerce.number().positive().max(1_000_000) }),
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
  const expected = data.action === "ACCEPT" || data.action === "COUNTER" || data.action === "DECLINE" ? "PENDING" : data.action === "START" ? "ACCEPTED" : "IN_PROGRESS"
  if (booking.status !== expected) return { ok: false as const, message: STALE }
  const nextStatus = data.action === "ACCEPT" ? "ACCEPTED" : data.action === "COUNTER" ? "PENDING" : data.action === "DECLINE" ? "CANCELLED" : data.action === "START" ? "IN_PROGRESS" : "COMPLETED"
  const copy = data.action === "ACCEPT"
    ? { title: "Booking confirmed", message: `${provider.storeName ?? "Your provider"} accepted your request at GH₵${(booking.depositAmount ?? 0).toLocaleString()}.` }
    : data.action === "COUNTER"
    ? { title: "New price proposed", message: `${provider.storeName ?? "Your provider"} proposed GH₵${data.amount.toLocaleString()} for this job. Accept or decline it from your bookings.` }
    : data.action === "DECLINE"
      ? { title: "Booking unavailable", message: `${provider.storeName ?? "The provider"} could not accept this request.` }
      : data.action === "START"
        ? { title: "Work started", message: `${provider.storeName ?? "Your provider"} marked the job as in progress.` }
        : { title: "Work completed", message: "Your job was marked complete. You can now leave a verified review." }

  let settledPayout = 0

  if (data.action === "ACCEPT") {
    // Accepting takes the price already held from the customer, so no money
    // moves and no balance check is needed. If nothing was held there is no
    // agreed price yet and the provider has to name one with a counter.
    if (booking.depositAmount == null) return { ok: false as const, message: "There's no agreed price on this request yet. Send the customer a price instead." }
    if (!await claim(prisma, data.bookingId, "PENDING", { status: "ACCEPTED", amount: booking.depositAmount, counterAmount: null, counterAt: null })) return { ok: false as const, message: STALE }
  } else if (data.action === "COUNTER") {
    // A proposal only — the customer's money is untouched until they accept it.
    if (!await claim(prisma, data.bookingId, "PENDING", { counterAmount: data.amount, counterAt: new Date() })) return { ok: false as const, message: STALE }
  } else if (data.action === "DECLINE") {
    const outcome = await settle(() => prisma.$transaction(async (tx) => {
      if (!await claim(tx, data.bookingId, "PENDING", { status: "CANCELLED", depositAmount: null, counterAmount: null, counterAt: null })) throw new Unwind("STALE")
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
      // depositAmount is cleared for the same reason decline and cancel clear
      // it: it means "funds still held against this booking", and they aren't
      // any more — they went to the provider. Leaving it set makes
      // deleteBookingAdmin refund the customer money already paid out.
      if (!await claim(tx, data.bookingId, "IN_PROGRESS", { status: "COMPLETED", depositAmount: null, platformFee, providerPayout, payoutAt: new Date(), ...(gross > 0 ? { paymentStatus: "PAID" as const, paidAt: new Date() } : {}) })) throw new Unwind("STALE")
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
    await audit(prisma, { actorId: user.id, action: data.action === "COUNTER" ? "BOOKING_COUNTERED" : `BOOKING_${nextStatus}`, entityType: "Booking", entityId: data.bookingId, ...(data.action === "COUNTER" ? { metadata: { amount: data.amount } } : {}) })
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
