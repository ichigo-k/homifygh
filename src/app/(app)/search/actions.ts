"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

/** Create a PENDING booking request for a provider. */
export async function createBooking(input: {
  providerId: string
  scheduledAt: string // ISO
  address: string
  notes?: string
}) {
  const user = await requireRole("CUSTOMER")

  const provider = await prisma.provider.findFirst({
    where: { id: input.providerId, status: "APPROVED" },
    select: { id: true, category: true },
  })
  if (!provider) throw new Error("Provider not available.")

  if (!input.address.trim()) throw new Error("Address is required.")
  const when = new Date(input.scheduledAt)
  if (Number.isNaN(when.getTime())) throw new Error("Pick a valid date.")

  await prisma.booking.create({
    data: {
      customerId: user.id,
      providerId: provider.id,
      category: provider.category,
      status: "PENDING",
      scheduledAt: when,
      address: input.address.trim(),
      notes: input.notes?.trim() || null,
    },
  })

  revalidatePath("/bookings")
}
