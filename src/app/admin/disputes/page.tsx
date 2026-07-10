import { prisma } from "@/lib/prisma"
import { DisputesClient } from "./disputes-client"

export default async function AdminDisputesPage() { const disputes = await prisma.dispute.findMany({ orderBy: { createdAt: "desc" }, include: { customer: { select: { name: true, email: true } }, provider: { select: { storeName: true, user: { select: { name: true } } } }, booking: { select: { amount: true, scheduledAt: true } } } }); return <DisputesClient disputes={disputes.map((d) => ({ id: d.id, reason: d.reason, details: d.details, status: d.status, resolution: d.resolution, customer: d.customer.name, customerEmail: d.customer.email, provider: d.provider.storeName ?? d.provider.user.name, amount: d.booking.amount, scheduledAt: d.booking.scheduledAt.toISOString() }))} /> }
