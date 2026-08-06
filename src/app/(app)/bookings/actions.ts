"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export async function rebookBooking(bookingId: string) {
  const user = await requireRole("CUSTOMER")
  const previous = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: user.id },
    include: { provider: { select: { status: true, storeSetupComplete: true } } },
  })
  if (!previous) return { ok: false as const, message: "Booking not found." }
  if (previous.provider.status !== "APPROVED" || !previous.provider.storeSetupComplete) {
    return { ok: false as const, message: "This provider is not currently accepting bookings." }
  }
  const scheduledAt = new Date()
  scheduledAt.setDate(scheduledAt.getDate() + 7)
  scheduledAt.setHours(10, 0, 0, 0)
  await prisma.booking.create({ data: { customerId: user.id, providerId: previous.providerId, category: previous.category, scheduledAt, address: previous.address, notes: previous.notes } })
  revalidatePath("/bookings")
  return { ok: true as const }
}

export async function cancelBooking(bookingId: string) {
  const user = await requireRole("CUSTOMER")
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, customerId: user.id, status: { in: ["PENDING", "ACCEPTED"] } },
    data: { status: "CANCELLED" },
  })
  if (!result.count) return { ok: false as const, message: "This booking can no longer be cancelled." }
  revalidatePath("/bookings")
  revalidatePath("/provider")
  return { ok: true as const }
}

/** Permanently remove a cancelled booking from the customer's history. */
export async function deleteBooking(bookingId: string) {
  const user = await requireRole("CUSTOMER")
  // Only the owner, and only CANCELLED bookings, can be deleted — active or
  // completed jobs stay for the record. Reviews are removed alongside.
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: user.id, status: "CANCELLED" },
    select: { id: true },
  })
  if (!booking) return { ok: false as const, message: "Only cancelled bookings can be deleted." }
  await prisma.$transaction([
    prisma.review.deleteMany({ where: { bookingId } }),
    prisma.booking.delete({ where: { id: bookingId } }),
  ])
  revalidatePath("/bookings")
  revalidatePath("/admin/bookings")
  return { ok: true as const }
}

const reviewSchema = z.object({ bookingId: z.string().min(1), rating: z.number().int().min(1).max(5), comment: z.string().trim().max(600) })

export async function submitReview(input: z.infer<typeof reviewSchema>) {
  const user = await requireRole("CUSTOMER")
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, message: "Choose a rating from 1 to 5 stars." }
  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data.bookingId, customerId: user.id, status: "COMPLETED" },
    select: { providerId: true, review: { select: { id: true } } },
  })
  if (!booking) return { ok: false as const, message: "Only completed jobs can be reviewed." }
  if (booking.review) return { ok: false as const, message: "You have already reviewed this job." }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({ data: { bookingId: parsed.data.bookingId, customerId: user.id, providerId: booking.providerId, rating: parsed.data.rating, comment: parsed.data.comment || null } })
    const ratings = await tx.review.aggregate({ where: { providerId: booking.providerId }, _avg: { rating: true }, _count: { rating: true } })
    await tx.provider.update({ where: { id: booking.providerId }, data: { avgRating: ratings._avg.rating ?? 0, totalReviews: ratings._count.rating } })
  })
  revalidatePath("/bookings")
  revalidatePath("/search")
  revalidatePath("/provider")
  return { ok: true as const }
}
