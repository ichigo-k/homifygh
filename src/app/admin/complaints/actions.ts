"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { notify, audit } from "@/lib/events"

const messageSchema = z.object({
  complaintId: z.string().min(1),
  message: z.string().trim().min(3).max(2000),
})

export async function addAdminComplaintMessage(input: z.infer<typeof messageSchema>) {
  const user = await requireRole("ADMIN")
  const parsed = messageSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, message: "Please enter a message (at least 3 characters)." }
  }

  const complaint = await prisma.complaint.findUnique({
    where: { id: parsed.data.complaintId },
    select: { id: true, userId: true, subject: true },
  })

  if (!complaint) return { ok: false as const, message: "Complaint record not found." }

  await prisma.$transaction(async (tx) => {
    await tx.complaintMessage.create({
      data: {
        complaintId: complaint.id,
        senderId: user.id,
        senderName: user.name || "Administrator",
        senderRole: "ADMIN",
        message: parsed.data.message,
      },
    })

    await tx.complaint.update({
      where: { id: complaint.id },
      data: {
        status: "IN_REVIEW",
        response: parsed.data.message,
      },
    })

    await notify(tx, {
      userId: complaint.userId,
      type: "SYSTEM",
      title: "Complaint Response Update",
      message: `An admin responded to your complaint: "${complaint.subject}".`,
      href: "/complaints",
    })

    await audit(tx, {
      actorId: user.id,
      action: "COMPLAINT_ADMIN_RESPONDED",
      entityType: "Complaint",
      entityId: complaint.id,
    })
  })

  revalidatePath("/admin/complaints")
  revalidatePath("/complaints")
  return { ok: true as const }
}

const resolveSchema = z.object({
  complaintId: z.string().min(1),
  resolutionNotes: z.string().trim().min(5).max(1000),
})

export async function resolveComplaint(input: z.infer<typeof resolveSchema>) {
  const user = await requireRole("ADMIN")
  const parsed = resolveSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, message: "Please provide resolution notes (at least 5 characters)." }
  }

  const complaint = await prisma.complaint.findUnique({
    where: { id: parsed.data.complaintId },
    select: { id: true, userId: true, subject: true },
  })

  if (!complaint) return { ok: false as const, message: "Complaint not found." }

  await prisma.$transaction(async (tx) => {
    await tx.complaint.update({
      where: { id: complaint.id },
      data: {
        status: "RESOLVED",
        resolutionNotes: parsed.data.resolutionNotes,
      },
    })

    await tx.complaintMessage.create({
      data: {
        complaintId: complaint.id,
        senderId: user.id,
        senderName: user.name || "Administrator",
        senderRole: "ADMIN",
        message: `[RESOLVED]: ${parsed.data.resolutionNotes}`,
      },
    })

    await notify(tx, {
      userId: complaint.userId,
      type: "SYSTEM",
      title: "Complaint Resolved",
      message: `Your complaint regarding "${complaint.subject}" has been marked as resolved.`,
      href: "/complaints",
    })

    await audit(tx, {
      actorId: user.id,
      action: "COMPLAINT_RESOLVED",
      entityType: "Complaint",
      entityId: complaint.id,
      metadata: { resolutionNotes: parsed.data.resolutionNotes },
    })
  })

  revalidatePath("/admin/complaints")
  revalidatePath("/complaints")
  return { ok: true as const }
}
