import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/components/back-button"
import { ComplaintsClient, type ComplaintItem } from "./complaints-client"

export default async function ComplaintsPage() {
  const user = await requireRole("CUSTOMER")
  const rows = await prisma.complaint.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 })
  const complaints: ComplaintItem[] = rows.map((c) => ({
    id: c.id, subject: c.subject, category: c.category, message: c.message,
    status: c.status, response: c.response, createdAt: c.createdAt.toISOString(),
  }))

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <BackButton className="mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Support</p>
        <h1 className="mt-1 text-3xl font-extrabold">Complaints</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tell us what went wrong and we&apos;ll look into it.</p>
        <ComplaintsClient complaints={complaints} />
      </div>
    </main>
  )
}
