import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ProvidersClient } from "./providers-client"
import { ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react"
import type { ProviderStatus } from "@prisma/client"

export default async function ProviderQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const active = (["PENDING", "APPROVED", "REJECTED"].includes(status ?? "") ? status : "PENDING") as ProviderStatus

  // Fetch counts and active providers in parallel
  const [pendingCount, approvedCount, rejectedCount, providers] = await Promise.all([
    prisma.provider.count({ where: { status: "PENDING" } }),
    prisma.provider.count({ where: { status: "APPROVED" } }),
    prisma.provider.count({ where: { status: "REJECTED" } }),
    prisma.provider.findMany({
      where: { status: active },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const TABS = [
    { label: "Pending", value: "PENDING", count: pendingCount, icon: Clock, activeColor: "bg-amber-500 text-amber-500 bg-amber-500/10 hover:bg-amber-500/15" },
    { label: "Approved", value: "APPROVED", count: approvedCount, icon: CheckCircle2, activeColor: "bg-emerald-500 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/15" },
    { label: "Rejected", value: "REJECTED", count: rejectedCount, icon: XCircle, activeColor: "bg-rose-500 text-rose-500 bg-rose-500/10 hover:bg-rose-500/15" },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 fade-in">
      {/* ─── HEADER ───────────────────────────────────────────── */}
      <div className="border-b border-border/40 pb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Moderation Center
        </span>
        <h1 className="text-2xl font-black tracking-tight text-foreground mt-2">Provider Review</h1>
        <p className="text-sm text-muted-foreground">Approve or reject verification applications and Ghana Cards</p>
      </div>

      {/* ─── TABS ─────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-border/40 pb-px overflow-x-auto scrollbar-none">
        {TABS.map((t) => {
          const isActive = active === t.value
          const Icon = t.icon
          return (
            <Link
              key={t.value}
              href={`/admin/providers?status=${t.value}`}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t.label}</span>
              <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors ${
                isActive ? t.activeColor : "bg-muted text-muted-foreground"
              }`}>
                {t.count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* ─── CLIENT SEARCH AND LIST CONTAINER ─────────────────── */}
      <ProvidersClient providers={providers} activeStatus={active} />
    </div>
  )
}
