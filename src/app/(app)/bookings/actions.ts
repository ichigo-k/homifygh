"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

/** Re-create a past booking as a fresh PENDING request, scheduled a week out. */
export async function rebookBooking(bookingId: string) {
  const user = await requireRole("CUSTOMER")

  const prev = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: user.id },
  })
  if (!prev) throw new Error("Booking not found.")

  const scheduledAt = new Date()
  scheduledAt.setDate(scheduledAt.getDate() + 7)
  scheduledAt.setHours(10, 0, 0, 0)

  await prisma.booking.create({
    data: {
      customerId: user.id,
      providerId: prev.providerId,
      category: prev.category,
      status: "PENDING",
      scheduledAt,
      address: prev.address,
      notes: prev.notes,
      amount: prev.amount,
    },
  })

  revalidatePath("/bookings")
}

/** Cancel an active booking. */
export async function cancelBooking(bookingId: string) {
  const user = await requireRole("CUSTOMER")

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: user.id },
  })
  if (!booking) throw new Error("Booking not found.")
  if (["COMPLETED", "CANCELLED"].includes(booking.status)) return

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  })

  revalidatePath("/bookings")
}
