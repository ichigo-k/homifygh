"use client"

import { useState, useTransition } from "react"
import { Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { approveProvider, rejectProvider } from "../../actions"

export function ReviewActions({ providerId }: { providerId: string }) {
  const [pending, startTransition] = useTransition()
  const [rejecting, setRejecting] = useState(false)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState<"approved" | "rejected" | null>(null)

  function approve() {
    setError("")
    startTransition(async () => {
      try {
        await approveProvider(providerId)
        setDone("approved")
      } catch {
        setError("Could not approve. Try again.")
      }
    })
  }

  function reject() {
    setError("")
    if (notes.trim().length < 5) return setError("Add a short reason for the applicant.")
    startTransition(async () => {
      try {
        await rejectProvider({ providerId, notes })
        setDone("rejected")
      } catch {
        setError("Could not reject. Try again.")
      }
    })
  }

  if (done) {
    return (
      <div className={`rounded-xl px-4 py-3 text-sm font-medium ${done === "approved" ? "bg-accent text-primary" : "bg-destructive/10 text-destructive"}`}>
        {done === "approved" ? "Approved — store-setup email sent." : "Rejected — applicant notified."}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rejecting ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <label className="block text-sm font-semibold">Reason for rejection</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Ghana Card image is blurry — please re-upload a clear photo."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              disabled={pending}
              onClick={reject}
              className="rounded-lg"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm rejection"}
            </Button>
            <Button variant="outline" disabled={pending} onClick={() => setRejecting(false)} className="rounded-lg">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            disabled={pending}
            onClick={approve}
            className="rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1.5 h-4 w-4" /> Approve</>}
          </Button>
          <Button variant="outline" disabled={pending} onClick={() => setRejecting(true)} className="rounded-lg">
            <X className="mr-1.5 h-4 w-4" /> Reject
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
