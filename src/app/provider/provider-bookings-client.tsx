"use client"

import { useMemo, useState, useTransition } from "react"
import {
  CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Loader2,
  MapPin, Play, Search, Sparkles, UserRound, X, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORIES, type CategorySlug } from "@/lib/categories"
import { updateProviderBooking, type ProviderBookingAction } from "./booking-actions"

export type ProviderBookingItem = {
  id: string
  category: string
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  scheduledAt: string
  address: string
  notes: string | null
  amount: number | null
  customerName: string
  customerPhone: string | null
}

const labels = Object.fromEntries(CATEGORIES.map((category) => [category.slug, category.label])) as Record<CategorySlug, string>
const statusMeta = {
  PENDING: { label: "Needs response", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  ACCEPTED: { label: "Confirmed", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  IN_PROGRESS: { label: "In progress", tone: "bg-primary/10 text-primary" },
  COMPLETED: { label: "Completed", tone: "bg-muted text-muted-foreground" },
  CANCELLED: { label: "Cancelled", tone: "bg-red-500/10 text-red-700 dark:text-red-300" },
} as const

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-GH", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export function ProviderBookingsClient({ bookings }: { bookings: ProviderBookingItem[] }) {
  const [filter, setFilter] = useState<"ACTIVE" | "HISTORY">("ACTIVE")
  const [query, setQuery] = useState("")
  const active = useMemo(() => bookings.filter((b) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(b.status)), [bookings])
  const history = useMemo(() => bookings.filter((b) => ["COMPLETED", "CANCELLED"].includes(b.status)), [bookings])
  const list = (filter === "ACTIVE" ? active : history).filter((booking) =>
    `${booking.customerName} ${booking.address} ${booking.category}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold tracking-tight">Job workspace</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Respond quickly and keep customers updated.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs" className="h-9 w-full bg-transparent text-sm outline-none sm:w-40" />
          </div>
          <div className="flex rounded-xl bg-muted p-1">
            <FilterButton active={filter === "ACTIVE"} onClick={() => setFilter("ACTIVE")}>Active {active.length}</FilterButton>
            <FilterButton active={filter === "HISTORY"} onClick={() => setFilter("HISTORY")}>History</FilterButton>
          </div>
        </div>
      </div>

      {list.length ? (
        <div className="divide-y divide-border">
          {list.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary"><Sparkles className="h-5 w-5" /></span>
          <p className="mt-4 font-semibold">{query ? "No matching jobs" : filter === "ACTIVE" ? "You’re all caught up" : "No job history yet"}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{filter === "ACTIVE" ? "New requests and confirmed work will appear here." : "Completed and cancelled jobs stay here for your records."}</p>
        </div>
      )}
    </section>
  )
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{children}</button>
}

function BookingCard({ booking }: { booking: ProviderBookingItem }) {
  const [expanded, setExpanded] = useState(booking.status === "PENDING")
  const [amount, setAmount] = useState(booking.amount?.toString() ?? "")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()
  const meta = statusMeta[booking.status]

  function run(action: ProviderBookingAction["action"]) {
    setError("")
    const input = action === "ACCEPT"
      ? { action, bookingId: booking.id, amount: Number(amount) } as const
      : { action, bookingId: booking.id } as ProviderBookingAction
    if (action === "ACCEPT" && (!amount || Number(amount) <= 0)) return setError("Enter the agreed job estimate.")
    startTransition(async () => {
      const result = await updateProviderBooking(input)
      if (!result.ok) setError(result.message)
    })
  }

  return (
    <article className="p-5 transition-colors hover:bg-muted/20">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-start gap-4 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent font-bold text-primary">{booking.customerName.charAt(0).toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{booking.customerName}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.tone}`}>{meta.label}</span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{labels[booking.category as CategorySlug] ?? booking.category}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(booking.scheduledAt)}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{booking.address}</span>
            {booking.amount != null && <span className="font-bold text-foreground">GH₵{booking.amount.toLocaleString()}</span>}
          </div>
        </div>
        <ChevronRight className={`mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <div className="ml-0 mt-4 rounded-2xl border border-border bg-background p-4 sm:ml-15">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job notes</p><p className="mt-1 leading-relaxed">{booking.notes || "No additional notes provided."}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</p><p className="mt-1 flex items-center gap-1.5"><UserRound className="h-4 w-4 text-muted-foreground" />{booking.customerPhone || "Phone not provided"}</p></div>
          </div>
          {error && <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
            {booking.status === "PENDING" && (
              <>
                <label className="flex h-10 items-center rounded-xl border border-border bg-card px-3 text-sm focus-within:border-primary">GH₵<input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Estimate" className="ml-2 w-full bg-transparent outline-none sm:w-24" /></label>
                <Button variant="ghost" className="h-10 rounded-xl text-destructive" disabled={pending} onClick={() => run("DECLINE")}><X className="mr-1 h-4 w-4" />Decline</Button>
                <Button className="h-10 rounded-xl px-4" disabled={pending} onClick={() => run("ACCEPT")}>{pending ? <Loader2 className="animate-spin" /> : <><Check className="mr-1 h-4 w-4" />Accept job</>}</Button>
              </>
            )}
            {booking.status === "ACCEPTED" && <Button className="h-10 rounded-xl px-4" disabled={pending} onClick={() => run("START")}>{pending ? <Loader2 className="animate-spin" /> : <><Play className="mr-1 h-4 w-4" />Start job</>}</Button>}
            {booking.status === "IN_PROGRESS" && <Button className="h-10 rounded-xl px-4" disabled={pending} onClick={() => run("COMPLETE")}>{pending ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="mr-1 h-4 w-4" />Mark complete</>}</Button>}
            {booking.status === "COMPLETED" && <span className="flex items-center gap-2 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" />Job successfully completed</span>}
            {booking.status === "CANCELLED" && <span className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4" />This job was cancelled</span>}
          </div>
        </div>
      )}
    </article>
  )
}
