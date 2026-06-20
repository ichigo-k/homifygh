"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Loader2,
  RotateCcw,
  XCircle,
  Plus,
  Sparkles,
  CalendarCheck,
} from "lucide-react"
import { CATEGORIES, type CategorySlug } from "@/lib/categories"
import { Button } from "@/components/ui/button"
import { rebookBooking, cancelBooking } from "./actions"

export type BookingItem = {
  id: string
  category: string
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  scheduledAt: string
  address: string
  amount: number | null
  providerName: string
}

const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<
  CategorySlug,
  (typeof CATEGORIES)[number]
>

const STATUS: Record<BookingItem["status"], { label: string; pill: string }> = {
  PENDING: { label: "Awaiting confirmation", pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  ACCEPTED: { label: "Confirmed", pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  IN_PROGRESS: { label: "In progress", pill: "bg-accent text-primary" },
  COMPLETED: { label: "Completed", pill: "bg-muted text-muted-foreground" },
  CANCELLED: { label: "Cancelled", pill: "bg-red-500/10 text-red-600 dark:text-red-400" },
}

const UPCOMING = ["PENDING", "ACCEPTED", "IN_PROGRESS"]

function money(n: number | null) {
  return n == null ? null : "GH₵" + n.toLocaleString()
}
function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function BookingsClient({ bookings }: { bookings: BookingItem[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")

  const { upcoming, past } = useMemo(() => {
    const up = bookings
      .filter((b) => UPCOMING.includes(b.status))
      .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
    const pa = bookings
      .filter((b) => !UPCOMING.includes(b.status))
      .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt))
    return { upcoming: up, past: pa }
  }, [bookings])

  const list = tab === "upcoming" ? upcoming : past

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track, cancel or rebook your services.</p>
        </div>
        <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover" render={<Link href="/search" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          New booking
        </Button>
      </div>

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-xl bg-muted p-1">
        <TabBtn active={tab === "upcoming"} onClick={() => setTab("upcoming")} count={upcoming.length}>
          Upcoming
        </TabBtn>
        <TabBtn active={tab === "past"} onClick={() => setTab("past")} count={past.length}>
          Past
        </TabBtn>
      </div>

      {/* List */}
      <div className="mt-5 space-y-3">
        {list.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          list.map((b) => <BookingRow key={b.id} booking={b} />)
        )}
      </div>
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active ? "bg-card text-foreground shadow-[var(--shadow-sm)]" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      <span className={`rounded-full px-1.5 text-[11px] font-semibold ${active ? "bg-accent text-primary" : "bg-background/60 text-muted-foreground"}`}>
        {count}
      </span>
    </button>
  )
}

function BookingRow({ booking }: { booking: BookingItem }) {
  const [pending, start] = useTransition()
  const meta = CAT[booking.category as CategorySlug]
  const Icon = meta?.icon ?? Sparkles
  const s = STATUS[booking.status]
  const isPast = ["COMPLETED", "CANCELLED"].includes(booking.status)
  const canCancel = ["PENDING", "ACCEPTED"].includes(booking.status)
  const amt = money(booking.amount)

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{booking.providerName}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.pill}`}>{s.label}</span>
          </div>
          <p className="text-sm text-muted-foreground">{meta?.label ?? booking.category}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {fmtWhen(booking.scheduledAt)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {booking.address}
            </span>
            {amt && <span className="font-medium text-foreground">{amt}</span>}
          </div>
        </div>
      </div>

      {(canCancel || isPast) && (
        <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
          {canCancel && (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => start(() => cancelBooking(booking.id))}
              className="rounded-lg text-muted-foreground hover:text-destructive"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="mr-1.5 h-3.5 w-3.5" />Cancel</>}
            </Button>
          )}
          {isPast && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => start(() => rebookBooking(booking.id))}
              className="rounded-lg"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Rebook</>}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ tab }: { tab: "upcoming" | "past" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <CalendarCheck className="h-6 w-6" />
      </span>
      <div>
        <p className="font-medium">{tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {tab === "upcoming" ? "Book a trusted pro and it'll show up here." : "Your completed and cancelled bookings will appear here."}
        </p>
      </div>
      {tab === "upcoming" && (
        <Button className="mt-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover" render={<Link href="/search" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          New booking
        </Button>
      )}
    </div>
  )
}
