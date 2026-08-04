import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/components/back-button"
import { WalletClient, type WalletTxn } from "./wallet-client"

export default async function WalletPage() {
  const user = await requireRole("CUSTOMER")
  const [account, txns] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { walletBalance: true } }),
    prisma.walletTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
  ])
  const transactions: WalletTxn[] = txns.map((t) => ({
    id: t.id, amount: t.amount, type: t.type, description: t.description, createdAt: t.createdAt.toISOString(),
  }))

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <BackButton className="mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Payments</p>
        <h1 className="mt-1 text-3xl font-extrabold">Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">Deposit funds and use them towards your bookings.</p>
        <WalletClient balance={account?.walletBalance ?? 0} transactions={transactions} />
      </div>
    </main>
  )
}
