import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { AdminComplaintsClient } from "./complaints-client"

export const dynamic = "force-dynamic"

export default async function AdminTrustSafetyPage() {
  await requireRole("ADMIN")

  const [complaints, disputes] = await Promise.all([
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        provider: { select: { storeName: true, user: { select: { name: true } } } },
        booking: { select: { amount: true, scheduledAt: true } },
      },
    }),
  ])

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
      disputes={disputes.map((d) => ({
        id: d.id,
        reason: d.reason,
        details: d.details,
        status: d.status,
        resolution: d.resolution,
        customer: d.customer.name,
        customerEmail: d.customer.email,
        provider: d.provider.storeName ?? d.provider.user.name,
        amount: d.booking.amount,
        scheduledAt: d.booking.scheduledAt.toISOString(),
        createdAt: d.createdAt.toISOString(),
      }))}
    />
  )
}
