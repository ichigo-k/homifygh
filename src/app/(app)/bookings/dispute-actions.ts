"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit, notify } from "@/lib/events"

const schema = z.object({ bookingId: z.string().min(1), reason: z.string().trim().min(3).max(80), details: z.string().trim().min(20).max(1200) })
export async function openDispute(input: z.infer<typeof schema>) { const user = await requireRole("CUSTOMER"); const data = schema.parse(input); const booking = await prisma.booking.findFirst({ where: { id: data.bookingId, customerId: user.id }, select: { id: true, providerId: true, provider: { select: { userId: true } }, dispute: { select: { id: true } } } }); if (!booking || booking.dispute) return { ok: false as const, message: "This booking cannot be disputed." }; const dispute = await prisma.$transaction(async (tx) => { const created = await tx.dispute.create({ data: { bookingId: booking.id, customerId: user.id, providerId: booking.providerId, reason: data.reason, details: data.details } }); await notify(tx, { userId: booking.provider.userId, type: "SYSTEM", title: "Booking dispute opened", message: "A customer reported a problem with a booking. The Homify team will review it.", href: "/provider" }); await audit(tx, { actorId: user.id, action: "DISPUTE_OPENED", entityType: "Dispute", entityId: created.id }); return created }); revalidatePath("/bookings"); return { ok: true as const, id: dispute.id } }
