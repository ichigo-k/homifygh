"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { AlertTriangle, Calendar, CalendarCheck, CheckCircle2, Loader2, MapPin, Plus, RotateCcw, Smartphone, Sparkles, Star, Trash2, Wallet, X, XCircle } from "lucide-react"
import { CATEGORIES, type CategorySlug } from "@/lib/categories"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/back-button"
import { cancelBooking, deleteBooking, rebookBooking, submitReview } from "./actions"
import { openDispute } from "./dispute-actions"

export type BookingItem = {
  id: string
  category: string
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  scheduledAt: string
  address: string
  amount: number | null
  depositAmount: number | null
  providerName: string
  reviewed: boolean
  reviewRating: number | null
  paymentMethod: string | null
  hasDispute: boolean
}

const CAT = Object.fromEntries(CATEGORIES.map((category) => [category.slug, category])) as Record<CategorySlug, (typeof CATEGORIES)[number]>
const STATUS = {
  PENDING: { label: "Awaiting provider", pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300", step: 1 },
  ACCEPTED: { label: "Confirmed", pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", step: 2 },
  IN_PROGRESS: { label: "Work in progress", pill: "bg-primary/10 text-primary", step: 3 },
  COMPLETED: { label: "Completed", pill: "bg-muted text-muted-foreground", step: 4 },
  CANCELLED: { label: "Cancelled", pill: "bg-red-500/10 text-red-700 dark:text-red-300", step: 0 },
} as const

const PAYMENT_LABELS: Record<string, { label: string; icon: typeof Smartphone }> = {
  MOBILE_MONEY: { label: "Mobile Money", icon: Smartphone },
  PAY_AFTER_SERVICE: { label: "Pay After Service", icon: Wallet },
}

function money(value: number | null) { return value == null ? null : `GH₵${value.toLocaleString()}` }
function when(value: string) { return new Date(value).toLocaleString("en-GH", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) }

export function BookingsClient({ bookings }: { bookings: BookingItem[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")
  const { upcoming, past } = useMemo(() => ({
    upcoming: bookings.filter((b) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(b.status)).sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
    past: bookings.filter((b) => ["COMPLETED", "CANCELLED"].includes(b.status)).sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt)),
  }), [bookings])
  const reviewCount = past.filter((b) => b.status === "COMPLETED" && !b.reviewed).length
  const list = tab === "upcoming" ? upcoming : past

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
        <BackButton className="mb-4" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your service hub</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">My bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Everything from request to verified review, in one place.</p>
          </div>
          <Button className="h-11 rounded-xl px-4" render={<Link href="/search" />}>
            <Plus className="mr-1.5 h-4 w-4" />Book a service
          </Button>
        </div>

        {reviewCount > 0 && (
          <button onClick={() => setTab("past")} className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700"><Star className="h-5 w-5 fill-current" /></span>
            <span className="flex-1">
              <span className="block text-sm font-bold">{reviewCount === 1 ? "How did your service go?" : `${reviewCount} services are ready for feedback`}</span>
              <span className="block text-xs text-muted-foreground">Your verified review helps good professionals stand out.</span>
            </span>
            <span className="text-sm font-semibold text-primary">Review now</span>
          </button>
        )}

        <div className="mt-6 flex w-fit rounded-xl bg-muted p-1">
          <Tab active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Active <Count>{upcoming.length}</Count></Tab>
          <Tab active={tab === "past"} onClick={() => setTab("past")}>History <Count>{past.length}</Count></Tab>
        </div>

        <div className="mt-5 space-y-4">
          {list.length ? list.map((booking) => <BookingCard key={booking.id} booking={booking} />) : <EmptyState tab={tab} />}
        </div>
      </div>
    </main>
  )
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${active ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{children}</button>
}
function Count({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-background/80 px-1.5 text-[11px]">{children}</span>
}

function BookingCard({ booking }: { booking: BookingItem }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [reviewing, setReviewing] = useState(false)
  const [disputing, setDisputing] = useState(false)
  const meta = CAT[booking.category as CategorySlug]
  const Icon = meta?.icon ?? Sparkles
  const status = STATUS[booking.status]
  const canCancel = ["PENDING", "ACCEPTED"].includes(booking.status)
  const canDispute = booking.status === "COMPLETED" && !booking.hasDispute
  const payInfo = booking.paymentMethod ? PAYMENT_LABELS[booking.paymentMethod] : null

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setMessage("")
    startTransition(async () => {
      const result = await action()
      if (!result.ok) setMessage(result.message ?? "Something went wrong.")
    })
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-sm)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-bold">{booking.providerName}</h2>
                <p className="text-sm text-muted-foreground">{meta?.label ?? booking.category}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status.pill}`}>{status.label}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{when(booking.scheduledAt)}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{booking.address}</span>
              {booking.amount != null ? <span className="font-bold text-foreground">{money(booking.amount)}</span> : booking.depositAmount != null && <span className="font-bold text-primary">{money(booking.depositAmount)} <span className="font-normal text-muted-foreground">held</span></span>}
              {payInfo && (
                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium">
                  <payInfo.icon className="h-3 w-3" />
                  {payInfo.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {booking.status !== "CANCELLED" && <Progress step={status.step} />}
        {booking.hasDispute && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            A dispute has been opened for this booking. Our team is reviewing it.
          </p>
        )}
        {message && <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
        {canCancel && (
          <Button size="sm" variant="ghost" disabled={pending} className="rounded-lg text-muted-foreground hover:text-destructive" onClick={() => run(() => cancelBooking(booking.id))}>
            {pending ? <Loader2 className="animate-spin" /> : <><XCircle className="mr-1 h-3.5 w-3.5" />Cancel</>}
          </Button>
        )}
        {["COMPLETED", "CANCELLED"].includes(booking.status) && (
          <Button size="sm" variant="outline" disabled={pending} title="Request this service again" className="rounded-lg" onClick={() => run(() => rebookBooking(booking.id))}>
            {pending ? <Loader2 className="animate-spin" /> : <><RotateCcw className="mr-1 h-3.5 w-3.5" />Book again</>}
          </Button>
        )}
        {booking.status === "CANCELLED" && (
          <Button size="sm" variant="ghost" disabled={pending} title="Remove this cancelled booking from your history" className="rounded-lg text-muted-foreground hover:text-destructive"
            onClick={() => { if (confirm("Delete this cancelled booking from your history? This cannot be undone.")) run(() => deleteBooking(booking.id)) }}>
            {pending ? <Loader2 className="animate-spin" /> : <><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</>}
          </Button>
        )}
        {booking.status === "COMPLETED" && !booking.reviewed && (
          <Button size="sm" className="rounded-lg" onClick={() => setReviewing(true)}>
            <Star className="mr-1 h-3.5 w-3.5" />Leave a review
          </Button>
        )}
        {booking.reviewed && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-current" />Your {booking.reviewRating}-star review
          </span>
        )}
        {canDispute && (
          <Button size="sm" variant="ghost" className="rounded-lg text-muted-foreground hover:text-destructive" onClick={() => setDisputing(true)}>
            <AlertTriangle className="mr-1 h-3.5 w-3.5" />Dispute
          </Button>
        )}
      </div>

      {reviewing && <ReviewDialog booking={booking} onClose={() => setReviewing(false)} />}
      {disputing && <DisputeDialog booking={booking} onClose={() => setDisputing(false)} />}
    </article>
  )
}

function Progress({ step }: { step: number }) {
  const labels = ["Requested", "Confirmed", "In progress", "Complete"]
  return (
    <div className="mt-5 grid grid-cols-4 gap-1">
      {labels.map((label, index) => (
        <div key={label}>
          <div className={`h-1.5 rounded-full ${index < step ? "bg-primary" : "bg-muted"}`} />
          <p className={`mt-1.5 text-[10px] font-semibold ${index < step ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
        </div>
      ))}
    </div>
  )
}

function ReviewDialog({ booking, onClose }: { booking: BookingItem; onClose: () => void }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function submit() {
    if (!rating) return setError("Choose a star rating.")
    startTransition(async () => {
      const result = await submitReview({ bookingId: booking.id, rating, comment })
      if (result.ok) onClose()
      else setError(result.message)
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Verified service review</p>
            <h2 className="mt-1 text-xl font-extrabold">How was {booking.providerName}?</h2>
          </div>
          <button onClick={onClose} aria-label="Close review" className="rounded-full p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} aria-label={`${value} stars`} onMouseEnter={() => setHovered(value)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(value)} className="p-1">
              <Star className={`h-9 w-9 transition ${value <= (hovered || rating) ? "fill-amber-400 text-amber-400 scale-110" : "text-muted"}`} />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-sm font-medium text-muted-foreground">{rating ? ["", "Needs improvement", "Fair", "Good", "Great", "Excellent"][rating] : "Tap to rate your experience"}</p>
        <label className="mt-5 block text-sm font-semibold">Share a little more <span className="font-normal text-muted-foreground">(optional)</span></label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={600} rows={4} placeholder="What went well? Was the provider punctual and professional?" className="mt-2 w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button onClick={submit} disabled={pending} className="mt-5 h-11 w-full rounded-xl">
          {pending ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="mr-1.5 h-4 w-4" />Publish review</>}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">Only reviews from completed bookings are published.</p>
      </div>
    </div>
  )
}

const DISPUTE_REASONS = [
  { value: "NOT_COMPLETED", label: "Work not completed" },
  { value: "POOR_QUALITY", label: "Poor quality work" },
  { value: "OVERCHARGED", label: "Charged more than agreed" },
  { value: "NO_SHOW", label: "Provider did not show up" },
  { value: "OTHER", label: "Other issue" },
]

function DisputeDialog({ booking, onClose }: { booking: BookingItem; onClose: () => void }) {
  const [reason, setReason] = useState(DISPUTE_REASONS[0].value)
  const [details, setDetails] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError("")
    if (details.trim().length < 20) return setError("Please describe the issue in more detail (at least 20 characters).")
    startTransition(async () => {
      const result = await openDispute({ bookingId: booking.id, reason, details })
      if (result.ok) setDone(true)
      else setError(result.message)
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-destructive">Open a dispute</p>
            <h2 className="mt-1 text-xl font-extrabold">What went wrong?</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        {done ? (
          <div className="mt-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <p className="mt-4 font-bold">Dispute opened</p>
            <p className="mt-1 text-sm text-muted-foreground">Our team will review the details and contact both parties. You&apos;ll receive updates via notifications.</p>
            <Button onClick={onClose} className="mt-5 w-full rounded-xl">Close</Button>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Opening a dispute notifies our admin team. We&apos;ll review the booking, contact both parties, and work towards a fair resolution.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-semibold">Reason</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DISPUTE_REASONS.map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setReason(value)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${reason === value ? "border-destructive bg-destructive/10 text-destructive" : "border-border hover:border-destructive/40"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Describe the issue</span>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={1200}
                  rows={4}
                  placeholder="Include specific details — dates, amounts, what was agreed vs what happened…"
                  className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <span className="mt-1 block text-right text-xs text-muted-foreground">{details.length}/1200</span>
              </label>

              {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

              <Button onClick={submit} disabled={pending} variant="destructive" className="h-11 w-full rounded-xl">
                {pending ? <Loader2 className="animate-spin" /> : <><AlertTriangle className="mr-1.5 h-4 w-4" />Submit dispute</>}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Disputes are only for completed bookings where something went wrong.</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ tab }: { tab: "upcoming" | "past" }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><CalendarCheck className="h-6 w-6" /></span>
      <p className="mt-4 font-semibold">{tab === "upcoming" ? "Nothing scheduled yet" : "No booking history yet"}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{tab === "upcoming" ? "Find a trusted professional and your booking progress will appear here." : "Completed and cancelled services will stay here."}</p>
      {tab === "upcoming" && <Button className="mt-5 rounded-xl" render={<Link href="/search" />}><Plus className="mr-1 h-4 w-4" />Find a professional</Button>}
    </div>
  )
}
