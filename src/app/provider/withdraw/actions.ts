"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"
import { withdrawalError } from "@/lib/payouts"

type Result = { ok: true } | { ok: false; message: string }

const payoutSchema = z.object({
  method: z.enum(["MOBILE_MONEY", "BANK_TRANSFER"]),
  accountName: z.string().trim().min(2).max(80),
  accountNumber: z.string().trim().min(6).max(32),
})

export async function savePayoutDetails(input: z.infer<typeof payoutSchema>): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const parsed = payoutSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Enter the account name and a valid account or wallet number." }
  await prisma.provider.update({ where: { userId: user.id }, data: { payoutMethod: parsed.data.method, payoutAccountName: parsed.data.accountName, payoutAccountNumber: parsed.data.accountNumber } })
  await audit(prisma, { actorId: user.id, action: "PAYOUT_DETAILS_UPDATED", entityType: "Provider", entityId: user.id })
  revalidatePath("/provider/withdraw")
  return { ok: true }
}

export async function requestWithdrawal(amount: number): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const provider = await prisma.provider.findUnique({ where: { userId: user.id }, select: { payoutMethod: true, payoutAccountName: true, payoutAccountNumber: true } })
  if (!provider?.payoutMethod || !provider.payoutAccountName || !provider.payoutAccountNumber) return { ok: false, message: "Add your payout details before requesting a withdrawal." }

  const account = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { walletBalance: true } })
  const invalid = withdrawalError(amount, account.walletBalance)
  if (invalid) return { ok: false, message: invalid }

  // The debit is what reserves the money: applied conditionally on the balance
  // still covering it, so two requests submitted together can't both succeed
  // against the same funds. The withdrawal row is only written if it lands.
  const created = await prisma.$transaction(async (tx) => {
    const { count } = await tx.user.updateMany({ where: { id: user.id, walletBalance: { gte: amount } }, data: { walletBalance: { decrement: amount } } })
    if (!count) return null
    await tx.walletTransaction.create({ data: { userId: user.id, amount, type: "DEBIT", description: "Withdrawal requested" } })
    return tx.withdrawal.create({ data: { userId: user.id, amount, method: provider.payoutMethod!, accountName: provider.payoutAccountName!, accountNumber: provider.payoutAccountNumber! }, select: { id: true } })
  })
  if (!created) return { ok: false, message: "Your balance changed. Refresh and try again." }

  await audit(prisma, { actorId: user.id, action: "WITHDRAWAL_REQUESTED", entityType: "Withdrawal", entityId: created.id, metadata: { amount } })
  revalidatePath("/provider/withdraw")
  revalidatePath("/provider")
  revalidatePath("/provider/payments")
  revalidatePath("/admin/withdrawals")
  return { ok: true }
}

/** A provider can pull back their own request while nobody has actioned it. */
export async function cancelWithdrawal(id: string): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const refunded = await prisma.$transaction(async (tx) => {
    const { count } = await tx.withdrawal.updateMany({ where: { id, userId: user.id, status: "PENDING" }, data: { status: "REJECTED", note: "Cancelled by you", processedAt: new Date() } })
    if (!count) return null
    const row = await tx.withdrawal.findUniqueOrThrow({ where: { id }, select: { amount: true } })
    await tx.user.update({ where: { id: user.id }, data: { walletBalance: { increment: row.amount } } })
    await tx.walletTransaction.create({ data: { userId: user.id, amount: row.amount, type: "CREDIT", description: "Withdrawal cancelled — refund" } })
    return row
  })
  if (!refunded) return { ok: false, message: "This withdrawal has already been actioned." }

  await audit(prisma, { actorId: user.id, action: "WITHDRAWAL_CANCELLED", entityType: "Withdrawal", entityId: id })
  revalidatePath("/provider/withdraw")
  revalidatePath("/provider")
  revalidatePath("/admin/withdrawals")
  return { ok: true }
}
