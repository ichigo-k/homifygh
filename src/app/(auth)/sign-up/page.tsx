"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/auth/field"
import { User, Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

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

        <Field
          id="password"
          label="Password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="group h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-sm)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-md)] disabled:opacity-70"
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
