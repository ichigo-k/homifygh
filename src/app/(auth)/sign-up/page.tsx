"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { isEmailTaken } from "./actions"
import { signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/auth/field"
import { User, Mail, Lock, Loader2, ArrowRight, AlertCircle, Check, X } from "lucide-react"

/** Returns an array of unmet requirements */
function passwordIssues(pw: string): string[] {
  const issues: string[] = []
  if (pw.length < 8) issues.push("At least 8 characters")
  if (!/[A-Za-z]/.test(pw)) issues.push("At least one letter")
  if (!/[0-9]/.test(pw)) issues.push("At least one number")
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push("At least one special character")
  return issues
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const issues = passwordIssues(password)
  const rules = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Letter", pass: /[A-Za-z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = rules.filter((r) => r.pass).length
  const bar = ["bg-red-500", "bg-orange-400", "bg-amber-400", "bg-emerald-500"][score - 1] ?? "bg-muted"
  const label = ["", "Weak", "Fair", "Good", "Strong"][score]
  void issues

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= score ? bar : "bg-muted"}`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold ${score >= 3 ? "text-emerald-600" : "text-muted-foreground"}`}>
          {label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {rules.map(({ label: ruleLabel, pass }) => (
          <span key={ruleLabel} className={`flex items-center gap-1.5 text-xs ${pass ? "text-emerald-600" : "text-muted-foreground"}`}>
            {pass ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0 opacity-50" />}
            {ruleLabel}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const pwIssues = passwordIssues(form.password)
    if (pwIssues.length > 0) {
      setError(`Password does not meet requirements: ${pwIssues.join(", ")}.`)
      setLoading(false)
      return
    }

    try {
      if (await isEmailTaken(form.email)) {
        setError("That email is already in use. Try another one.")
        setLoading(false)
        return
      }

      const { error } = await signUp.email({
        name: `${form.firstName} ${form.lastName}`.trim(),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      })

      if (error) {
        setError(error.message ?? "Something went wrong. Try again.")
        setLoading(false)
        return
      }

      // Account created (unverified). An OTP was emailed on sign-up.
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Try again."
      setError(message)
      setLoading(false)
      console.error("Sign-up error:", err)
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find and book trusted home services near you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="firstName"
            label="First name"
            icon={User}
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <Field
            id="lastName"
            label="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
        </div>

        <Field
          id="email"
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <div>
          <Field
            id="password"
            label="Password"
            type="password"
            icon={Lock}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <PasswordStrength password={form.password} />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="group h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-(--shadow-sm) transition-all hover:bg-primary-hover hover:shadow-(--shadow-md) disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
