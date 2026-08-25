import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { PaymentsClient } from "./payments-client"

export const dynamic = "force-dynamic"

export default async function ProviderPaymentsPage() {
  const user = await requireRole("PROVIDER")
  const provider = await prisma.provider.findUniqueOrThrow({
    where: { userId: user.id },
    select: {
      id: true,
      user: { select: { walletBalance: true } },
    },
  })

  const bookings = await prisma.booking.findMany({
    where: { providerId: provider.id, amount: { not: null } },
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  })

  const payouts = await prisma.payoutRequest.findMany({
    where: { providerId: provider.id },
    orderBy: { createdAt: "desc" },
  })

  const totalEarned = bookings
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + (b.agreedAmount || b.amount || 0), 0)

  const pendingPayoutTotal = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <PaymentsClient
      walletBalance={provider.user.walletBalance}
      totalEarned={totalEarned}
      pendingPayoutTotal={pendingPayoutTotal}
      bookings={bookings.map((b) => ({
        id: b.id,
        customerName: b.customer.name,
        amount: b.agreedAmount || b.amount!,
        status: b.paymentStatus,
        method: b.paymentMethod,
        reference: b.paymentReference,
        date: b.scheduledAt.toISOString(),
      }))}
      payouts={payouts.map((p) => ({
        id: p.id,
        amount: p.amount,
        accountNumber: p.accountNumber,
        accountNetwork: p.accountNetwork,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  )
}
