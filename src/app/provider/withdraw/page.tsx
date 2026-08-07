import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { WithdrawClient, type WithdrawalItem } from "./withdraw-client"

export default async function WithdrawPage() {
  const user = await requireRole("PROVIDER")
  const [account, provider, rows] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { walletBalance: true } }),
    prisma.provider.findUniqueOrThrow({ where: { userId: user.id }, select: { payoutMethod: true, payoutAccountName: true, payoutAccountNumber: true } }),
    prisma.withdrawal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
  ])
  const withdrawals: WithdrawalItem[] = rows.map((row) => ({
    id: row.id, amount: row.amount, status: row.status, method: row.method,
    accountNumber: row.accountNumber, reference: row.reference, note: row.note,
    createdAt: row.createdAt.toISOString(), processedAt: row.processedAt?.toISOString() ?? null,
  }))
  return <WithdrawClient
    balance={account.walletBalance}
    payout={{ method: provider.payoutMethod, accountName: provider.payoutAccountName, accountNumber: provider.payoutAccountNumber }}
    withdrawals={withdrawals}
  />
}
