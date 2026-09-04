"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, CheckCircle2, Loader2, MessageSquareWarning, Send, ShieldCheck, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addAdminComplaintMessage, resolveComplaint } from "./actions"
import { resolveDispute } from "../disputes/actions"

export type AdminMessageItem = {
  id: string
  senderName: string
  senderRole: string
  message: string
  createdAt: string
}

export type AdminComplaintItem = {
  id: string
  category: string
  subject: string
  message: string
  status: "OPEN" | "IN_REVIEW" | "RESOLVED"
  response: string | null
  resolutionNotes: string | null
  createdAt: string
  userName: string
  userEmail: string
  userPhone: string | null
  messages: AdminMessageItem[]
}

export type AdminDisputeItem = {
  id: string
  reason: string
  details: string
  status: "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED"
  resolution: string | null
  customer: string
  customerEmail: string
  provider: string
  amount: number | null
  scheduledAt: string
  createdAt: string
}

const STATUS = {
  OPEN: { label: "Open", tone: "bg-amber-500/10 text-amber-700" },
  IN_REVIEW: { label: "In Review", tone: "bg-primary/10 text-primary" },
  RESOLVED: { label: "Resolved", tone: "bg-emerald-500/10 text-emerald-700" },
}

// Neutral, professional canned replies so admin responses stay measured and
// consistent — no more off-the-cuff messages like "we will deal with him".
const REPLY_TEMPLATES: { label: string; text: string }[] = [
  { label: "Acknowledge", text: "Thank you for reaching out. We've received your complaint and our team is reviewing it. We'll get back to you within 48 hours." },
  { label: "Request details", text: "We take your concern seriously. To help our review, could you share any photos, dates, or additional details relating to this booking?" },
  { label: "Contacting provider", text: "We've reviewed your report and have reached out to the provider involved. We'll follow up with you once we've heard back from them." },
  { label: "Action taken", text: "After reviewing this case, we've taken appropriate action with the provider in line with our platform policies. Thank you for helping keep Homify GH safe and reliable." },
  { label: "Refund issued", text: "We've arranged a refund to your Homify wallet for this booking. Please allow a few minutes for it to reflect in your available balance." },
]

export function AdminComplaintsClient({ complaints, disputes }: { complaints: AdminComplaintItem[]; disputes: AdminDisputeItem[] }) {
  const [view, setView] = useState<"complaints" | "disputes">("complaints")
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "IN_REVIEW" | "RESOLVED">("ALL")
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [resolutionText, setResolutionText] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  const list = complaints.filter((c) => (filter === "ALL" ? true : c.status === filter))
  const openComplaints = complaints.filter((c) => c.status !== "RESOLVED").length
  const openDisputes = disputes.filter((d) => d.status === "OPEN" || d.status === "REVIEWING").length

  function handleSendReply(complaintId: string) {
    if (!replyText.trim()) return
    setError("")
    startTransition(async () => {
      const res = await addAdminComplaintMessage({ complaintId, message: replyText })
      if (res.ok) setReplyText("")
      else setError(res.message)
    })
  }

  function handleResolve(complaintId: string) {
    if (!resolutionText.trim()) return
    setError("")
    startTransition(async () => {
      const res = await resolveComplaint({ complaintId, resolutionNotes: resolutionText })
      if (res.ok) setResolutionText("")
      else setError(res.message)
    })
  }

  return (
    <main className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Moderation Center</p>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Trust &amp; Safety</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One place to handle every case — customer complaints and booking disputes — with clear statuses and official resolutions.
          </p>
        </div>

        {/* Case-type switcher — replaces the old separate Complaints / Disputes pages. */}
        <div className="mt-6 flex w-full max-w-md rounded-2xl border border-border bg-card p-1.5">
          <SwitchButton active={view === "complaints"} onClick={() => setView("complaints")}>
            <MessageSquareWarning className="h-4 w-4" /> Complaints <Count>{openComplaints}</Count>
          </SwitchButton>
          <SwitchButton active={view === "disputes"} onClick={() => setView("disputes")}>
            <AlertTriangle className="h-4 w-4" /> Booking disputes <Count>{openDisputes}</Count>
          </SwitchButton>
        </div>

        {view === "disputes" ? (
          <DisputesList disputes={disputes} />
        ) : (
          <>
            {/* Complaint status filter */}
            <div className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-card p-1.5 border border-border w-fit">
              {(["ALL", "OPEN", "IN_REVIEW", "RESOLVED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${filter === tab ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab.replaceAll("_", " ")}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {list.length > 0 ? (
                list.map((item) => {
                  const isOpen = activeComplaintId === item.id
                  const s = STATUS[item.status]
                  return (
                    <div key={item.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${s.tone}`}>{s.label}</span>
                            <span className="text-xs font-semibold text-muted-foreground uppercase">{item.category}</span>
                          </div>
                          <h2 className="mt-2 text-lg font-extrabold">{item.subject}</h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Submitted by <span className="font-bold text-foreground">{item.userName}</span> ({item.userEmail}) on {new Date(item.createdAt).toLocaleDateString("en-GH")}
                          </p>
                        </div>

                        <Button
                          variant={isOpen ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setActiveComplaintId(isOpen ? null : item.id)}
                          className="rounded-xl font-bold"
                        >
                          {isOpen ? "Close Thread" : "View & Respond"}
                        </Button>
                      </div>

                      <p className="mt-4 rounded-2xl bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">{item.message}</p>

                      {item.resolutionNotes && (
                        <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                          <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> Official Resolution Notes:
                          </p>
                          <p className="mt-1 text-emerald-950 dark:text-emerald-100">{item.resolutionNotes}</p>
                        </div>
                      )}

                      {isOpen && (
                        <div className="mt-6 border-t border-border pt-6 space-y-4">
                          <h3 className="text-sm font-bold flex items-center gap-2">
                            <MessageSquareWarning className="h-4 w-4 text-primary" /> Conversation history
                          </h3>

                          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {item.messages.length > 0 ? (
                              item.messages.map((m) => (
                                <div
                                  key={m.id}
                                  className={`rounded-2xl p-3.5 text-sm ${m.senderRole === "ADMIN" ? "bg-primary/10 border border-primary/20 sm:ml-6" : "bg-muted"}`}
                                >
                                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                                    <span className="flex items-center gap-1">
                                      {m.senderRole === "ADMIN" ? <ShieldCheck className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5" />}
                                      {m.senderName} ({m.senderRole})
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                  </div>
                                  <p className="text-sm leading-relaxed">{m.message}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground italic">No responses posted yet.</p>
                            )}
                          </div>

                          {item.status !== "RESOLVED" && (
                            <div className="mt-4 space-y-4 rounded-2xl bg-muted/20 p-4 border border-border">
                              <div>
                                <label className="text-xs font-bold uppercase text-muted-foreground">Send official admin message</label>
                                {/* Professional templates keep replies neutral and consistent. */}
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {REPLY_TEMPLATES.map((t) => (
                                    <button
                                      key={t.label}
                                      type="button"
                                      onClick={() => setReplyText(t.text)}
                                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                                    >
                                      <Sparkles className="h-3 w-3 text-primary" />
                                      {t.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={2}
                                    placeholder="Type a professional response, or pick a template above…"
                                    className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                                  />
                                  <Button disabled={pending || !replyText.trim()} onClick={() => handleSendReply(item.id)} className="h-11 rounded-xl sm:self-end">
                                    {pending ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
                                    Send
                                  </Button>
                                </div>
                              </div>

                              <div className="border-t border-border pt-4">
                                <label className="text-xs font-bold uppercase text-emerald-600">Final resolution &amp; case close</label>
                                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                  <input
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    placeholder="Enter final resolution decision notes…"
                                    className="h-11 flex-1 rounded-xl border border-emerald-500/30 bg-background px-3.5 text-sm outline-none focus:border-emerald-500"
                                  />
                                  <Button
                                    disabled={pending || !resolutionText.trim()}
                                    onClick={() => handleResolve(item.id)}
                                    className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    Resolve &amp; Close
                                  </Button>
                                </div>
                              </div>

                              {error && <p className="text-xs text-destructive">{error}</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="py-16 text-center rounded-3xl border border-dashed border-border bg-card">
                  <MessageSquareWarning className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-bold">No complaints found for this view</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function SwitchButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  )
}

function Count({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-background/25 px-1.5 text-[11px]">{children}</span>
}

const DISPUTE_STATUS: Record<string, string> = {
  OPEN: "bg-amber-500/10 text-amber-700",
  REVIEWING: "bg-primary/10 text-primary",
  RESOLVED: "bg-emerald-500/10 text-emerald-700",
  DISMISSED: "bg-muted text-muted-foreground",
}

function DisputesList({ disputes }: { disputes: AdminDisputeItem[] }) {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()
  if (!disputes.length) {
    return (
      <div className="mt-6 py-16 text-center rounded-3xl border border-dashed border-border bg-card">
        <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-bold">No booking disputes yet</p>
      </div>
    )
  }
  return (
    <div className="mt-6 space-y-4">
      {disputes.map((item) => (
        <article key={item.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h2 className="font-bold">{item.reason}</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.customer} vs {item.provider} · {new Date(item.scheduledAt).toLocaleDateString("en-GH")}
                {item.amount != null && <> · GH₵{item.amount.toLocaleString()}</>}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${DISPUTE_STATUS[item.status] ?? "bg-muted"}`}>{item.status}</span>
          </div>
          <p className="mt-4 text-sm leading-6">{item.details}</p>
          {item.status === "OPEN" || item.status === "REVIEWING" ? (
            <div className="mt-4">
              <textarea
                value={notes[item.id] ?? ""}
                onChange={(e) => setNotes((current) => ({ ...current, [item.id]: e.target.value }))}
                rows={3}
                placeholder="Resolution notes shared with both parties (min. 10 characters)"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={pending || (notes[item.id]?.length ?? 0) < 10}
                  onClick={() => startTransition(async () => { await resolveDispute({ id: item.id, status: "DISMISSED", resolution: notes[item.id] }) })}
                >
                  Dismiss
                </Button>
                <Button
                  disabled={pending || (notes[item.id]?.length ?? 0) < 10}
                  onClick={() => startTransition(async () => { await resolveDispute({ id: item.id, status: "RESOLVED", resolution: notes[item.id] }) })}
                >
                  {pending && <Loader2 className="animate-spin" />}Resolve
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-muted/40 p-3 text-sm"><strong>Resolution:</strong> {item.resolution}</p>
          )}
        </article>
      ))}
    </div>
  )
}
