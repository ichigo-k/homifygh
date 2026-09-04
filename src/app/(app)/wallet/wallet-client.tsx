"use client"

import { useState, useTransition } from "react"
import { ArrowDownLeft, ArrowUpRight, Clock, Loader2, Lock, Plus, RotateCcw, Wallet, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { depositToWallet } from "./actions"

export type WalletTxn = { id: string; amount: number; type: "CREDIT" | "DEBIT"; description: string; createdAt: string }

const QUICK = [50, 100, 200, 500]

const cedis = (n: number) => `GH₵${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export function WalletClient({
  balance,
  held,
  inReview,
  spent,
  refunded,
  transactions,
}: {
  balance: number
  held: number
  inReview: number
  spent: number
  refunded: number
  transactions: WalletTxn[]
}) {
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function deposit() {
    setError(""); setMessage("")
    const value = Number(amount)
    if (!value || value <= 0) return setError("Enter an amount to deposit.")
    startTransition(async () => {
      const result = await depositToWallet({ amount: value })
      if (result.ok) { setMessage(`GH₵${value.toLocaleString()} added to your wallet.`); setAmount("") }
      else setError(result.message)
    })
  }

  return (
    <div className="mt-5 space-y-4">
      {/* Available balance — the headline number the customer can act on now. */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Wallet className="h-4 w-4" /> Available balance
        </div>
        <p className="mt-1.5 text-3xl font-extrabold sm:text-4xl">{cedis(balance)}</p>
        <p className="mt-1 text-xs text-muted-foreground">Ready to spend on a booking or withdraw.</p>
      </div>

      {/* Where the rest of your money is — held, spent, refunded, kept separate. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MoneyTile icon={Lock} tone="amber" label="Held for bookings" value={cedis(held)} hint="Reserved for active jobs" />
        <MoneyTile icon={Clock} tone="sky" label="Under review" value={cedis(inReview)} hint="On disputed jobs" />
        <MoneyTile icon={CheckCircle2} tone="emerald" label="Spent" value={cedis(spent)} hint="Paid for completed jobs" />
        <MoneyTile icon={RotateCcw} tone="violet" label="Refunded" value={cedis(refunded)} hint="Returned to your wallet" />
      </div>

      {/* Plain-language explainer so customers always know what happens next. */}
      <div className="rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="mb-1 text-sm font-bold text-foreground">How your money moves</p>
        When you book, the agreed amount is <strong className="text-foreground">held</strong> from your available balance so the pro
        knows you&apos;re committed — it isn&apos;t paid out yet. If the job is completed it&apos;s released to the pro and shown as
        <strong className="text-foreground"> spent</strong>. If you cancel before it starts, or a dispute is resolved in your favour, it&apos;s
        <strong className="text-foreground"> refunded</strong> straight back to your available balance.
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Add funds</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Top up your wallet balance to pay for bookings.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK.map((v) => (
            <button key={v} onClick={() => setAmount(String(v))} title={`Deposit GH₵${v}`} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${amount === String(v) ? "border-primary bg-accent text-primary" : "border-border hover:border-primary/40"}`}>
              GH₵{v}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <span className="flex flex-1 items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary">
            <span className="text-sm font-semibold text-muted-foreground">GH₵</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="Enter amount" className="h-11 w-full bg-transparent text-sm outline-none" />
          </span>
          <Button onClick={deposit} disabled={pending} className="h-11 rounded-xl px-4" title="Add this amount to your wallet">
            {pending ? <Loader2 className="animate-spin" /> : <><Plus className="mr-1 h-4 w-4" />Deposit</>}
          </Button>
        </div>
        {message && <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">{message}</p>}
        {error && <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <p className="mt-3 text-xs text-muted-foreground">This is a demo wallet — no real payment is processed.</p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Recent activity</h2>
        {transactions.length ? (
          <div className="mt-3 divide-y divide-border">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.type === "CREDIT" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                  {t.type === "CREDIT" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString("en-GH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={`text-sm font-bold ${t.type === "CREDIT" ? "text-emerald-600" : "text-red-600"}`}>{t.type === "CREDIT" ? "+" : "−"}GH₵{t.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No transactions yet. Add funds to get started.</p>
        )}
      </div>
    </div>
  )
}

const TONES: Record<string, string> = {
  amber: "bg-amber-500/10 text-amber-600",
  sky: "bg-sky-500/10 text-sky-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  violet: "bg-violet-500/10 text-violet-600",
}

function MoneyTile({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: typeof Wallet
  tone: keyof typeof TONES | string
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONES[tone] ?? TONES.amber}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2 text-lg font-extrabold leading-tight">{value}</p>
      <p className="text-xs font-semibold">{label}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}
