"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { emailOtp, signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, AlertCircle, MailCheck } from "lucide-react"

const OTP_LENGTH = 6

function VerifyEmailInner() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get("email") ?? ""

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendIn, setResendIn] = useState(0)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  // Countdown for the resend button.
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  const code = digits.join("")

  async function submit(value: string) {
    if (value.length !== OTP_LENGTH || !email) return
    setLoading(true)
    setError("")
    const { error } = await emailOtp.verifyEmail({ email, otp: value })
    if (error) {
      setError(error.message ?? "Invalid or expired code.")
      setDigits(Array(OTP_LENGTH).fill(""))
      inputs.current[0]?.focus()
      setLoading(false)
      return
    }
    // Verified + signed in → start onboarding.
    router.push("/onboarding/account-type")
  }

  function setDigit(i: number, val: string) {
    const clean = val.replace(/\D/g, "")
    if (!clean) {
      setDigits((d) => d.map((x, idx) => (idx === i ? "" : x)))
      return
    }
    // Allow pasting the full code into any box.
    if (clean.length > 1) {
      const next = clean.slice(0, OTP_LENGTH).split("")
      const filled = Array(OTP_LENGTH)
        .fill("")
        .map((_, idx) => next[idx] ?? "")
      setDigits(filled)
      const last = Math.min(next.length, OTP_LENGTH) - 1
      inputs.current[last]?.focus()
      if (filled.join("").length === OTP_LENGTH) submit(filled.join(""))
      return
    }
    const updated = digits.map((x, idx) => (idx === i ? clean : x))
    setDigits(updated)
    if (i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus()
    if (updated.join("").length === OTP_LENGTH) submit(updated.join(""))
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  async function resend() {
    if (!email || resendIn > 0) return
    setError("")
    await emailOtp.sendVerificationOtp({ email, type: "email-verification" })
    setResendIn(45)
  }

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Missing email address.{" "}
          <Link href="/sign-up" className="font-semibold text-primary hover:underline">
            Sign up
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
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Verify your email</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
          Enter it below.
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el
            }}
            inputMode="numeric"
            autoFocus={i === 0}
            maxLength={OTP_LENGTH}
            value={d}
            disabled={loading}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="h-14 w-12 rounded-xl border border-input bg-background text-center text-xl font-bold outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-60"
          />
        ))}
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="button"
        disabled={loading || code.length !== OTP_LENGTH}
        onClick={() => submit(code)}
        className="group mt-6 h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-sm)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-md)] disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Verify
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Didn&apos;t get it?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={resendIn > 0}
          className="font-semibold text-primary underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
      </p>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        Wrong address?{" "}
        <button
          type="button"
          onClick={async () => {
            await signOut()
            router.push("/sign-up")
          }}
          className="underline underline-offset-2 hover:text-foreground"
        >
          Start over
        </button>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />}>
      <VerifyEmailInner />
    </Suspense>
  )
}
