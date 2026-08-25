"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, Check, CheckCircle2, DollarSign, Loader2, ReceiptText, Send, Smartphone, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { recordPayment, requestPayout } from "./actions"

export type PaymentBookingItem = {
  id: string
  customerName: string
  amount: number
  status: string
  method: string | null
  reference: string | null
  date: string
}

export type PayoutItem = {
  id: string
  amount: number
  accountNumber: string
  accountNetwork: string
  status: string
  createdAt: string
}

export function PaymentsClient({
  walletBalance,
  totalEarned,
  pendingPayoutTotal,
  bookings,
  payouts,
}: {
  walletBalance: number
  totalEarned: number
  pendingPayoutTotal: number
  bookings: PaymentBookingItem[]
  payouts: PayoutItem[]
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [method, setMethod] = useState("Mobile Money")
  const [reference, setReference] = useState("")
  const [pending, startTransition] = useTransition()

  // Payout request form state
  const [payoutAmount, setPayoutAmount] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountNetwork, setAccountNetwork] = useState<"MTN" | "TELECEL" | "AIRTELTIGO">("MTN")
  const [payoutMsg, setPayoutMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function savePayment(id: string, status: string) {
    startTransition(async () => {
      await recordPayment({ bookingId: id, status: status as any, method, reference })
      setEditing(null)
      setReference("")
    })
  }

  function handlePayoutSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPayoutMsg(null)
    const amountNum = Number(payoutAmount)
    if (!amountNum || amountNum <= 0) {
      setPayoutMsg({ ok: false, text: "Enter a valid amount to withdraw." })
      return
    }

    startTransition(async () => {
      const res = await requestPayout({
        amount: amountNum,
        accountNumber,
        accountNetwork,
      })
      if (res.ok) {
        setPayoutMsg({ ok: true, text: "Withdrawal request submitted successfully." })
        setPayoutAmount("")
        setAccountNumber("")
      } else {
        setPayoutMsg({ ok: false, text: res.message })
      }
    })
  }

  return (
    <main className="min-h-screen bg-muted/20 pb-12">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href="/provider" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to workspace
        </Link>

        <header className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Merchant Earnings & Revenue</p>
          <h1 className="mt-1 text-3xl font-extrabold">Earnings & Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your earnings, manage customer payments, and withdraw your funds to Mobile Money.
          </p>
        </header>

        {/* Overview cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">Total Revenue Earned</p>
            <p className="mt-1 text-2xl font-extrabold">GH₵{totalEarned.toLocaleString()}</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">Available Wallet Balance</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">GH₵{walletBalance.toLocaleString()}</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Smartphone className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">Pending Payouts</p>
            <p className="mt-1 text-2xl font-extrabold">GH₵{pendingPayoutTotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Withdrawal Section */}
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-extrabold">Withdraw Earnings to Mobile Money</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Request a payout to your MTN, Telecel, or AirtelTigo Mobile Money account.
          </p>

          <form onSubmit={handlePayoutSubmit} className="mt-6 space-y-4 max-w-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">Amount (GH₵)</label>
                <input
                  type="number"
                  min="1"
                  max={walletBalance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-semibold outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">Network</label>
                <select
                  value={accountNetwork}
                  onChange={(e) => setAccountNetwork(e.target.value as any)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none focus:border-primary"
                >
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="TELECEL">Telecel Cash</option>
                  <option value="AIRTELTIGO">AirtelTigo Money</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">MoMo Phone Number</label>
              <input
                type="tel"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="024XXXXXXX"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary"
              />
            </div>

            {payoutMsg && (
              <p className={`rounded-xl px-3.5 py-2.5 text-sm ${payoutMsg.ok ? "bg-emerald-500/10 text-emerald-700 font-semibold" : "bg-destructive/10 text-destructive"}`}>
                {payoutMsg.text}
              </p>
            )}

            <Button disabled={pending || walletBalance <= 0} className="h-11 rounded-xl px-6">
              {pending ? <Loader2 className="animate-spin" /> : <><Send className="mr-2 h-4 w-4" />Request Payout</>}
            </Button>
          </form>

          {payouts.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-sm font-bold">Recent Payout Requests</h3>
              <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-background">
                    <div>
                      <p className="font-extrabold text-sm">GH₵{p.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{p.accountNetwork} · {p.accountNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${p.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-700" : p.status === "REJECTED" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-700"}`}>
                        {p.status}
                      </span>
                      <p className="mt-1 text-[11px] text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("en-GH")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Customer Job Payments */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h2 className="text-xl font-extrabold">Customer Job Transactions</h2>
            <p className="text-sm text-muted-foreground">View and update payment records for completed bookings.</p>
          </div>

          {bookings.length ? (
            <div className="divide-y divide-border">
              {bookings.map((item) => (
                <article key={item.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold">{item.customerName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("en-GH")}</p>
                      {item.method && <p className="mt-1 text-xs font-medium text-primary">Method: {item.method}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-lg">GH₵{item.amount.toLocaleString()}</p>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${item.status === "PAID" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}`}>
                        {item.status.replaceAll("_", " ")}
                      </span>
                    </div>
                  </div>

                  {editing === item.id ? (
                    <div className="mt-4 grid gap-2 rounded-2xl bg-muted/30 p-4 sm:grid-cols-[1fr_1fr_auto]">
                      <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                      >
                        <option>Mobile Money</option>
                        <option>Cash</option>
                        <option>Bank transfer</option>
                      </select>
                      <input
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Transaction reference (optional)"
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                      />
                      <Button disabled={pending} onClick={() => savePayment(item.id, "PAID")}>
                        {pending ? <Loader2 className="animate-spin" /> : <Check className="h-4 w-4" />}
                        Mark Paid
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" variant="outline" onClick={() => setEditing(item.id)}>
                        <ReceiptText className="h-3.5 w-3.5" />
                        Update status
                      </Button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <ReceiptText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-semibold">No job transactions recorded yet</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
