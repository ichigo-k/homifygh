"use client"

import { useTransition } from "react"
import { CalendarDays, CreditCard, Loader2, MapPin, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteBookingAdmin } from "./actions"

export type AdminBookingItem = {
  id: string
  customerName: string
  customerEmail: string
  providerName: string
  scheduledAt: string
  address: string
  status: string
  paymentStatus: string
  amount: number | null
  depositAmount: number | null
  disputeStatus: string | null
}

function useDelete(id: string) {
  const [pending, startTransition] = useTransition()
  function remove() {
    if (!confirm("Permanently delete this booking? This cannot be undone.")) return
    startTransition(async () => { await deleteBookingAdmin(id) })
  }
  return { pending, remove }
}

function StatusPill({ status }: { status: string }) {
  return <span className="rounded-full bg-muted px-2 py-1 text-xs font-bold">{status.replaceAll("_", " ")}</span>
}

function PaymentCell({ booking }: { booking: AdminBookingItem }) {
  return (
    <>
      <span className="flex items-center gap-1 text-xs font-semibold"><CreditCard className="h-3.5 w-3.5" />{booking.paymentStatus.replaceAll("_", " ")}</span>
      {booking.amount ? (
        <p className="mt-1 text-xs">GH₵{booking.amount.toLocaleString()}</p>
      ) : booking.depositAmount ? (
        <p className="mt-1 text-xs text-primary">GH₵{booking.depositAmount.toLocaleString()} <span className="text-muted-foreground">(held)</span></p>
      ) : null}
    </>
  )
}

function DisputeBadge({ status }: { status: string | null }) {
  return status
    ? <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-bold text-red-600">{status}</span>
    : <span className="text-xs text-muted-foreground">None</span>
}

export function AdminBookingsClient({ bookings }: { bookings: AdminBookingItem[] }) {
  if (!bookings.length) {
    return <div className="mt-6 rounded-3xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">No bookings yet.</div>
  }
  return (
    <>
      {/* Mobile: stacked cards so nothing is cut off on a small screen. */}
      <div className="mt-6 space-y-3 lg:hidden">
        {bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
      </div>

      {/* Desktop: dense table. */}
      <div className="mt-6 hidden overflow-x-auto rounded-3xl border border-border bg-card lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-4">Customer</th><th className="p-4">Provider</th><th className="p-4">Schedule</th><th className="p-4">Job</th><th className="p-4">Payment</th><th className="p-4">Issue</th><th className="p-4" /></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => <Row key={booking.id} booking={booking} />)}
          </tbody>
        </table>
      </div>
    </>
  )
}

function BookingCard({ booking }: { booking: AdminBookingItem }) {
  const { pending, remove } = useDelete(booking.id)
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{booking.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">{booking.customerEmail}</p>
        </div>
        <StatusPill status={booking.status} />
      </div>
      <div className="mt-3 grid gap-2 border-t border-border pt-3 text-sm">
        <p className="text-xs text-muted-foreground">Provider</p>
        <p className="-mt-1 font-medium">{booking.providerName}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{new Date(booking.scheduledAt).toLocaleDateString("en-GH")}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{booking.address}</span></p>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
        <div><PaymentCell booking={booking} /></div>
        <div className="flex items-center gap-2">
          <DisputeBadge status={booking.disputeStatus} />
          <Button size="sm" variant="ghost" disabled={pending} title="Permanently delete this booking" className="rounded-lg text-muted-foreground hover:text-destructive" onClick={remove}>
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ booking }: { booking: AdminBookingItem }) {
  const { pending, remove } = useDelete(booking.id)
  return (
    <tr>
      <td className="p-4"><p className="font-semibold">{booking.customerName}</p><p className="text-xs text-muted-foreground">{booking.customerEmail}</p></td>
      <td className="p-4 font-medium">{booking.providerName}</td>
      <td className="p-4"><span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(booking.scheduledAt).toLocaleDateString("en-GH")}</span><span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{booking.address}</span></td>
      <td className="p-4"><StatusPill status={booking.status} /></td>
      <td className="p-4"><PaymentCell booking={booking} /></td>
      <td className="p-4"><DisputeBadge status={booking.disputeStatus} /></td>
      <td className="p-4 text-right"><Button size="sm" variant="ghost" disabled={pending} title="Permanently delete this booking" className="rounded-lg text-muted-foreground hover:text-destructive" onClick={remove}>{pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}</Button></td>
    </tr>
  )
}
