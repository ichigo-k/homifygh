"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit, notify } from "@/lib/events"

type Result = { ok: true } | { ok: false; message: string }

const CONTESTED = "This withdrawal has already been actioned."

const settleSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("PAY"), id: z.string().min(1), reference: z.string().trim().min(2).max(100) }),
  z.object({ action: z.literal("REJECT"), id: z.string().min(1), note: z.string().trim().min(5).max(300) }),
])

export async function settleWithdrawal(input: z.infer<typeof settleSchema>): Promise<Result> {
  const admin = await requireRole("ADMIN")
  const parsed = settleSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: input.action === "PAY" ? "Enter the transfer reference." : "Explain why this was not paid, in at least a few words." }
  const data = parsed.data

  const settled = await prisma.$transaction(async (tx) => {
    // Claiming PENDING is what stops two admins double-refunding the same row.
    const { count } = await tx.withdrawal.updateMany({
      where: { id: data.id, status: "PENDING" },
      data: data.action === "PAY"
        ? { status: "PAID", reference: data.reference, reviewedById: admin.id, processedAt: new Date() }
        : { status: "REJECTED", note: data.note, reviewedById: admin.id, processedAt: new Date() },
    })
    if (!count) return null
    const row = await tx.withdrawal.findUniqueOrThrow({ where: { id: data.id }, select: { userId: true, amount: true } })
    if (data.action === "REJECT") {
      // The balance was debited when the request was made — give it back.
      await tx.user.update({ where: { id: row.userId }, data: { walletBalance: { increment: row.amount } } })
      await tx.walletTransaction.create({ data: { userId: row.userId, amount: row.amount, type: "CREDIT", description: "Withdrawal not paid — refund" } })
    }
    return row
  })
  if (!settled) return { ok: false, message: CONTESTED }

  try {
    await notify(prisma, {
      userId: settled.userId,
      type: "PAYMENT",
      title: data.action === "PAY" ? "Withdrawal paid" : "Withdrawal not paid",
      message: data.action === "PAY"
        ? `GH₵${settled.amount.toLocaleString()} was sent to your account. Reference ${data.reference}.`
        : `Your GH₵${settled.amount.toLocaleString()} withdrawal was not paid and the money is back in your wallet. ${data.note}`,
      href: "/provider/withdraw",
    })
    await audit(prisma, { actorId: admin.id, action: `WITHDRAWAL_${data.action === "PAY" ? "PAID" : "REJECTED"}`, entityType: "Withdrawal", entityId: data.id, metadata: { amount: settled.amount } })
  } catch (err) {
    console.error("[settleWithdrawal] side-effect failed:", err)
  }

  revalidatePath("/admin/withdrawals")
  revalidatePath("/provider/withdraw")
  revalidatePath("/provider")
  return { ok: true }
}
