"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit, notify } from "@/lib/events"

const schema = z.object({ id: z.string().min(1), status: z.enum(["REVIEWING", "RESOLVED", "DISMISSED"]), resolution: z.string().trim().min(10).max(1000) })
export async function resolveDispute(input: z.infer<typeof schema>) { const admin = await requireRole("ADMIN"); const data = schema.parse(input); const dispute = await prisma.dispute.findUniqueOrThrow({ where: { id: data.id }, select: { customerId: true, provider: { select: { userId: true } } } }); await prisma.$transaction(async (tx) => { await tx.dispute.update({ where: { id: data.id }, data: { status: data.status, resolution: data.resolution, resolvedAt: data.status === "RESOLVED" || data.status === "DISMISSED" ? new Date() : null } }); for (const userId of [dispute.customerId, dispute.provider.userId]) await notify(tx, { userId, type: "SYSTEM", title: "Dispute updated", message: data.resolution, href: "/bookings" }); await audit(tx, { actorId: admin.id, action: `DISPUTE_${data.status}`, entityType: "Dispute", entityId: data.id }) }); revalidatePath("/admin/disputes"); return { ok: true as const } }

const complaintSchema = z.object({ id: z.string().min(1), status: z.enum(["IN_REVIEW", "RESOLVED"]), response: z.string().trim().min(5).max(1000) })
export async function resolveComplaint(input: z.infer<typeof complaintSchema>) { const admin = await requireRole("ADMIN"); const data = complaintSchema.parse(input); const complaint = await prisma.complaint.findUniqueOrThrow({ where: { id: data.id }, select: { userId: true } }); await prisma.$transaction(async (tx) => { await tx.complaint.update({ where: { id: data.id }, data: { status: data.status, response: data.response } }); await notify(tx, { userId: complaint.userId, type: "SYSTEM", title: "Complaint updated", message: data.response, href: "/complaints" }); await audit(tx, { actorId: admin.id, action: `COMPLAINT_${data.status}`, entityType: "Complaint", entityId: data.id }) }); revalidatePath("/admin/disputes"); revalidatePath("/complaints"); return { ok: true as const } }

export async function deleteComplaintAdmin(complaintId: string) {
  const admin = await requireRole("ADMIN")
  const result = await prisma.complaint.deleteMany({ where: { id: complaintId } })
  if (!result.count) return { ok: false as const, message: "Complaint not found." }
  await audit(prisma, { actorId: admin.id, action: "COMPLAINT_DELETED", entityType: "Complaint", entityId: complaintId })
  revalidatePath("/admin/disputes")
  revalidatePath("/complaints")
  return { ok: true as const }
}
