"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, CheckCircle2, Handshake, Loader2, LocateFixed, MapPin, Smartphone, Tag, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBooking } from "../../search/actions"
import { useMyLocation } from "@/components/use-my-location"

type PaymentMethod = "MOBILE_MONEY" | "PAY_AFTER_SERVICE"

function initialDate() {
  const date = new Date()
  date.setDate(date.getDate() + 3)
  date.setHours(10, 0, 0, 0)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? "pm" : "am"
  const displayHours = hours % 12 || 12
  return `${day}/${month}/${year} ${displayHours}:${minutes} ${ampm}`
}

export function BookingPanel({
  providerId,
  providerName,
  defaultAddress,
  startingPrice,
}: {
  providerId: string
  providerName: string
  defaultAddress: string
  startingPrice: number | null
}) {
  const [scheduledAt, setScheduledAt] = useState(initialDate())
  const [address, setAddress] = useState(defaultAddress)
  const [notes, setNotes] = useState("")
  const [offer, setOffer] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PAY_AFTER_SERVICE")
  const [error, setError] = useState("")
  const [complete, setComplete] = useState(false)
  const [pending, startTransition] = useTransition()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const { locating, error: locError, detect } = useMyLocation()

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedDate = new Date(e.target.value)
    const current = new Date(scheduledAt)
    selectedDate.setHours(current.getHours(), current.getMinutes(), 0, 0)
    const pad = (value: number) => String(value).padStart(2, "0")
    setScheduledAt(`${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}T${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}`)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = e.target.value.split(":")
    const current = new Date(scheduledAt)
    current.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    const pad = (value: number) => String(value).padStart(2, "0")
    setScheduledAt(`${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}T${pad(current.getHours())}:${pad(current.getMinutes())}`)
  }

  function submit() {
    setError("")
    startTransition(async () => {
      try {
        const offeredAmount = offer.trim() ? Number(offer) : undefined
        const result = await createBooking({
          providerId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          address,
          notes,
          paymentMethod,
          ...(offeredAmount && offeredAmount > 0 ? { offeredAmount } : {}),
        })
        if (!result.ok) {
          setError(result.error)
          return
        }
        setComplete(true)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not request this booking.")
      }
    })
  }

  if (complete)
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold">Request sent</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {providerName} will review your job and provide an estimate.
        </p>
        <Button className="mt-5 w-full rounded-xl" render={<Link href="/bookings" />}>
          Track booking
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    )

  const dateValue = scheduledAt.split("T")[0]
  const timeValue = scheduledAt.split("T")[1]

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-lg)] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Request this professional</p>
      <h2 className="mt-1 text-xl font-extrabold">Tell us about the job</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        No payment is taken now. The provider confirms the estimate first.
      </p>

      {startingPrice != null && (
        <div
          title="This is the provider's starting price. With Flex you can propose your own price to negotiate."
          className="mt-4 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Tag className="h-4 w-4 text-primary" />
            Starting price
          </span>
          <span className="text-lg font-extrabold text-primary">GH₵{startingPrice.toLocaleString()}</span>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {/* Date & time */}
        <label className="block">
          <span className="text-sm font-semibold">Preferred date and time</span>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="group mt-2 flex w-full items-center gap-3 rounded-xl border border-input bg-background px-3.5 py-2.5 transition-all hover:bg-accent/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary/70" />
            <span className="flex-1 text-left text-sm font-medium">{formatDateTime(scheduledAt)}</span>
          </button>

          {showDatePicker && (
            <div className="mt-3 space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Date</label>
                  <input type="date" value={dateValue} onChange={handleDateChange} min={dateValue} className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Time</label>
                  <input type="time" value={timeValue} onChange={handleTimeChange} className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <button type="button" onClick={() => setShowDatePicker(false)} className="w-full rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">
                Done
              </button>
            </div>
          )}
        </label>

        {/* Service address */}
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Service address</span>
            <button
              type="button"
              onClick={() => detect((label) => setAddress(label))}
              disabled={locating}
              title="Detect my current location automatically"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-60"
            >
              {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
              Use my location
            </button>
          </div>
          <span className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. East Legon, Accra"
              className="h-11 w-full bg-transparent text-sm outline-none"
            />
          </span>
          {locError && <span className="mt-1 block text-xs text-destructive">{locError}</span>}
        </label>

        {/* Flex pricing */}
        <label className="block">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Handshake className="h-4 w-4 text-primary" />
            Propose your price
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">Flex</span>
          </span>
          <span className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary">
            <span className="text-sm font-semibold text-muted-foreground">GH₵</span>
            <input
              value={offer}
              onChange={(e) => setOffer(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="Optional — name your budget to negotiate"
              title="Optional. Offer a price you'd like to pay; the provider can accept or counter it."
              className="h-11 w-full bg-transparent text-sm outline-none"
            />
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">Leave blank to let the provider quote. The provider can accept or counter your offer.</span>
        </label>

        {/* Payment method */}
        <div>
          <span className="text-sm font-semibold">How would you like to pay?</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("MOBILE_MONEY")}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-all ${paymentMethod === "MOBILE_MONEY"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-background hover:border-primary/40"
                }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${paymentMethod === "MOBILE_MONEY" ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}>
                <Smartphone className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs font-bold">Mobile Money</span>
                <span className="block text-[11px] text-muted-foreground">Pay digitally via MoMo</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("PAY_AFTER_SERVICE")}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-all ${paymentMethod === "PAY_AFTER_SERVICE"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-background hover:border-primary/40"
                }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${paymentMethod === "PAY_AFTER_SERVICE" ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}>
                <Wallet className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs font-bold">Pay After Service</span>
                <span className="block text-[11px] text-muted-foreground">Settle when job is done</span>
              </span>
            </button>
          </div>
          {paymentMethod === "MOBILE_MONEY" && (
            <p className="mt-2 rounded-xl bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              You&apos;ll receive payment instructions once the provider confirms your booking and agrees on the final price.
            </p>
          )}
          {paymentMethod === "PAY_AFTER_SERVICE" && (
            <p className="mt-2 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              You and the provider agree the price before work begins. Payment is settled directly after the job is completed.
            </p>
          )}
        </div>

        {/* Job details */}
        <label className="block">
          <span className="text-sm font-semibold">Job details</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={800}
            rows={4}
            placeholder="Describe what needs to be done…"
            className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button
          onClick={submit}
          disabled={pending || !address.trim() || !scheduledAt}
          className="h-12 w-full rounded-xl"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Requesting…
            </>
          ) : (
            <>
              Request booking
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
