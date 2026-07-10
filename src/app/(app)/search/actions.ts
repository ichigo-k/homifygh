"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { availabilityError } from "@/lib/availability"
import { audit, notify } from "@/lib/events"

const bookingSchema = z.object({ providerId: z.string().min(1), scheduledAt: z.string().min(1), address: z.string().trim().min(3).max(180), notes: z.string().trim().max(800).optional() })

export async function createBooking(input: z.infer<typeof bookingSchema>) {
  const user = await requireRole("CUSTOMER")
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) throw new Error("Check the booking details and try again.")
  const provider = await prisma.provider.findFirst({
    where: { id: parsed.data.providerId, status: "APPROVED", storeSetupComplete: true },
    select: { id: true, userId: true, category: true, bookingLeadHours: true, workingDays: true, workStart: true, workEnd: true, unavailableDates: true },
  })
  if (!provider) throw new Error("This provider is not currently available.")
  const scheduledAt = new Date(parsed.data.scheduledAt)
  if (Number.isNaN(scheduledAt.getTime())) throw new Error("Pick a valid date and time.")
  const availabilityMessage = availabilityError(provider, scheduledAt)
  if (availabilityMessage) throw new Error(availabilityMessage)
  const conflict = await prisma.booking.findFirst({ where: { providerId: provider.id, scheduledAt, status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } }, select: { id: true } })
  if (conflict) throw new Error("That time is already reserved. Choose another time.")
  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({ data: { customerId: user.id, providerId: provider.id, category: provider.category, scheduledAt, address: parsed.data.address, notes: parsed.data.notes || null } })
    await notify(tx, { userId: provider.userId, type: "BOOKING", title: "New booking request", message: `${user.name} requested a service for ${scheduledAt.toLocaleString("en-GH")}.`, href: "/provider" })
    await audit(tx, { actorId: user.id, action: "BOOKING_CREATED", entityType: "Booking", entityId: created.id })
    return created
  })
  revalidatePath("/bookings")
  revalidatePath("/provider")
  return { ok: true as const, bookingId: booking.id }
}
