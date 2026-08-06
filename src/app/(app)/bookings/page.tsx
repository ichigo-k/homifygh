import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { BookingsClient, type BookingItem } from "./bookings-client"

export default async function BookingsPage() {
  const user = await requireRole("CUSTOMER")
  const rows = await prisma.booking.findMany({
    where: { customerId: user.id },
    orderBy: { scheduledAt: "desc" },
    include: { review: { select: { rating: true } }, provider: { select: { storeName: true, user: { select: { name: true } } } } },
  })
  const bookings: BookingItem[] = rows.map((booking) => ({
    id: booking.id, category: booking.category, status: booking.status,
    scheduledAt: booking.scheduledAt.toISOString(), address: booking.address,
    amount: booking.amount, depositAmount: booking.depositAmount, providerName: booking.provider.storeName ?? booking.provider.user.name,
    reviewed: Boolean(booking.review), reviewRating: booking.review?.rating ?? null,
  }))
  return <BookingsClient bookings={bookings} />
}
