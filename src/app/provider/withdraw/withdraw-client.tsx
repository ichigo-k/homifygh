"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, BadgeCheck, Banknote, Check, Clock3, Loader2, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MIN_WITHDRAWAL, withdrawalError } from "@/lib/payouts"
import { cancelWithdrawal, requestWithdrawal, savePayoutDetails } from "./actions"

type Method = "MOBILE_MONEY" | "BANK_TRANSFER"
type Payout = { method: Method | null; accountName: string | null; accountNumber: string | null }
export type WithdrawalItem = {
  id: string
  amount: number
  status: "PENDING" | "PAID" | "REJECTED"
  method: Method
  accountNumber: string
  reference: string | null
  note: string | null
  createdAt: string
  processedAt: string | null
}

const cedis = (value: number) => `GH₵${value.toLocaleString()}`
const methodLabel: Record<Method, string> = { MOBILE_MONEY: "Mobile Money", BANK_TRANSFER: "Bank transfer" }
const statusMeta = {
  PENDING: { label: "Pending", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300", icon: Clock3 },
  PAID: { label: "Paid", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", icon: BadgeCheck },
  REJECTED: { label: "Not paid", tone: "bg-red-500/10 text-red-700 dark:text-red-300", icon: X },
} as const

const inputClass = "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"

function Note({ message }: { message: string }) {
  if (!message) return null
  return <p className="flex gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive"><AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />{message}</p>
}

export function WithdrawClient({ balance, payout, withdrawals }: { balance: number; payout: Payout; withdrawals: WithdrawalItem[] }) {
  const pendingTotal = withdrawals.filter((item) => item.status === "PENDING").reduce((sum, item) => sum + item.amount, 0)
  const hasPayout = Boolean(payout.method && payout.accountName && payout.accountNumber)

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href="/provider" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to workspace</Link>
        <header className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Your money</p>
          <h1 className="mt-1 text-3xl font-extrabold">Withdraw earnings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Completed jobs pay into your wallet. Move that balance to your Mobile Money or bank account.</p>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Available</p>
            <p className="mt-3 text-3xl font-extrabold">{cedis(balance)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Awaiting payment</p>
            <p className="mt-3 text-3xl font-extrabold">{cedis(pendingTotal)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Already taken out of your balance</p>
          </div>
        </div>

        <PayoutDetails payout={payout} />
        <RequestForm balance={balance} enabled={hasPayout} />

        <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border p-5"><h2 className="font-extrabold">History</h2></div>
          {withdrawals.length ? (
            <div className="divide-y divide-border">{withdrawals.map((item) => <HistoryRow key={item.id} item={item} />)}</div>
          ) : (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">No withdrawals yet.</p>
          )}
        </section>
      </div>
    </main>
  )
}

function PayoutDetails({ payout }: { payout: Payout }) {
  const [editing, setEditing] = useState(!payout.method)
  const [method, setMethod] = useState<Method>(payout.method ?? "MOBILE_MONEY")
  const [accountName, setAccountName] = useState(payout.accountName ?? "")
  const [accountNumber, setAccountNumber] = useState(payout.accountNumber ?? "")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function save() {
    setError("")
    startTransition(async () => {
      const result = await savePayoutDetails({ method, accountName, accountNumber })
      if (!result.ok) return setError(result.message)
      setEditing(false)
    })
  }

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        {method === "MOBILE_MONEY" ? <Smartphone className="h-5 w-5 text-primary" /> : <Banknote className="h-5 w-5 text-primary" />}
        <h2 className="font-extrabold">Where we send it</h2>
        {!editing && <Button size="sm" variant="outline" className="ml-auto rounded-lg" onClick={() => setEditing(true)}>Change</Button>}
      </div>

      {editing ? (
        <div className="mt-5 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {(["MOBILE_MONEY", "BANK_TRANSFER"] as const).map((option) => (
              <button key={option} type="button" onClick={() => setMethod(option)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${method === option ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground"}`}>{methodLabel[option]}</button>
            ))}
          </div>
          <input value={accountName} onChange={(e) => setAccountName(e.target.value)} maxLength={80} placeholder="Account name" aria-label="Account name" className={inputClass} />
          <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} maxLength={32} placeholder={method === "MOBILE_MONEY" ? "Mobile Money number" : "Bank account number"} aria-label="Account number" className={inputClass} />
          <p className="text-xs text-muted-foreground">Make sure this matches your own registered account. Payments sent to a wrong number can’t be recovered.</p>
          <Note message={error} />
          <Button className="w-full rounded-xl" disabled={pending || accountName.trim().length < 2 || accountNumber.trim().length < 6} onClick={save}>{pending ? <Loader2 className="animate-spin" /> : <Check className="h-4 w-4" />}Save payout details</Button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-muted/40 p-4 text-sm">
          <p className="font-bold">{methodLabel[payout.method ?? "MOBILE_MONEY"]}</p>
          <p className="mt-1 text-muted-foreground">{payout.accountName} · {payout.accountNumber}</p>
        </div>
      )}
    </section>
  )
}

function RequestForm({ balance, enabled }: { balance: number; enabled: boolean }) {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()
  const parsed = Number(amount)
  const localError = amount ? withdrawalError(parsed, balance) : null

  function submit() {
    setError(""); setDone(false)
    startTransition(async () => {
      const result = await requestWithdrawal(parsed)
      if (!result.ok) return setError(result.message)
      setAmount(""); setDone(true)
    })
  }

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-6">
      <h2 className="font-extrabold">Request a withdrawal</h2>
      {enabled ? (
        <div className="mt-5 space-y-3">
          <label className="flex h-12 items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary">
            <span className="text-sm font-bold text-muted-foreground">GH₵</span>
            <input type="number" min={MIN_WITHDRAWAL} step="0.01" value={amount} onChange={(e) => { setAmount(e.target.value); setDone(false) }} placeholder={`${MIN_WITHDRAWAL} or more`} aria-label="Withdrawal amount" className="w-full bg-transparent text-sm outline-none" />
            <button type="button" onClick={() => setAmount(String(balance))} disabled={balance < MIN_WITHDRAWAL} className="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs font-bold disabled:opacity-40">All</button>
          </label>
          <Note message={error || localError || ""} />
          {done && <p className="flex gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300"><Check className="mt-px h-3.5 w-3.5 shrink-0" />Requested. We’ll send it to your account and mark it paid here.</p>}
          <Button className="h-12 w-full rounded-xl" disabled={pending || !amount || localError != null} onClick={submit}>{pending ? <Loader2 className="animate-spin" /> : "Request withdrawal"}</Button>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">Add your payout details above first.</p>
      )}
    </section>
  )
}

function HistoryRow({ item }: { item: WithdrawalItem }) {
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()
  const meta = statusMeta[item.status]
  const Icon = meta.icon

  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold">{cedis(item.amount)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{methodLabel[item.method]} · {item.accountNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.tone}`}><Icon className="h-3 w-3" />{meta.label}</span>
      </div>
      {item.reference && <p className="mt-2 text-xs text-muted-foreground">Reference: {item.reference}</p>}
      {item.note && <p className="mt-2 rounded-xl bg-muted/40 px-3 py-2 text-xs">{item.note}</p>}
      {item.status === "PENDING" && (
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="ghost" className="rounded-lg text-destructive" disabled={pending} onClick={() => { setError(""); startTransition(async () => { const result = await cancelWithdrawal(item.id); if (!result.ok) setError(result.message) }) }}>{pending ? <Loader2 className="animate-spin" /> : <X className="h-3.5 w-3.5" />}Cancel request</Button>
        </div>
      )}
      <Note message={error} />
    </article>
  )
}
