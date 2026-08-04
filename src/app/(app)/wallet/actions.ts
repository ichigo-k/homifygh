"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"

const depositSchema = z.object({ amount: z.coerce.number().positive().max(100_000) })

/**
 * Demo top-up. No real money moves here — this is a simulated wallet ledger for
 * the demo so home owners can fund and spend against bookings. Real card/bank
 * processing is intentionally out of scope.
 */
export async function depositToWallet(input: z.infer<typeof depositSchema>) {
  const user = await requireRole("CUSTOMER")
  const parsed = depositSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, message: "Enter a valid amount to deposit." }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { walletBalance: { increment: parsed.data.amount } },
    select: { walletBalance: true },
  })
  await prisma.walletTransaction.create({
    data: { userId: user.id, amount: parsed.data.amount, type: "CREDIT", description: "Wallet top-up (demo)" },
  })
  try {
    await audit(prisma, { actorId: user.id, action: "WALLET_DEPOSIT", entityType: "User", entityId: user.id, metadata: { amount: parsed.data.amount } })
  } catch (err) {
    console.error("[depositToWallet] audit failed:", err)
  }

  revalidatePath("/wallet")
  revalidatePath("/more")
  return { ok: true as const, balance: updated.walletBalance }
}
