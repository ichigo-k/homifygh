import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react"

export default async function AdminOverviewPage() {
  const [pending, approved, rejected] = await Promise.all([
    prisma.provider.count({ where: { status: "PENDING" } }),
    prisma.provider.count({ where: { status: "APPROVED" } }),
    prisma.provider.count({ where: { status: "REJECTED" } }),
  ])

  const stats = [
    { label: "Pending review", value: pending, icon: Clock, tone: "text-warm-foreground" },
    { label: "Approved", value: approved, icon: CheckCircle2, tone: "text-primary" },
    { label: "Rejected", value: rejected, icon: XCircle, tone: "text-destructive" },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h1 className="text-base font-semibold">Moderation overview</h1>
          <p className="text-xs text-muted-foreground">Provider applications at a glance</p>
        </div>
        <Link
          href="/admin/providers"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          Review queue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-lg border border-border/50 bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className={`h-4 w-4 ${tone}`} />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
