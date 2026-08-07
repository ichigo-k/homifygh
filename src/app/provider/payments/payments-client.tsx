"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, BadgeCheck, Check, Loader2, ReceiptText, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import { recordPayment } from "./actions"

type Item = {
  id: string
  customerName: string
  amount: number
  status: "UNPAID" | "DEPOSIT_PAID" | "PAID" | "REFUNDED"
  method: string | null
  reference: string | null
  date: string
  platformFee: number | null
  providerPayout: number | null
  settled: boolean
}

const cedis = (value: number) => `GH₵${value.toLocaleString()}`

export function PaymentsClient({ balance, bookings }: { balance: number; bookings: Item[] }) {
  const earned = bookings.reduce((sum, item) => sum + (item.providerPayout ?? 0), 0)

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link href="/provider" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back to workspace</Link>
        <header className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Financial records</p>
          <h1 className="mt-1 text-3xl font-extrabold">Payments and receipts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Completed jobs pay out to your wallet automatically. Record offline payments against anything settled outside the platform.</p>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex justify-between"><p className="text-xs font-semibold uppercase text-muted-foreground">Wallet balance</p><WalletCards className="h-4 w-4 text-primary" /></div>
            <p className="mt-3 text-2xl font-extrabold">{cedis(balance)}</p>
            <Link href="/provider/withdraw" className="mt-2 inline-block text-xs font-bold text-primary hover:underline">Withdraw earnings →</Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex justify-between"><p className="text-xs font-semibold uppercase text-muted-foreground">Paid out</p><BadgeCheck className="h-4 w-4 text-primary" /></div>
            <p className="mt-3 text-2xl font-extrabold">{cedis(earned)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Across {bookings.filter((item) => item.settled).length} settled job{bookings.filter((item) => item.settled).length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          {bookings.length ? (
            <div className="divide-y divide-border">{bookings.map((item) => <PaymentRow key={item.id} item={item} />)}</div>
          ) : (
            <div className="py-16 text-center">
              <ReceiptText className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-3 font-semibold">No quoted jobs yet</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function PaymentRow({ item }: { item: Item }) {
  const [editing, setEditing] = useState(false)
  const [method, setMethod] = useState(item.method ?? "Mobile Money")
  const [reference, setReference] = useState(item.reference ?? "")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function save() {
    setError("")
    startTransition(async () => {
      const result = await recordPayment({ bookingId: item.id, status: "PAID", method, reference })
      if (!result.ok) return setError(result.message)
      setEditing(false)
    })
  }

  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold">{item.customerName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("en-GH")}</p>
        </div>
        <div className="text-right">
          <p className="font-extrabold">{cedis(item.amount)}</p>
          <span className="text-xs font-semibold text-primary">{item.status.replaceAll("_", " ")}</span>
        </div>
      </div>

      {item.settled ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs">
          <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-bold text-emerald-700 dark:text-emerald-300">{cedis(item.providerPayout ?? 0)} paid to your wallet</span>
          {item.platformFee ? <span className="text-muted-foreground">after {cedis(item.platformFee)} commission</span> : null}
        </div>
      ) : editing ? (
        <div className="mt-4 rounded-2xl bg-muted/30 p-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Payment method" className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
              <option>Mobile Money</option>
              <option>Cash</option>
              <option>Bank transfer</option>
            </select>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction reference" aria-label="Transaction reference" className="h-10 rounded-xl border border-input bg-background px-3 text-sm" />
            <Button disabled={pending} onClick={save}>{pending ? <Loader2 className="animate-spin" /> : <Check className="h-4 w-4" />}Mark paid</Button>
          </div>
          {error && <p className="mt-2 flex gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive"><AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />{error}</p>}
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-end gap-3">
          {item.method && <span className="text-xs text-muted-foreground">{item.method}{item.reference ? ` · ${item.reference}` : ""}</span>}
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}><ReceiptText className="h-3.5 w-3.5" />Update payment</Button>
        </div>
      )}
    </article>
  )
}
