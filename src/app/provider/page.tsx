import Link from "next/link"
import { redirect } from "next/navigation"
import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Calendar, Star, Store, Clock, CheckCircle2, Settings } from "lucide-react"

export default async function ProviderPortalPage() {
  const user = await requireRole("PROVIDER")
  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    include: { _count: { select: { bookings: true } } },
  })
  if (!provider) redirect("/onboarding/provider/pending")
  if (!provider.storeSetupComplete) redirect("/provider/store/setup")

  const stats = [
    { label: "Bookings", value: provider._count.bookings, icon: Calendar },
    { label: "Rating", value: provider.avgRating.toFixed(1), icon: Star },
    { label: "Reviews", value: provider.totalReviews, icon: CheckCircle2 },
  ]

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Store header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
            <Store className="h-7 w-7" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{provider.storeName}</h1>
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {provider.category} · {provider.locationLabel}
            </p>
          </div>
        </div>
        <Link
          href="/provider/store/setup"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
        >
          <Settings className="h-4 w-4" /> Edit store
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Bookings placeholder */}
      <div className="mt-4 rounded-2xl border border-border/60 bg-card">
        <div className="border-b border-border/50 px-5 py-3">
          <p className="text-sm font-medium">Incoming bookings</p>
        </div>
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No bookings yet — they&apos;ll appear here.</p>
        </div>
      </div>
    </div>
  )
}
