import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Clock, CheckCircle2, XCircle, ArrowRight, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react"

export default async function AdminOverviewPage() {
  const [pending, approved, rejected] = await Promise.all([
    prisma.provider.count({ where: { status: "PENDING" } }),
    prisma.provider.count({ where: { status: "APPROVED" } }),
    prisma.provider.count({ where: { status: "REJECTED" } }),
  ])

  const total = pending + approved + rejected
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0
  const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0
  const rejectedPct = total > 0 ? 100 - pendingPct - approvedPct : 0

  const stats = [
    {
      label: "Pending Review",
      value: pending,
      percentage: pendingPct,
      icon: Clock,
      colorClass: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30",
      barColor: "bg-amber-500",
      description: "Applications waiting for validation",
    },
    {
      label: "Approved Providers",
      value: approved,
      percentage: approvedPct,
      icon: CheckCircle2,
      colorClass: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30",
      barColor: "bg-emerald-500",
      description: "Vetted and active on the platform",
    },
    {
      label: "Rejected Applications",
      value: rejected,
      percentage: rejectedPct,
      icon: XCircle,
      colorClass: "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30",
      barColor: "bg-rose-500",
      description: "Declined applications with notes",
    },
  ]

  const recentActivities = [
    { user: "Kofi Owusu", action: "Approved", time: "2 hours ago", status: "APPROVED" },
    { user: "Abena Kuffour", action: "Rejected (Blurry Ghana Card)", time: "5 hours ago", status: "REJECTED" },
    { user: "Emmanuel Mensah", action: "Submitted KYC", time: "1 day ago", status: "PENDING" },
    { user: "Ama Boateng", action: "Approved", time: "2 days ago", status: "APPROVED" },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 fade-in">
      {/* ─── HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Moderation Center
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-2">Overview</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage provider verification applications</p>
        </div>
        <Link
          href="/admin/providers"
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-primary-hover hover:shadow-[var(--shadow-md)] transition-all"
        >
          <span>Open Review Queue</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* ─── STATS GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(({ label, value, percentage, icon: Icon, colorClass, barColor, description }) => (
          <div
            key={label}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/40 bg-card p-6 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[var(--shadow-md)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
            
            <div className="mt-6 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>Composition</span>
                <span className="text-foreground">{percentage}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── SECONDARY SECTIONS ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composition Bar */}
        <div className="lg:col-span-2 rounded-2xl border border-border/40 bg-card p-6 shadow-[var(--shadow-sm)] space-y-5">
          <div>
            <h3 className="text-sm font-bold text-foreground">Verification Queue Composition</h3>
            <p className="text-xs text-muted-foreground">Proportion of applications by current status</p>
          </div>
          
          <div className="space-y-4">
            {/* Visual multi-segment progress bar */}
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${approvedPct}%` }} title={`Approved: ${approvedPct}%`} />
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${pendingPct}%` }} title={`Pending: ${pendingPct}%`} />
              <div className="h-full bg-rose-500 transition-all" style={{ width: `${rejectedPct}%` }} title={`Rejected: ${rejectedPct}%`} />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/40">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Approved ({approved})</span>
                </div>
                <p className="text-base font-bold text-foreground pl-3.5">{approvedPct}%</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Pending ({pending})</span>
                </div>
                <p className="text-base font-bold text-foreground pl-3.5">{pendingPct}%</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Rejected ({rejected})</span>
                </div>
                <p className="text-base font-bold text-foreground pl-3.5">{rejectedPct}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-[var(--shadow-sm)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Latest moderation actions</p>
          </div>

          <div className="space-y-3.5">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-xs">
                <div className="flex gap-2.5">
                  <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    act.status === "APPROVED" ? "bg-emerald-500" : act.status === "REJECTED" ? "bg-rose-500" : "bg-amber-500"
                  }`} />
                  <div>
                    <p className="font-semibold text-foreground">{act.user}</p>
                    <p className="text-[11px] text-muted-foreground">{act.action}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground/80 whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
