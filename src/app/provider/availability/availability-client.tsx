"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Check, Clock3, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateAvailability } from "./actions"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
type Initial = { workingDays: number[]; workStart: string; workEnd: string; bookingLeadHours: number; unavailableDates: string[] }

export function AvailabilityClient({ initial }: { initial: Initial }) {
  const [workingDays, setWorkingDays] = useState(initial.workingDays)
  const [workStart, setWorkStart] = useState(initial.workStart)
  const [workEnd, setWorkEnd] = useState(initial.workEnd)
  const [lead, setLead] = useState(initial.bookingLeadHours)
  const [dates, setDates] = useState(initial.unavailableDates)
  const [newDate, setNewDate] = useState("")
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()
  function toggle(day: number) { setWorkingDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort()) }
  function addDate() { if (newDate && !dates.includes(newDate)) setDates((current) => [...current, newDate].sort()); setNewDate("") }
  function save() { setMessage(""); startTransition(async () => { const result = await updateAvailability({ workingDays, workStart, workEnd, bookingLeadHours: lead, unavailableDates: dates }); setMessage(result.ok ? "Availability saved." : result.message) }) }
  return <main className="min-h-screen bg-muted/20"><div className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><Link href="/provider" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to workspace</Link><section className="mt-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><CalendarDays className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Booking controls</p><h1 className="text-2xl font-extrabold">Availability</h1></div></div><p className="mt-3 text-sm text-muted-foreground">Customers can only request times inside this schedule.</p><div className="mt-7 space-y-7"><div><p className="text-sm font-bold">Working days</p><div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">{DAYS.map((label, day) => <button key={label} onClick={() => toggle(day)} className={`rounded-xl border px-2 py-3 text-sm font-semibold ${workingDays.includes(day) ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground"}`}>{label}</button>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Start time<input type="time" value={workStart} onChange={(event) => setWorkStart(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 font-normal" /></label><label className="text-sm font-bold">End time<input type="time" value={workEnd} onChange={(event) => setWorkEnd(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 font-normal" /></label></div><label className="block text-sm font-bold">Minimum booking notice<span className="mt-2 flex items-center gap-3 rounded-xl border border-input bg-background px-3"><Clock3 className="h-4 w-4 text-muted-foreground" /><input type="number" min="1" max="168" value={lead} onChange={(event) => setLead(Number(event.target.value))} className="h-11 flex-1 bg-transparent font-normal outline-none" /><span className="text-sm text-muted-foreground">hours</span></span></label><div><p className="text-sm font-bold">Unavailable dates</p><div className="mt-2 flex gap-2"><input type="date" value={newDate} min={new Date().toISOString().slice(0,10)} onChange={(event) => setNewDate(event.target.value)} className="h-11 flex-1 rounded-xl border border-input bg-background px-3 text-sm" /><Button variant="outline" className="h-11 rounded-xl" onClick={addDate} disabled={!newDate}><Plus className="h-4 w-4" />Block date</Button></div><div className="mt-3 flex flex-wrap gap-2">{dates.map((date) => <span key={date} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">{date}<button onClick={() => setDates((current) => current.filter((item) => item !== date))} aria-label={`Remove ${date}`}><X className="h-3.5 w-3.5" /></button></span>)}</div></div>{message && <p className="rounded-xl bg-muted px-3 py-2 text-sm">{message}</p>}<Button className="h-12 w-full rounded-xl" disabled={pending || !workingDays.length} onClick={save}>{pending ? <Loader2 className="animate-spin" /> : <><Check className="h-4 w-4" />Save availability</>}</Button></div></section></div></main>
}
