"use client"

import { useMemo, useState, useTransition } from "react"
import { AlertCircle, BadgeCheck, Banknote, Clock3, Loader2, Send, Smartphone, Wallet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { settleWithdrawal } from "./actions"

type Method = "MOBILE_MONEY" | "BANK_TRANSFER"
export type AdminWithdrawal = {
  id: string
  amount: number
  status: "PENDING" | "PAID" | "REJECTED"
  method: Method
  accountName: string
  accountNumber: string
  reference: string | null
  note: string | null
  createdAt: string
  processedAt: string | null
  storeName: string
  email: string
  phone: string | null
}

const cedis = (value: number) => `GH₵${value.toLocaleString()}`
const methodLabel: Record<Method, string> = { MOBILE_MONEY: "Mobile Money", BANK_TRANSFER: "Bank transfer" }
const statusMeta = {
  PENDING: { label: "Pending", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300", icon: Clock3 },
  PAID: { label: "Paid", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", icon: BadgeCheck },
  REJECTED: { label: "Rejected", tone: "bg-red-500/10 text-red-700 dark:text-red-300", icon: X },
} as const

export function WithdrawalsClient({ withdrawals }: { withdrawals: AdminWithdrawal[] }) {
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING")
  const pending = useMemo(() => withdrawals.filter((item) => item.status === "PENDING"), [withdrawals])
  const list = filter === "PENDING" ? pending : withdrawals
  const owed = pending.reduce((sum, item) => sum + item.amount, 0)

  return (
    <main className="p-4 sm:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Money out</p>
        <h1 className="mt-1 text-3xl font-extrabold">Withdrawals</h1>
        <p className="mt-1 text-sm text-muted-foreground">Send the transfer from the platform account, then record it here. Rejecting returns the money to the provider’s wallet.</p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Awaiting payment" value={pending.length.toString()} icon={Clock3} />
        <Stat label="Total owed" value={cedis(owed)} icon={Wallet} />
        <Stat label="All requests" value={withdrawals.length.toString()} icon={Send} />
      </div>

      <div className="mt-6 flex gap-1 rounded-xl bg-muted p-1 sm:w-fit">
        {(["PENDING", "ALL"] as const).map((option) => (
          <button key={option} onClick={() => setFilter(option)} className={`flex-1 rounded-lg px-4 py-1.5 text-xs font-semibold transition sm:flex-none ${filter === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{option === "PENDING" ? `Pending ${pending.length}` : "All"}</button>
        ))}
      </div>

      <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
        {list.length ? (
          <div className="divide-y divide-border">{list.map((item) => <Row key={item.id} item={item} />)}</div>
        ) : (
          <div className="px-6 py-16 text-center">
            <BadgeCheck className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 font-semibold">{filter === "PENDING" ? "Nothing waiting to be paid" : "No withdrawals yet"}</p>
          </div>
        )}
      </section>
    </main>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock3 }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex justify-between"><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><Icon className="h-4 w-4 text-primary" /></div>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
    </div>
  )
}

function Row({ item }: { item: AdminWithdrawal }) {
  const [mode, setMode] = useState<"PAY" | "REJECT" | null>(null)
  const [reference, setReference] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()
  const meta = statusMeta[item.status]
  const Icon = meta.icon

  function submit() {
    setError("")
    startTransition(async () => {
      const result = await settleWithdrawal(mode === "PAY" ? { action: "PAY", id: item.id, reference } : { action: "REJECT", id: item.id, note })
      if (!result.ok) return setError(result.message)
      setMode(null); setReference(""); setNote("")
    })
  }

  return (
    <article className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold">{item.storeName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.email}{item.phone ? ` · ${item.phone}` : ""}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
            {item.method === "MOBILE_MONEY" ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : <Banknote className="h-4 w-4 text-muted-foreground" />}
            {methodLabel[item.method]} · {item.accountNumber}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Account name: {item.accountName}</p>
          <p className="mt-1 text-xs text-muted-foreground">Requested {new Date(item.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold">{cedis(item.amount)}</p>
          <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.tone}`}><Icon className="h-3 w-3" />{meta.label}</span>
        </div>
      </div>

      {item.reference && <p className="mt-3 text-xs text-muted-foreground">Reference: {item.reference}</p>}
      {item.note && <p className="mt-3 rounded-xl bg-muted/40 px-3 py-2 text-xs">{item.note}</p>}

      {item.status === "PENDING" && (
        <div className="mt-4 border-t border-border pt-4">
          {mode ? (
            <div className="space-y-2">
              {mode === "PAY"
                ? <input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={100} placeholder="Transfer reference from your bank or MoMo receipt" aria-label="Transfer reference" className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" />
                : <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={300} placeholder="Why is this not being paid? The provider sees this." aria-label="Rejection reason" className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm" />}
              {error && <p className="flex gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive"><AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />{error}</p>}
              <div className="flex gap-2">
                <Button size="sm" className="rounded-lg" disabled={pending || (mode === "PAY" ? reference.trim().length < 2 : note.trim().length < 5)} onClick={submit}>{pending ? <Loader2 className="animate-spin" /> : <Check mode={mode} />}{mode === "PAY" ? "Confirm paid" : "Confirm rejection"}</Button>
                <Button size="sm" variant="outline" className="rounded-lg" disabled={pending} onClick={() => { setMode(null); setError("") }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              <Button size="sm" variant="ghost" className="rounded-lg text-destructive" onClick={() => setMode("REJECT")}><X className="h-3.5 w-3.5" />Reject</Button>
              <Button size="sm" className="rounded-lg" onClick={() => setMode("PAY")}><BadgeCheck className="h-3.5 w-3.5" />Mark as paid</Button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function Check({ mode }: { mode: "PAY" | "REJECT" }) {
  return mode === "PAY" ? <BadgeCheck className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />
}
