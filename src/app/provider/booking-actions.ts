"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("ACCEPT"), bookingId: z.string().min(1), amount: z.coerce.number().positive().max(1_000_000) }),
  z.object({ action: z.literal("DECLINE"), bookingId: z.string().min(1) }),
  z.object({ action: z.literal("START"), bookingId: z.string().min(1) }),
  z.object({ action: z.literal("COMPLETE"), bookingId: z.string().min(1) }),
])

export type ProviderBookingAction = z.infer<typeof updateSchema>

export async function updateProviderBooking(input: ProviderBookingAction) {
  const user = await requireRole("PROVIDER")
  const data = updateSchema.parse(input)

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, storeSetupComplete: true },
  })
  if (!provider || provider.status !== "APPROVED" || !provider.storeSetupComplete) {
    return { ok: false as const, message: "Your store is not ready to manage bookings." }
  }

  const booking = await prisma.booking.findFirst({
    where: { id: data.bookingId, providerId: provider.id },
    select: { status: true },
  })
  if (!booking) return { ok: false as const, message: "Booking not found." }

  const expected = data.action === "ACCEPT" || data.action === "DECLINE"
    ? "PENDING"
    : data.action === "START"
      ? "ACCEPTED"
      : "IN_PROGRESS"
  if (booking.status !== expected) {
    return { ok: false as const, message: "This booking has already changed. Refresh and try again." }
  }

  const nextStatus = data.action === "ACCEPT"
    ? "ACCEPTED"
    : data.action === "DECLINE"
      ? "CANCELLED"
      : data.action === "START"
        ? "IN_PROGRESS"
        : "COMPLETED"

  await prisma.booking.update({
    where: { id: data.bookingId },
    data: {
      status: nextStatus,
      ...(data.action === "ACCEPT" ? { amount: data.amount } : {}),
    },
  })

  revalidatePath("/provider")
  revalidatePath("/bookings")
  return { ok: true as const }
}
