import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { AdminComplaintsClient } from "./complaints-client"

export const dynamic = "force-dynamic"

export default async function AdminComplaintsPage() {
  await requireRole("ADMIN")

  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  })

  return (
    <AdminComplaintsClient
      complaints={complaints.map((c) => ({
        id: c.id,
        category: c.category,
        subject: c.subject,
        message: c.message,
        status: c.status,
        response: c.response,
        resolutionNotes: c.resolutionNotes,
        createdAt: c.createdAt.toISOString(),
        userName: c.user.name,
        userEmail: c.user.email,
        userPhone: c.user.phone,
        messages: c.messages.map((m) => ({
          id: m.id,
          senderName: m.senderName,
          senderRole: m.senderRole,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
        })),
      }))}
    />
  )
}
