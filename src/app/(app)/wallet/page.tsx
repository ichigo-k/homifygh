import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/components/back-button"
import { WalletClient, type WalletTxn } from "./wallet-client"

export default async function WalletPage() {
  const user = await requireRole("CUSTOMER")
  const [account, txns, activeHolds, completedAgg, refundedAgg] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { walletBalance: true } }),
    prisma.walletTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    // Money currently reserved against jobs that haven't finished yet.
    prisma.booking.findMany({
      where: { customerId: user.id, status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] }, depositAmount: { not: null } },
      select: { depositAmount: true, dispute: { select: { status: true } } },
    }),
    prisma.booking.aggregate({ where: { customerId: user.id, status: "COMPLETED" }, _sum: { amount: true } }),
    prisma.walletTransaction.aggregate({
      where: { userId: user.id, type: "CREDIT", description: { contains: "refund", mode: "insensitive" } },
      _sum: { amount: true },
    }),
  ])

  const held = activeHolds.reduce((sum, b) => sum + (b.depositAmount ?? 0), 0)
  const inReview = activeHolds
    .filter((b) => b.dispute && (b.dispute.status === "OPEN" || b.dispute.status === "REVIEWING"))
    .reduce((sum, b) => sum + (b.depositAmount ?? 0), 0)

  const transactions: WalletTxn[] = txns.map((t) => ({
    id: t.id, amount: t.amount, type: t.type, description: t.description, createdAt: t.createdAt.toISOString(),
  }))

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <BackButton className="mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Payments</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">Deposit funds and use them towards your bookings.</p>
        <WalletClient
          balance={account?.walletBalance ?? 0}
          held={held}
          inReview={inReview}
          spent={completedAgg._sum.amount ?? 0}
          refunded={refundedAgg._sum.amount ?? 0}
          transactions={transactions}
        />
      </div>
    </main>
  )
}
