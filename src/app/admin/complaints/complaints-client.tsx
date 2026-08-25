"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Loader2, MessageSquareWarning, Send, ShieldCheck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addAdminComplaintMessage, resolveComplaint } from "./actions"

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

const STATUS = {
  OPEN: { label: "Open", tone: "bg-amber-500/10 text-amber-700" },
  IN_REVIEW: { label: "In Review", tone: "bg-primary/10 text-primary" },
  RESOLVED: { label: "Resolved", tone: "bg-emerald-500/10 text-emerald-700" },
}

export function AdminComplaintsClient({ complaints }: { complaints: AdminComplaintItem[] }) {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "IN_REVIEW" | "RESOLVED">("ALL")
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [resolutionText, setResolutionText] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  const list = complaints.filter((c) => (filter === "ALL" ? true : c.status === filter))

  function handleSendReply(complaintId: string) {
    if (!replyText.trim()) return
    setError("")
    startTransition(async () => {
      const res = await addAdminComplaintMessage({ complaintId, message: replyText })
      if (res.ok) {
        setReplyText("")
      } else {
        setError(res.message)
      }
    })
  }

  function handleResolve(complaintId: string) {
    if (!resolutionText.trim()) return
    setError("")
    startTransition(async () => {
      const res = await resolveComplaint({ complaintId, resolutionNotes: resolutionText })
      if (res.ok) {
        setResolutionText("")
      } else {
        setError(res.message)
      }
    })
  }

  return (
    <main className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Moderation Center</p>
            <h1 className="text-3xl font-extrabold">Dispute & Complaint Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review user complaints, communicate with customers & providers, and issue official resolutions.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
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

        {/* Complaints list */}
        <div className="mt-6 space-y-4">
          {list.length > 0 ? (
            list.map((item) => {
              const isOpen = activeComplaintId === item.id
              const s = STATUS[item.status]
              return (
                <div key={item.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${s.tone}`}>
                          {s.label}
                        </span>
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

                  <p className="mt-4 rounded-2xl bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
                    {item.message}
                  </p>

                  {item.resolutionNotes && (
                    <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Official Resolution Notes:
                      </p>
                      <p className="mt-1 text-emerald-950 dark:text-emerald-100">{item.resolutionNotes}</p>
                    </div>
                  )}

                  {/* Thread expansion */}
                  {isOpen && (
                    <div className="mt-6 border-t border-border pt-6 space-y-4">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <MessageSquareWarning className="h-4 w-4 text-primary" /> Multi-Party Conversation History
                      </h3>

                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {item.messages.length > 0 ? (
                          item.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`rounded-2xl p-3.5 text-sm ${m.senderRole === "ADMIN" ? "bg-primary/10 border border-primary/20 ml-6" : "bg-muted"}`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold mb-1">
                                <span className="flex items-center gap-1">
                                  {m.senderRole === "ADMIN" ? <ShieldCheck className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5" />}
                                  {m.senderName} ({m.senderRole})
                                </span>
                                <span className="text-[10px] text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-sm leading-relaxed">{m.message}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No responses posted yet.</p>
                        )}
                      </div>

                      {/* Action forms */}
                      {item.status !== "RESOLVED" && (
                        <div className="mt-4 space-y-4 rounded-2xl bg-muted/20 p-4 border border-border">
                          {/* Admin response */}
                          <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground">Send Official Admin Message</label>
                            <div className="mt-2 flex gap-2">
                              <input
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type response or request additional info..."
                                className="h-11 flex-1 rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary"
                              />
                              <Button disabled={pending || !replyText.trim()} onClick={() => handleSendReply(item.id)} className="h-11 rounded-xl">
                                {pending ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
                                Send
                              </Button>
                            </div>
                          </div>

                          {/* Resolve complaint */}
                          <div className="border-t border-border pt-4">
                            <label className="text-xs font-bold uppercase text-emerald-600">Final Resolution & Case Close</label>
                            <div className="mt-2 flex gap-2">
                              <input
                                value={resolutionText}
                                onChange={(e) => setResolutionText(e.target.value)}
                                placeholder="Enter final resolution decision notes..."
                                className="h-11 flex-1 rounded-xl border border-emerald-500/30 bg-background px-3.5 text-sm outline-none focus:border-emerald-500"
                              />
                              <Button
                                disabled={pending || !resolutionText.trim()}
                                onClick={() => handleResolve(item.id)}
                                className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Resolve & Close
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
      </div>
    </main>
  )
}
