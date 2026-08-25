"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit, notify } from "@/lib/events"

const recordPaymentSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(["UNPAID", "DEPOSIT_PAID", "PAID", "REFUNDED"]),
  method: z.string().trim().min(2).max(40),
  reference: z.string().trim().max(100).optional(),
})

export async function recordPayment(input: z.infer<typeof recordPaymentSchema>) {
  const user = await requireRole("PROVIDER")
  const data = recordPaymentSchema.parse(input)
  const booking = await prisma.booking.findFirst({
    where: { id: data.bookingId, provider: { userId: user.id } },
    select: { id: true, customerId: true, amount: true, agreedAmount: true },
  })
  if (!booking) return { ok: false as const, message: "Booking not found." }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: data.status,
        paymentMethod: data.method,
        paymentReference: data.reference || null,
        paidAt: data.status === "PAID" ? new Date() : null,
      },
    })

    if (data.status === "PAID") {
      const amountEarned = booking.agreedAmount || booking.amount || 0
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { increment: amountEarned } },
      })

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          amount: amountEarned,
          type: "CREDIT",
          description: `Payment for booking #${booking.id.slice(-6)} recorded as ${data.method}`,
        },
      })
    }

    await notify(tx, {
      userId: booking.customerId,
      type: "PAYMENT",
      title: "Payment record updated",
      message: `Your booking payment status is now ${data.status.replaceAll("_", " ").toLowerCase()}.`,
      href: "/bookings",
    })

    await audit(tx, {
      actorId: user.id,
      action: `PAYMENT_${data.status}`,
      entityType: "Booking",
      entityId: booking.id,
      metadata: { method: data.method },
    })
  })

  revalidatePath("/provider/payments")
  revalidatePath("/bookings")
  return { ok: true as const }
}

const requestPayoutSchema = z.object({
  amount: z.number({ message: "Please enter a valid amount" }).positive("Amount must be greater than 0"),
  accountNumber: z.string().trim().min(9, "Account or MoMo number must be at least 9 digits").max(15, "Account number is too long"),
  accountNetwork: z.string().trim().min(1, "Please select a network"),
})

export async function requestPayout(input: z.infer<typeof requestPayoutSchema>) {
  const user = await requireRole("PROVIDER")
  
  const parsed = requestPayoutSchema.safeParse(input)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid withdrawal input."
    return { ok: false as const, message: errorMsg }
  }

  const { amount, accountNumber, accountNetwork } = parsed.data

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true, user: { select: { walletBalance: true } } },
  })

  if (!provider) {
    return { ok: false as const, message: "Provider account not found." }
  }

  // Calculate provider completed earnings balance
  const completedBookings = await prisma.booking.findMany({
    where: { providerId: provider.id, status: "COMPLETED" },
    select: { amount: true, agreedAmount: true },
  })

  const totalEarned = completedBookings.reduce(
    (sum, b) => sum + (b.amount ?? b.agreedAmount ?? 0),
    0
  )

  const payoutRequests = await prisma.payoutRequest.findMany({
    where: { providerId: provider.id, status: { in: ["PENDING", "APPROVED"] } },
    select: { amount: true, status: true },
  })

  const pendingPayouts = payoutRequests
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0)

  const completedPayouts = payoutRequests
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + p.amount, 0)

  const availableBalance = Math.max(0, totalEarned - completedPayouts - pendingPayouts)

  if (amount > availableBalance) {
    return {
      ok: false as const,
      message: `Requested payout amount (GH₵${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) exceeds available wallet balance (GH₵${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`,
    }
  }

  const payout = await prisma.$transaction(async (tx) => {
    // Create PayoutRequest with status = "PENDING"
    const record = await tx.payoutRequest.create({
      data: {
        providerId: provider.id,
        amount,
        accountNumber,
        accountNetwork,
        status: "PENDING",
      },
    })

    // Update user wallet balance if applicable
    if (provider.user.walletBalance >= amount) {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: amount } },
      })
    }

    await tx.walletTransaction.create({
      data: {
        userId: user.id,
        amount,
        type: "DEBIT",
        description: `Payout request for ${accountNetwork} MoMo (${accountNumber})`,
      },
    })

    // Audit event log
    await audit(tx, {
      actorId: user.id,
      action: "REQUEST_PAYOUT",
      entityType: "PayoutRequest",
      entityId: record.id,
      metadata: { amount, accountNumber, accountNetwork },
    })

    return record
  })

  revalidatePath("/provider/payments")
  return { ok: true as const, payoutId: payout.id }
}
