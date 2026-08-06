"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Loader2, MessageSquareWarning, Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteComplaint, submitComplaint } from "./actions"

export type ComplaintItem = {
  id: string
  subject: string
  category: string
  message: string
  status: "OPEN" | "IN_REVIEW" | "RESOLVED"
  response: string | null
  createdAt: string
}

const CATEGORIES = [
  { value: "BOOKING", label: "Booking issue" },
  { value: "PROVIDER", label: "Provider conduct" },
  { value: "PAYMENT", label: "Payment / wallet" },
  { value: "APP", label: "App problem" },
  { value: "OTHER", label: "Something else" },
] as const

const STATUS = {
  OPEN: { label: "Open", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  IN_REVIEW: { label: "In review", tone: "bg-primary/10 text-primary" },
  RESOLVED: { label: "Resolved", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
} as const

export function ComplaintsClient({ complaints }: { complaints: ComplaintItem[] }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("BOOKING")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(""); setDone(false)
    if (subject.trim().length < 3) return setError("Add a short subject.")
    if (message.trim().length < 10) return setError("Describe the issue in a little more detail.")
    startTransition(async () => {
      const result = await submitComplaint({ category, subject, message })
      if (result.ok) { setDone(true); setSubject(""); setMessage("") }
      else setError(result.message)
    })
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-bold"><MessageSquareWarning className="h-4 w-4 text-primary" />Lodge a complaint</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-semibold">Category</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.value} onClick={() => setCategory(c.value)} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${category === c.value ? "border-primary bg-accent text-primary" : "border-border hover:border-primary/40"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-sm font-semibold">Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="Brief summary" className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Details</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={4} placeholder="What happened? Include dates and provider names if relevant." className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary" />
          </label>
          {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          {done && <p className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary"><CheckCircle2 className="h-4 w-4" />Complaint submitted. We&apos;ll be in touch.</p>}
          <Button onClick={submit} disabled={pending} className="h-11 w-full rounded-xl">
            {pending ? <Loader2 className="animate-spin" /> : <><Send className="mr-1.5 h-4 w-4" />Submit complaint</>}
          </Button>
        </div>
      </div>

      {complaints.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-bold">Your complaints</h2>
          <div className="mt-3 space-y-3">
            {complaints.map((c) => <ComplaintCard key={c.id} complaint={c} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function ComplaintCard({ complaint: c }: { complaint: ComplaintItem }) {
  const [pending, startTransition] = useTransition()
  const s = STATUS[c.status]
  function remove() {
    if (!confirm("Delete this complaint? This cannot be undone.")) return
    startTransition(async () => { await deleteComplaint(c.id) })
  }
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{c.subject}</p>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${s.tone}`}>{s.label}</span>
          <Button size="sm" variant="ghost" disabled={pending} title="Delete this complaint" className="rounded-lg text-muted-foreground hover:text-destructive" onClick={remove}>
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{c.message}</p>
      {c.response && <p className="mt-2 rounded-xl bg-muted/40 px-3 py-2 text-sm"><span className="font-semibold">Response: </span>{c.response}</p>}
      <p className="mt-2 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}</p>
    </div>
  )
}
