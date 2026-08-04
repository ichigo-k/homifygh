"use client"

import { useState, useTransition } from "react"
import { ArrowDownLeft, ArrowUpRight, Loader2, Plus, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { depositToWallet } from "./actions"

export type WalletTxn = { id: string; amount: number; type: "CREDIT" | "DEBIT"; description: string; createdAt: string }

const QUICK = [50, 100, 200, 500]

export function WalletClient({ balance, transactions }: { balance: number; transactions: WalletTxn[] }) {
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
    <div className="mt-6 space-y-5">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Wallet className="h-4 w-4" /> Available balance
        </div>
        <p className="mt-2 text-4xl font-extrabold">GH₵{balance.toLocaleString()}</p>
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
