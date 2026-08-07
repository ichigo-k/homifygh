import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { WithdrawalsClient, type AdminWithdrawal } from "./withdrawals-client"

export default async function AdminWithdrawalsPage() {
  await requireRole("ADMIN")
  const rows = await prisma.withdrawal.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 200,
    include: { user: { select: { name: true, email: true, phone: true, provider: { select: { storeName: true } } } } },
  })
  const withdrawals: AdminWithdrawal[] = rows.map((row) => ({
    id: row.id, amount: row.amount, status: row.status, method: row.method,
    accountName: row.accountName, accountNumber: row.accountNumber,
    reference: row.reference, note: row.note,
    createdAt: row.createdAt.toISOString(), processedAt: row.processedAt?.toISOString() ?? null,
    storeName: row.user.provider?.storeName ?? row.user.name, email: row.user.email, phone: row.user.phone,
  }))
  return <WithdrawalsClient withdrawals={withdrawals} />
}
