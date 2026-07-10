import Link from "next/link"
import { redirect } from "next/navigation"
import { BriefcaseBusiness, CheckCircle2, Settings, Star, TrendingUp, WalletCards } from "lucide-react"
import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { ProviderBookingsClient, type ProviderBookingItem } from "./provider-bookings-client"

export default async function ProviderPortalPage() {
  const user = await requireRole("PROVIDER")
  const provider = await prisma.provider.findUnique({ where: { userId: user.id }, include: { bookings: { orderBy: { scheduledAt: "asc" }, include: { customer: { select: { name: true, phone: true } } } } } })
  if (!provider) redirect("/onboarding/provider/pending")
  if (!provider.storeSetupComplete) redirect("/provider/store/setup")
  const active = provider.bookings.filter((b) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(b.status))
  const completed = provider.bookings.filter((b) => b.status === "COMPLETED")
  const bookings: ProviderBookingItem[] = provider.bookings.map((b) => ({ id: b.id, category: b.category, status: b.status, scheduledAt: b.scheduledAt.toISOString(), address: b.address, notes: b.notes, amount: b.amount, customerName: b.customer.name, customerPhone: b.customer.phone }))
  return <main className="min-h-screen bg-muted/20"><div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
    <header className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-sm)]"><div className="h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-lime-300" /><div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><BriefcaseBusiness className="h-6 w-6" /></span><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-extrabold tracking-tight">{provider.storeName}</h1><Badge className="gap-1 rounded-full"><CheckCircle2 className="h-3 w-3" />Verified</Badge></div><p className="mt-1 text-sm text-muted-foreground">{provider.category.replaceAll("_", " ")} · {provider.locationLabel}</p></div></div><Link href="/provider/store/setup" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-accent hover:text-primary"><Settings className="h-4 w-4" />Manage store</Link></div></header>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Active jobs" value={active.length.toString()} hint={`${active.filter((b) => b.status === "PENDING").length} need a response`} icon={BriefcaseBusiness} /><Stat label="Completed" value={completed.length.toString()} hint="All-time jobs" icon={CheckCircle2} /><Stat label="Customer rating" value={provider.totalReviews ? provider.avgRating.toFixed(1) : "New"} hint={`${provider.totalReviews} verified reviews`} icon={Star} /><Stat label="Job value" value={`GH₵${completed.reduce((sum, b) => sum + (b.amount ?? 0), 0).toLocaleString()}`} hint="Completed bookings" icon={WalletCards} /></div>
    {active.some((b) => b.status === "PENDING") && <div className="mt-4 flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm"><TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><p><span className="font-semibold">New opportunity waiting.</span> Respond with a clear estimate to help the customer plan confidently.</p></div>}
    <ProviderBookingsClient bookings={bookings} />
  </div></main>
}

function Stat({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: typeof Star }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><Icon className="h-4 w-4 text-primary" /></div><p className="mt-3 text-2xl font-extrabold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>
}
