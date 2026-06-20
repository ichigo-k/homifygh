"use client"

import { useState, useTransition } from "react"
import { Loader2, Check, X, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { approveProvider, rejectProvider } from "../../actions"
import { cn } from "@/lib/utils"

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
        setError("Could not approve applicant. Please try again.")
      }
    })
  }

  function reject() {
    setError("")
    if (notes.trim().length < 5) {
      return setError("Please provide a rejection reason (at least 5 characters).")
    }
    startTransition(async () => {
      try {
        await rejectProvider({ providerId, notes })
        setDone("rejected")
      } catch {
        setError("Could not reject applicant. Please try again.")
      }
    })
  }

  if (done) {
    return (
      <div 
        className={cn(
          "rounded-2xl border px-4 py-4 text-xs sm:text-sm font-semibold flex items-start gap-3 shadow-[var(--shadow-sm)] animate-in fade-in slide-in-from-bottom-2 duration-300",
          done === "approved" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400" 
            : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400"
        )}
      >
        {done === "approved" ? (
          <>
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <p className="font-bold">Application Approved</p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-0.5">
                The provider has been verified, and the store setup email has been sent.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-bold">Application Rejected</p>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium mt-0.5">
                The applicant has been notified of the rejection reason.
              </p>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rejecting ? (
        <div className="space-y-3.5 rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-sm)] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Reason for Rejection
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Ghana Card image is blurry — please re-upload a clear photo."
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm outline-none focus-brand placeholder:text-muted-foreground/70"
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              disabled={pending}
              onClick={reject}
              className="rounded-full px-5 text-xs sm:text-sm shadow-[var(--shadow-sm)]"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Confirm Rejection</span>
              )}
            </Button>
            <Button 
              variant="outline" 
              disabled={pending} 
              onClick={() => {
                setRejecting(false)
                setError("")
              }} 
              className="rounded-full px-5 text-xs sm:text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2.5">
          <Button
            disabled={pending}
            onClick={approve}
            className="rounded-full bg-primary px-6 text-xs sm:text-sm text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-primary-hover hover:shadow-[var(--shadow-md)] transition-all font-semibold"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="mr-1.5 h-4 w-4 stroke-[3]" /> 
                <span>Approve Provider</span>
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            disabled={pending} 
            onClick={() => setRejecting(true)} 
            className="rounded-full px-6 text-xs sm:text-sm font-semibold hover:bg-muted/60 transition-colors"
          >
            <X className="mr-1.5 h-4 w-4 stroke-[3]" /> 
            <span>Reject</span>
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 bg-rose-500/5 border border-rose-200/10 rounded-xl p-3 animate-in fade-in duration-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
