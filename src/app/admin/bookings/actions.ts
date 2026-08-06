"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"

export async function deleteBookingAdmin(bookingId: string) {
  const admin = await requireRole("ADMIN")
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, providerId: true, customerId: true, depositAmount: true, review: { select: { id: true } } },
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
    // A booking that's still PENDING/ACCEPTED/IN_PROGRESS when an admin
    // deletes it can still have wallet funds held against it — refund them
    // so the money isn't silently lost.
    if (booking.depositAmount) {
      await tx.user.update({ where: { id: booking.customerId }, data: { walletBalance: { increment: booking.depositAmount } } })
      await tx.walletTransaction.create({ data: { userId: booking.customerId, amount: booking.depositAmount, type: "CREDIT", description: "Booking removed by admin — refund" } })
    }
  })
  await audit(prisma, { actorId: admin.id, action: "BOOKING_DELETED", entityType: "Booking", entityId: bookingId })

  revalidatePath("/admin/bookings")
  revalidatePath("/bookings")
  revalidatePath("/provider")
  revalidatePath("/wallet")
  revalidatePath("/more")
  return { ok: true as const }
}
