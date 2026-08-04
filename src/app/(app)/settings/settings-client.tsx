"use client"

import { useState, useTransition } from "react"
import { Bell, Loader2, MapPin } from "lucide-react"
import { updateSettings } from "./actions"

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${on ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  )
}

export function SettingsClient({ notificationsEnabled, locationSharingEnabled }: { notificationsEnabled: boolean; locationSharingEnabled: boolean }) {
  const [notif, setNotif] = useState(notificationsEnabled)
  const [loc, setLoc] = useState(locationSharingEnabled)
  const [pending, startTransition] = useTransition()

  function save(next: { notificationsEnabled?: boolean; locationSharingEnabled?: boolean }) {
    startTransition(async () => { await updateSettings(next) })
  }

  const rows = [
    { icon: Bell, title: "Push notifications", desc: "Get booking updates and reminders.", on: notif, toggle: () => { const v = !notif; setNotif(v); save({ notificationsEnabled: v }) } },
    { icon: MapPin, title: "Live location", desc: "Let the app detect your location to auto-fill addresses.", on: loc, toggle: () => { const v = !loc; setLoc(v); save({ locationSharingEnabled: v }) } },
  ]

  return (
    <div className="mt-6 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center gap-4 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"><r.icon className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{r.title}</p>
            <p className="text-sm text-muted-foreground">{r.desc}</p>
          </div>
          <Toggle on={r.on} onChange={r.toggle} disabled={pending} />
        </div>
      ))}
      <div className="flex items-center gap-2 px-5 py-3 text-xs text-muted-foreground">
        {pending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</> : "Changes are saved automatically."}
      </div>
    </div>
  )
}
