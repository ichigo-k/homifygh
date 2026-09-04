"use client"

import { useState, useTransition } from "react"
import { Bell, Loader2, LogOut, MapPin, Monitor, ShieldCheck, Smartphone } from "lucide-react"
import { updateSettings, signOutOtherDevices } from "./actions"

export type DeviceSession = { id: string; current: boolean; userAgent: string | null; ipAddress: string | null; createdAt: string }

// Turn a raw user-agent string into something a person can recognise.
function deviceLabel(ua: string | null): { label: string; mobile: boolean } {
  if (!ua) return { label: "Unknown device", mobile: false }
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua)
  const os = /Windows/i.test(ua) ? "Windows" : /Mac OS X|Macintosh/i.test(ua) ? "Mac" : /Android/i.test(ua) ? "Android" : /iPhone|iPad|iOS/i.test(ua) ? "iOS" : /Linux/i.test(ua) ? "Linux" : "device"
  const browser = /Edg/i.test(ua) ? "Edge" : /Chrome/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : /Firefox/i.test(ua) ? "Firefox" : "browser"
  return { label: `${browser} on ${os}`, mobile }
}

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

export function SettingsClient({ notificationsEnabled, locationSharingEnabled, devices }: { notificationsEnabled: boolean; locationSharingEnabled: boolean; devices: DeviceSession[] }) {
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
    <>
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

      <SecuritySection devices={devices} />
    </>
  )
}

function SecuritySection({ devices }: { devices: DeviceSession[] }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const others = devices.filter((d) => !d.current).length

  function signOutOthers() {
    if (!confirm("Sign out of all other devices? You'll stay signed in here.")) return
    setMessage("")
    startTransition(async () => {
      const res = await signOutOtherDevices()
      setMessage(res.ok ? "Signed out of all other devices." : res.message)
    })
  }

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-5">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-bold">Account security</h2>
          <p className="text-sm text-muted-foreground">Devices currently signed in to your account.</p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {devices.map((d) => {
          const { label, mobile } = deviceLabel(d.userAgent)
          return (
            <div key={d.id} className="flex items-center gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                {mobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {label}
                  {d.current && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">This device</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.ipAddress ? `${d.ipAddress} · ` : ""}since {new Date(d.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {others > 0 && (
        <div className="border-t border-border p-5">
          <button
            onClick={signOutOthers}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign out of all other devices ({others})
          </button>
        </div>
      )}
      {message && <p className="px-5 pb-4 text-sm text-muted-foreground">{message}</p>}
    </section>
  )
}
