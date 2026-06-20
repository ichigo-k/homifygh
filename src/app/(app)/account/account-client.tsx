"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Phone,
  MapPin,
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCog,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { Field } from "@/components/auth/field"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useTheme } from "@/components/theme-provider"
import { updateProfile } from "./actions"

type Profile = {
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  locationLabel: string
}

const TABS = [
  { key: "profile", label: "Profile", icon: UserCog },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "settings", label: "Settings", icon: Sun },
] as const

export function AccountClient({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("profile")

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, security and preferences.</p>
      </header>

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-xl bg-muted p-1">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                active ? "bg-card text-foreground shadow-[var(--shadow-sm)]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {tab === "profile" && <ProfileTab profile={profile} />}
        {tab === "security" && <SecurityTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  )
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      <div className="mt-5">{children}</div>
    </div>
  )
}

function Notice({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  const ok = kind === "ok"
  return (
    <div
      className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm ${
        ok ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
      }`}
    >
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{children}</span>
    </div>
  )
}

function ProfileTab({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    locationLabel: profile.locationLabel,
  })
  const [pending, start] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  function save() {
    setError("")
    setDone(false)
    if (!form.firstName.trim()) return setError("First name is required.")
    start(async () => {
      try {
        await updateProfile(form)
        setDone(true)
        router.refresh()
      } catch {
        setError("Couldn't save your profile. Try again.")
      }
    })
  }

  return (
    <Card title="Profile details" desc="This is how providers will see you on bookings.">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="firstName" label="First name" icon={User} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Field id="lastName" label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>

        {/* Email (read-only) */}
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={profile.email}
            disabled
            className="h-12 w-full cursor-not-allowed rounded-xl border border-input bg-muted/40 pl-10 pr-3.5 text-sm text-muted-foreground"
          />
          <span className="absolute -top-2 left-3 bg-card px-1 text-xs text-muted-foreground">Email (cannot change)</span>
        </div>

        <Field id="phone" label="Phone" icon={Phone} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Field id="location" label="Location" icon={MapPin} value={form.locationLabel} onChange={(e) => setForm({ ...form, locationLabel: e.target.value })} />

        {error && <Notice kind="error">{error}</Notice>}
        {done && <Notice kind="ok">Profile saved.</Notice>}

        <Button onClick={save} disabled={pending} className="h-11 rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary-hover disabled:opacity-70">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </Button>
      </div>
    </Card>
  )
}

function SecurityTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" })
  const [pending, start] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  function save() {
    setError("")
    setDone(false)
    if (form.next.length < 8) return setError("New password must be at least 8 characters.")
    if (form.next !== form.confirm) return setError("New passwords don't match.")
    start(async () => {
      const { error } = await authClient.changePassword({
        currentPassword: form.current,
        newPassword: form.next,
        revokeOtherSessions: true,
      })
      if (error) {
        setError(error.message ?? "Couldn't change your password.")
        return
      }
      setDone(true)
      setForm({ current: "", next: "", confirm: "" })
    })
  }

  return (
    <Card title="Change password" desc="Use a strong password you don't use elsewhere.">
      <div className="space-y-4">
        <Field id="current" label="Current password" type="password" icon={Lock} value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
        <Field id="next" label="New password" type="password" icon={Lock} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
        <Field id="confirm" label="Confirm new password" type="password" icon={Lock} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />

        {error && <Notice kind="error">{error}</Notice>}
        {done && <Notice kind="ok">Password updated. Other sessions were signed out.</Notice>}

        <Button onClick={save} disabled={pending} className="h-11 rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary-hover disabled:opacity-70">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
        </Button>
      </div>
    </Card>
  )
}

function SettingsTab() {
  const { theme, setTheme } = useTheme()
  const options = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Monitor },
  ] as const

  return (
    <Card title="Appearance" desc="Choose how Homify looks on this device.">
      <div className="grid grid-cols-3 gap-3">
        {options.map(({ key, label, icon: Icon }) => {
          const active = theme === key
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${
                active
                  ? "border-primary bg-accent text-primary shadow-[var(--shadow-sm)]"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
