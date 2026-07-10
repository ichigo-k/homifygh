"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

const bookingSchema = z.object({ providerId: z.string().min(1), scheduledAt: z.string().min(1), address: z.string().trim().min(3).max(180), notes: z.string().trim().max(800).optional() })

export async function createBooking(input: z.infer<typeof bookingSchema>) {
  const user = await requireRole("CUSTOMER")
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) throw new Error("Check the booking details and try again.")
  const provider = await prisma.provider.findFirst({ where: { id: parsed.data.providerId, status: "APPROVED", storeSetupComplete: true }, select: { id: true, category: true } })
  if (!provider) throw new Error("This provider is not currently available.")
  const scheduledAt = new Date(parsed.data.scheduledAt)
  if (Number.isNaN(scheduledAt.getTime())) throw new Error("Pick a valid date and time.")
  if (scheduledAt.getTime() < Date.now() + 30 * 60 * 1000) throw new Error("Pick a time at least 30 minutes from now.")
  await prisma.booking.create({ data: { customerId: user.id, providerId: provider.id, category: provider.category, scheduledAt, address: parsed.data.address, notes: parsed.data.notes || null } })
  revalidatePath("/bookings")
}
