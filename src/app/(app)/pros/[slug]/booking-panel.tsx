"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, CheckCircle2, Loader2, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBooking } from "../../search/actions"

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
}: {
  providerId: string
  providerName: string
  defaultAddress: string
}) {
  const [scheduledAt, setScheduledAt] = useState(initialDate())
  const [address, setAddress] = useState(defaultAddress)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [complete, setComplete] = useState(false)
  const [pending, startTransition] = useTransition()
  const [showDatePicker, setShowDatePicker] = useState(false)

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedDate = new Date(e.target.value)
    const current = new Date(scheduledAt)
    selectedDate.setHours(current.getHours(), current.getMinutes(), 0, 0)
    const pad = (value: number) => String(value).padStart(2, "0")
    const formattedDateTime = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}T${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}`
    setScheduledAt(formattedDateTime)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = e.target.value.split(":")
    const current = new Date(scheduledAt)
    current.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    const pad = (value: number) => String(value).padStart(2, "0")
    const formattedDateTime = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}T${pad(current.getHours())}:${pad(current.getMinutes())}`
    setScheduledAt(formattedDateTime)
  }

  function submit() {
    setError("")
    startTransition(async () => {
      try {
        await createBooking({
          providerId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          address,
          notes,
        })
        setComplete(true)
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not request this booking."
        )
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
        <Button
          className="mt-5 w-full rounded-xl"
          render={<Link href="/bookings" />}
        >
          Track booking
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    )

  const dateValue = scheduledAt.split("T")[0]
  const timeValue = scheduledAt.split("T")[1]

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-lg)] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">
        Request this professional
      </p>
      <h2 className="mt-1 text-xl font-extrabold">Tell us about the job</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        No payment is taken now. The provider confirms the estimate first.
      </p>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">Preferred date and time</span>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="mt-2 flex w-full items-center gap-3 rounded-xl border border-input bg-background px-3.5 py-2.5 transition-all hover:bg-accent/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 group"
          >
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary/70" />
            <span className="text-sm font-medium flex-1 text-left">
              {formatDateTime(scheduledAt)}
            </span>
          </button>

          {showDatePicker && (
            <div className="mt-3 space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateValue}
                    onChange={handleDateChange}
                    min={dateValue}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Time
                  </label>
                  <input
                    type="time"
                    value={timeValue}
                    onChange={handleTimeChange}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="w-full rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Service address</span>
          <span className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="e.g. East Legon, Accra"
              className="h-11 w-full bg-transparent text-sm outline-none"
            />
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Job details</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={800}
            rows={4}
            placeholder="Describe what needs to be done…"
            className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          onClick={submit}
          disabled={pending || !address.trim() || !scheduledAt}
          className="h-12 w-full rounded-xl"
        >
          {pending ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
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
