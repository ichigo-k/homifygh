import { prisma } from "@/lib/prisma"
import { AdminBookingsClient } from "./bookings-client"

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { customer: { select: { name: true, email: true } }, provider: { select: { storeName: true, user: { select: { name: true } } } }, dispute: { select: { status: true } } } })
  return <div className="mx-auto max-w-7xl p-6">
    <p className="text-xs font-bold uppercase tracking-wider text-primary">Operations</p>
    <h1 className="mt-1 text-3xl font-extrabold">Booking oversight</h1>
    <p className="mt-1 text-sm text-muted-foreground">Monitor job progress, payments and disputes across the marketplace.</p>
    <AdminBookingsClient bookings={bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      providerName: booking.provider.storeName ?? booking.provider.user.name,
      scheduledAt: booking.scheduledAt.toISOString(),
      address: booking.address,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: booking.amount,
      depositAmount: booking.depositAmount,
      disputeStatus: booking.dispute?.status ?? null,
    }))} />
  </div>
}
