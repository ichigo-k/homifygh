"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, Loader2, MessageSquareWarning, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resolveDispute, resolveComplaint, deleteComplaintAdmin } from "./actions"

type Dispute = { id: string; reason: string; details: string; status: "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED"; resolution: string | null; customer: string; customerEmail: string; provider: string; amount: number | null; scheduledAt: string }
type Complaint = { id: string; subject: string; category: string; message: string; status: "OPEN" | "IN_REVIEW" | "RESOLVED"; response: string | null; customer: string; customerEmail: string; createdAt: string }

export function DisputesClient({ disputes, complaints }: { disputes: Dispute[]; complaints: Complaint[] }) {
  const [tab, setTab] = useState<"disputes" | "complaints">("disputes")
  const openDisputes = disputes.filter((d) => d.status === "OPEN" || d.status === "REVIEWING").length
  const openComplaints = complaints.filter((c) => c.status !== "RESOLVED").length

  return <div className="mx-auto max-w-6xl p-6">
    <p className="text-xs font-bold uppercase tracking-wider text-primary">Trust and safety</p>
    <h1 className="mt-1 text-3xl font-extrabold">Disputes</h1>
    <p className="mt-1 text-sm text-muted-foreground">Review booking disputes and customer complaints, and record a clear resolution.</p>
    <div className="mt-6 flex w-fit rounded-xl bg-muted p-1">
      <TabButton active={tab === "disputes"} onClick={() => setTab("disputes")}>Booking disputes <Count>{openDisputes}</Count></TabButton>
      <TabButton active={tab === "complaints"} onClick={() => setTab("complaints")}>Complaints <Count>{openComplaints}</Count></TabButton>
    </div>
    <div className="mt-6">{tab === "disputes" ? <DisputesList disputes={disputes} /> : <ComplaintsList complaints={complaints} />}</div>
  </div>
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${active ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{children}</button>
}
function Count({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-background/80 px-1.5 text-[11px]">{children}</span> }
function EmptyState({ label }: { label: string }) { return <div className="rounded-3xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">{label}</div> }

function DisputesList({ disputes }: { disputes: Dispute[] }) {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()
  if (!disputes.length) return <EmptyState label="No booking disputes yet." />
  return <div className="space-y-4">
    {disputes.map((item) => <article key={item.id} className="rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /><h2 className="font-bold">{item.reason}</h2></div><p className="mt-1 text-xs text-muted-foreground">{item.customer} vs {item.provider} · {new Date(item.scheduledAt).toLocaleDateString("en-GH")}</p></div>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-bold">{item.status}</span>
      </div>
      <p className="mt-4 text-sm leading-6">{item.details}</p>
      {item.status === "OPEN" || item.status === "REVIEWING" ? <div className="mt-4">
        <textarea value={notes[item.id] ?? ""} onChange={(e) => setNotes((current) => ({ ...current, [item.id]: e.target.value }))} rows={3} placeholder="Resolution notes for both parties" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" disabled={pending || (notes[item.id]?.length ?? 0) < 10} onClick={() => startTransition(async () => { await resolveDispute({ id: item.id, status: "DISMISSED", resolution: notes[item.id] }) })}>Dismiss</Button>
          <Button disabled={pending || (notes[item.id]?.length ?? 0) < 10} onClick={() => startTransition(async () => { await resolveDispute({ id: item.id, status: "RESOLVED", resolution: notes[item.id] }) })}>{pending && <Loader2 className="animate-spin" />}Resolve</Button>
        </div>
      </div> : <p className="mt-4 rounded-xl bg-muted/40 p-3 text-sm"><strong>Resolution:</strong> {item.resolution}</p>}
    </article>)}
  </div>
}

const COMPLAINT_STATUS = {
  OPEN: { label: "Open", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  IN_REVIEW: { label: "In review", tone: "bg-primary/10 text-primary" },
  RESOLVED: { label: "Resolved", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
} as const

function ComplaintsList({ complaints }: { complaints: Complaint[] }) {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()
  if (!complaints.length) return <EmptyState label="No complaints yet." />
  function remove(id: string) {
    if (!confirm("Permanently delete this complaint? This cannot be undone.")) return
    startTransition(async () => { await deleteComplaintAdmin(id) })
  }
  return <div className="space-y-4">
    {complaints.map((item) => { const status = COMPLAINT_STATUS[item.status]; return <article key={item.id} className="rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex items-center gap-2"><MessageSquareWarning className="h-4 w-4 text-amber-500" /><h2 className="font-bold">{item.subject}</h2></div><p className="mt-1 text-xs text-muted-foreground">{item.customer} · {item.customerEmail} · {item.category.replaceAll("_", " ")} · {new Date(item.createdAt).toLocaleDateString("en-GH")}</p></div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.tone}`}>{status.label}</span>
          <Button size="sm" variant="ghost" disabled={pending} title="Delete this complaint" className="rounded-lg text-muted-foreground hover:text-destructive" onClick={() => remove(item.id)}>
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6">{item.message}</p>
      {item.status !== "RESOLVED" ? <div className="mt-4">
        <textarea value={notes[item.id] ?? ""} onChange={(e) => setNotes((current) => ({ ...current, [item.id]: e.target.value }))} rows={3} placeholder="Response for the customer" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <div className="mt-2 flex justify-end gap-2">
          {item.status === "OPEN" && <Button variant="outline" disabled={pending || (notes[item.id]?.length ?? 0) < 5} onClick={() => startTransition(async () => { await resolveComplaint({ id: item.id, status: "IN_REVIEW", response: notes[item.id] }) })}>Mark in review</Button>}
          <Button disabled={pending || (notes[item.id]?.length ?? 0) < 5} onClick={() => startTransition(async () => { await resolveComplaint({ id: item.id, status: "RESOLVED", response: notes[item.id] }) })}>{pending && <Loader2 className="animate-spin" />}Resolve</Button>
        </div>
      </div> : <p className="mt-4 rounded-xl bg-muted/40 p-3 text-sm"><strong>Response:</strong> {item.response}</p>}
    </article> })}
  </div>
}
