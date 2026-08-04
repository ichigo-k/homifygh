"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

/**
 * Small "go back" control that returns to the previous page in history, with a
 * safe fallback when there's nowhere to go back to (e.g. deep-linked in).
 */
export function BackButton({ fallback = "/search", label = "Back", className = "" }: { fallback?: string; label?: string; className?: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      title="Go back to the previous page"
      aria-label="Go back to the previous page"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back()
        else router.push(fallback)
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
