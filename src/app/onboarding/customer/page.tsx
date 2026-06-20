"use client"

import { useState, useTransition } from "react"
import { MapPin, Loader2, ArrowRight, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/auth/field"
import { CATEGORIES, type CategorySlug } from "@/lib/categories"
import { completeCustomerOnboarding } from "../actions"

export default function CustomerOnboardingPage() {
  const [locationLabel, setLocationLabel] = useState("")
  const [interests, setInterests] = useState<CategorySlug[]>([])
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function toggle(slug: CategorySlug) {
    setInterests((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  function submit() {
    setError("")
    if (locationLabel.trim().length < 2) return setError("Enter your location.")
    if (interests.length === 0) return setError("Pick at least one service you might need.")
    startTransition(async () => {
      try {
        await completeCustomerOnboarding({ locationLabel, interests })
      } catch (e) {
        // redirect() throws a control-flow signal — let it bubble.
        if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e
        setError("Something went wrong. Try again.")
      }
    })
  }

  return (
    <div>
      <div className="text-center">
        <p className="text-sm font-medium text-primary">Step 2 of 2</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Tell us about you</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This helps us show pros near you and the services you care about.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold">Your location</label>
          <Field
            id="location"
            label="Town / area (e.g. East Legon, Accra)"
            icon={MapPin}
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-semibold">
              Services you might need
              <span className="ml-1 font-normal text-muted-foreground">(pick any)</span>
            </label>
            {interests.length > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                {interests.length} selected
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {CATEGORIES.map(({ slug, label, icon: Icon }) => {
              const active = interests.includes(slug)
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => toggle(slug)}
                  aria-pressed={active}
                  className={`group relative flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                    active
                      ? "border-primary bg-accent text-primary shadow-[var(--shadow-sm)]"
                      : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-sm)]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                      active ? "bg-primary text-primary-foreground" : "bg-accent text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{label}</span>
                  <Check
                    className={`ml-auto h-4 w-4 shrink-0 transition-all duration-200 ${
                      active ? "scale-100 opacity-100" : "scale-50 opacity-0"
                    }`}
                  />
                </button>
              )
            })}
          </div>
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
              Finish setup
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
