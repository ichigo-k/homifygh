import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { PaymentsClient } from "./payments-client"

export default async function ProviderPaymentsPage() { const user = await requireRole("PROVIDER"); const provider = await prisma.provider.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } }); const bookings = await prisma.booking.findMany({ where: { providerId: provider.id, amount: { not: null } }, orderBy: { createdAt: "desc" }, include: { customer: { select: { name: true } } } }); return <PaymentsClient bookings={bookings.map((b) => ({ id: b.id, customerName: b.customer.name, amount: b.amount!, status: b.paymentStatus, method: b.paymentMethod, reference: b.paymentReference, date: b.scheduledAt.toISOString() }))} /> }
