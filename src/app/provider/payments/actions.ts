"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit, notify } from "@/lib/events"

const schema = z.object({ bookingId: z.string().min(1), status: z.enum(["UNPAID", "DEPOSIT_PAID", "PAID", "REFUNDED"]), method: z.string().trim().min(2).max(40), reference: z.string().trim().max(100).optional() })
export async function recordPayment(input: z.infer<typeof schema>) {
  const user = await requireRole("PROVIDER")
  const data = schema.parse(input)
  const booking = await prisma.booking.findFirst({ where: { id: data.bookingId, provider: { userId: user.id } }, select: { id: true, customerId: true } })
  if (!booking) return { ok: false as const, message: "Booking not found." }
  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: booking.id }, data: { paymentStatus: data.status, paymentMethod: data.method, paymentReference: data.reference || null, paidAt: data.status === "PAID" ? new Date() : null } })
    await notify(tx, { userId: booking.customerId, type: "PAYMENT", title: "Payment record updated", message: `Your booking payment status is now ${data.status.replaceAll("_", " ").toLowerCase()}.`, href: "/bookings" })
    await audit(tx, { actorId: user.id, action: `PAYMENT_${data.status}`, entityType: "Booking", entityId: booking.id, metadata: { method: data.method } })
  })
  revalidatePath("/provider/payments")
  revalidatePath("/bookings")
  return { ok: true as const }
}
