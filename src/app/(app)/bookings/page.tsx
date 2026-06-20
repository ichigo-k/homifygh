import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { BookingsClient, type BookingItem } from "./bookings-client"

export default async function BookingsPage() {
  const user = await requireRole("CUSTOMER")

  const rows = await prisma.booking.findMany({
    where: { customerId: user.id },
    orderBy: { scheduledAt: "desc" },
    include: {
      provider: {
        select: {
          id: true,
          storeName: true,
          user: { select: { name: true } },
        },
      },
    },
  })

  const bookings: BookingItem[] = rows.map((b) => ({
    id: b.id,
    category: b.category,
    status: b.status,
    scheduledAt: b.scheduledAt.toISOString(),
    address: b.address,
    amount: b.amount,
    providerName: b.provider.storeName ?? b.provider.user.name,
  }))

  return <BookingsClient bookings={bookings} />
}
