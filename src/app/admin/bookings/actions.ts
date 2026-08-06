"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"

export async function deleteBookingAdmin(bookingId: string) {
  const admin = await requireRole("ADMIN")
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, providerId: true, review: { select: { id: true } } },
  })
  if (!booking) return { ok: false as const, message: "Booking not found." }

  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { bookingId } })
    await tx.dispute.deleteMany({ where: { bookingId } })
    await tx.booking.delete({ where: { id: bookingId } })
    if (booking.review) {
      const ratings = await tx.review.aggregate({ where: { providerId: booking.providerId }, _avg: { rating: true }, _count: { rating: true } })
      await tx.provider.update({ where: { id: booking.providerId }, data: { avgRating: ratings._avg.rating ?? 0, totalReviews: ratings._count.rating } })
    }
  })
  await audit(prisma, { actorId: admin.id, action: "BOOKING_DELETED", entityType: "Booking", entityId: bookingId })

  revalidatePath("/admin/bookings")
  revalidatePath("/bookings")
  revalidatePath("/provider")
  return { ok: true as const }
}
