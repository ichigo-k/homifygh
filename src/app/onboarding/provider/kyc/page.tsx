"use client"

import { useState, useTransition } from "react"
import { MapPin, CreditCard, Loader2, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/auth/field"
import { UploadField } from "@/components/auth/upload-field"
import { CATEGORIES, type CategorySlug } from "@/lib/categories"
import { submitProviderKyc } from "../../actions"

type Step = "business" | "identity"

export default function ProviderKycPage() {
  const [step, setStep] = useState<Step>("business")
  const [category, setCategory] = useState<CategorySlug | "">("")
  const [bio, setBio] = useState("")
  const [locationLabel, setLocationLabel] = useState("")
  const [serviceRadiusKm, setServiceRadiusKm] = useState("10")
  const [ghanaCardNumber, setGhanaCardNumber] = useState("")
  const [ghanaCardFrontUrl, setFront] = useState("")
  const [ghanaCardBackUrl, setBack] = useState("")
  const [selfieUrl, setSelfie] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  function validateBusiness() {
    if (!category) return "Select your main service."
    if (bio.trim().length < 20) return "Tell customers a bit more about your work (20+ characters)."
    if (locationLabel.trim().length < 2) return "Enter your base location."
    return ""
  }

  function goToIdentity() {
    const err = validateBusiness()
    if (err) return setError(err)
    setError("")
    setStep("identity")
  }

  function submit() {
    setError("")
    const businessErr = validateBusiness()
    if (businessErr) {
      setStep("business")
      return setError(businessErr)
    }
    if (!/^GHA-\d{9}-\d$/i.test(ghanaCardNumber)) return setError("Ghana Card number must look like GHA-123456789-0.")
    if (!ghanaCardFrontUrl || !ghanaCardBackUrl) return setError("Upload both sides of your Ghana Card.")
    if (!selfieUrl) return setError("Upload a selfie for verification.")

    startTransition(async () => {
      try {
        await submitProviderKyc({
          category: category as CategorySlug,
          bio,
          locationLabel,
          serviceRadiusKm: Number(serviceRadiusKm),
          ghanaCardNumber,
          ghanaCardFrontUrl,
          ghanaCardBackUrl,
          selfieUrl,
        })
      } catch (e) {
        if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e
        setError("Something went wrong. Try again.")
      }
    })
  }

  const errorBanner = error && (
    <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{error}</span>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
          {step === "business" ? <Briefcase className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
        </span>
        <p className="mt-5 text-sm font-medium text-primary">
          {step === "business" ? "Step 2 of 3" : "Step 3 of 3"}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
          {step === "business" ? "About your business" : "Identity verification"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "business"
            ? "Tell customers what you do and where you work."
            : "We verify every pro with a quick KYC check. Your documents are private and reviewed by our team."}
        </p>
      </div>

      {step === "business" ? (
        <div className="mt-8 space-y-6">
          {/* Service */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Main service</label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {CATEGORIES.map(({ slug, label, icon: Icon }) => {
                const active = category === slug
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setCategory(slug)}
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
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-semibold">
              About your work
            </label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Licensed electrician with 8 years' experience across Accra. Wiring, faults, installations."
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>

          {/* Location + radius */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              id="location"
              label="Base location"
              icon={MapPin}
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
            />
            <Field
              id="radius"
              label="Service radius (km)"
              type="number"
              min={1}
              max={100}
              value={serviceRadiusKm}
              onChange={(e) => setServiceRadiusKm(e.target.value)}
            />
          </div>

          {errorBanner}

          <Button
            type="button"
            onClick={goToIdentity}
            className="group h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-sm)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-md)]"
          >
            Continue
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
            <Field
              id="ghanaCard"
              label="Ghana Card number (GHA-XXXXXXXXX-X)"
              icon={CreditCard}
              value={ghanaCardNumber}
              onChange={(e) => setGhanaCardNumber(e.target.value.toUpperCase())}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <UploadField label="Ghana Card — front" value={ghanaCardFrontUrl} onChange={setFront} />
              <UploadField label="Ghana Card — back" value={ghanaCardBackUrl} onChange={setBack} />
            </div>
            <UploadField label="Selfie holding your card" value={selfieUrl} onChange={setSelfie} />
          </div>

          {errorBanner}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setError("")
                setStep("business")
              }}
              className="h-12 rounded-xl px-5"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={submit}
              className="group h-12 flex-1 rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-sm)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-md)] disabled:opacity-70"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Submit for review
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
