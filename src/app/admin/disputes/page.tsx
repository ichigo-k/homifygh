import { prisma } from "@/lib/prisma"
import { DisputesClient } from "./disputes-client"

export default async function AdminDisputesPage() {
  const [disputes, complaints] = await Promise.all([
    prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, email: true } }, provider: { select: { storeName: true, user: { select: { name: true } } } }, booking: { select: { amount: true, scheduledAt: true } } },
    }),
    prisma.complaint.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } } } }),
  ])
  return <DisputesClient
    disputes={disputes.map((d) => ({ id: d.id, reason: d.reason, details: d.details, status: d.status, resolution: d.resolution, customer: d.customer.name, customerEmail: d.customer.email, provider: d.provider.storeName ?? d.provider.user.name, amount: d.booking.amount, scheduledAt: d.booking.scheduledAt.toISOString() }))}
    complaints={complaints.map((c) => ({ id: c.id, subject: c.subject, category: c.category, message: c.message, status: c.status, response: c.response, customer: c.user.name, customerEmail: c.user.email, createdAt: c.createdAt.toISOString() }))}
  />
}
