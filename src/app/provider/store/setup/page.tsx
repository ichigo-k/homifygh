"use client"

import { useState, useTransition } from "react"
import { Store, Loader2, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/auth/field"
import { completeStoreSetup } from "../../actions"

export default function StoreSetupPage() {
  const [storeName, setStoreName] = useState("")
  const [bio, setBio] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function submit() {
    setError("")
    if (storeName.trim().length < 3) return setError("Give your store a name.")
    if (bio.trim().length < 20) return setError("Add a bit more about your services (20+ characters).")
    startTransition(async () => {
      try {
        await completeStoreSetup({ storeName, bio })
      } catch (e) {
        if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e
        setError("Something went wrong. Try again.")
      }
    })
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <Store className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Set up your store</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is what customers see when they find you. You can refine it anytime.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <Field
          id="storeName"
          label="Store name (e.g. Kofi's Electrical Works)"
          icon={Store}
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />

        <div>
          <label htmlFor="bio" className="mb-2 block text-sm font-semibold">
            Describe your services
          </label>
          <textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What you do, your experience, areas you cover…"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="button"
          disabled={pending}
          onClick={submit}
          className="group h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-sm)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-md)] disabled:opacity-70"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Open my store
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
