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
  offeredAmount: number | null
  disputeStatus: string | null
}

export function AdminBookingsClient({ bookings }: { bookings: AdminBookingItem[] }) {
  return <div className="mt-6 overflow-x-auto rounded-3xl border border-border bg-card">
    <table className="w-full min-w-[980px] text-left text-sm">
      <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
        <tr><th className="p-4">Customer</th><th className="p-4">Provider</th><th className="p-4">Schedule</th><th className="p-4">Job</th><th className="p-4">Payment</th><th className="p-4">Issue</th><th className="p-4" /></tr>
      </thead>
      <tbody className="divide-y divide-border">
        {bookings.map((booking) => <Row key={booking.id} booking={booking} />)}
      </tbody>
    </table>
  </div>
}

function Row({ booking }: { booking: AdminBookingItem }) {
  const [pending, startTransition] = useTransition()
  function remove() {
    if (!confirm("Permanently delete this booking? This cannot be undone.")) return
    startTransition(async () => { await deleteBookingAdmin(booking.id) })
  }
  return <tr>
    <td className="p-4"><p className="font-semibold">{booking.customerName}</p><p className="text-xs text-muted-foreground">{booking.customerEmail}</p></td>
    <td className="p-4 font-medium">{booking.providerName}</td>
    <td className="p-4"><span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(booking.scheduledAt).toLocaleDateString("en-GH")}</span><span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{booking.address}</span></td>
    <td className="p-4"><span className="rounded-full bg-muted px-2 py-1 text-xs font-bold">{booking.status.replaceAll("_", " ")}</span></td>
    <td className="p-4"><span className="flex items-center gap-1 text-xs font-semibold"><CreditCard className="h-3.5 w-3.5" />{booking.paymentStatus.replaceAll("_", " ")}</span>{booking.amount ? <p className="mt-1 text-xs">GH₵{booking.amount.toLocaleString()}</p> : booking.offeredAmount ? <p className="mt-1 text-xs text-primary">GH₵{booking.offeredAmount.toLocaleString()} <span className="text-muted-foreground">(Flex offer)</span></p> : null}</td>
    <td className="p-4">{booking.disputeStatus ? <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-bold text-red-600">{booking.disputeStatus}</span> : <span className="text-xs text-muted-foreground">None</span>}</td>
    <td className="p-4 text-right"><Button size="sm" variant="ghost" disabled={pending} title="Permanently delete this booking" className="rounded-lg text-muted-foreground hover:text-destructive" onClick={remove}>{pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}</Button></td>
  </tr>
}
