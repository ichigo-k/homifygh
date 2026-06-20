"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/auth/field"
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await signIn.email({
      email: form.email,
      password: form.password,
    })

    if (error) {
      // Email not verified yet → send them through the OTP flow.
      if (error.status === 403 || /verif/i.test(error.message ?? "")) {
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
        return
      }
      setError(error.message ?? "Invalid email or password.")
      setLoading(false)
      return
    }

    // Land in the app; server layouts route to onboarding or the role home.
    router.push("/search")
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your bookings and saved pros.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

        <div className="space-y-1.5">
          <Field
            id="password"
            label="Password"
            type="password"
            icon={Lock}
            autoComplete="off"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
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
          className="group h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-sm)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-md)] disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
