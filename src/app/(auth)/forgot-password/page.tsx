"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { emailOtp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/auth/field"
import { Mail, Lock, KeyRound, Loader2, ArrowRight, ArrowLeft, AlertCircle, MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "reset">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function requestCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await emailOtp.requestPasswordReset({ email })
      setStep("reset")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (otp.trim().length !== 6) return setError("Enter the 6-digit code from your email.")
    if (password.length < 8) return setError("Password must be at least 8 characters.")
    if (password !== confirmPassword) return setError("Passwords don't match.")
    setLoading(true)
    try {
      const { error } = await emailOtp.resetPassword({ email, otp: otp.trim(), password })
      if (error) {
        setError(error.message ?? "Invalid or expired code.")
        setLoading(false)
        return
      }
      router.push("/sign-in?reset=success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.")
      setLoading(false)
    }
  }

  if (step === "email") {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a 6-digit code.
          </p>
        </div>

        <form onSubmit={requestCode} className="mt-8 space-y-4">
          <Field
            id="email"
            label="Email"
            type="email"
            icon={Mail}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                Send reset code
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="font-semibold text-primary underline-offset-4 hover:underline">
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <MailCheck className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Check your email</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email}</span>, we sent a 6-digit code. Enter it below with your new password.
        </p>
      </div>

      <form onSubmit={resetPassword} className="mt-8 space-y-4">
        <Field
          id="otp"
          label="6-digit code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          icon={KeyRound}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
        />

        <Field
          id="password"
          label="New password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Field
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Reset password<ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></>}
        </Button>

        <button
          type="button"
          onClick={() => { setStep("email"); setError("") }}
          className="w-full text-center text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Use a different email
        </button>
      </form>
    </div>
  )
}
