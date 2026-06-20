import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import type { ProviderStatus } from "@prisma/client"

const TABS: { label: string; value: ProviderStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

export default async function ProviderQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const active = (TABS.find((t) => t.value === status)?.value ?? "PENDING") as ProviderStatus

  const providers = await prisma.provider.findMany({
    where: { status: active },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="p-6">
      <div className="border-b border-border/50 pb-4">
        <h1 className="text-base font-semibold">Provider review</h1>
        <p className="text-xs text-muted-foreground">KYC applications</p>
      </div>

      {/* Status tabs */}
      <div className="mt-4 flex gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/admin/providers?status=${t.value}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active === t.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 divide-y divide-border/50 rounded-lg border border-border/50 bg-card">
        {providers.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No {active.toLowerCase()} applications.
          </p>
        )}
        {providers.map((p) => (
          <Link
            key={p.id}
            href={`/admin/providers/${p.id}`}
            className="group flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
                {(p.user.firstName?.[0] ?? p.user.name[0] ?? "?").toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium">{p.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category} · {p.locationLabel ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">{p.category}</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
