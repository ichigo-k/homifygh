import Link from "next/link"
import { redirect } from "next/navigation"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

export default async function ProviderPendingPage() {
  const user = await requireUser()
  const provider = await prisma.provider.findUnique({ where: { userId: user.id } })

  // No application yet → send them to the form.
  if (!provider) redirect("/onboarding/provider/kyc")

  if (provider.status === "APPROVED") {
    // Approved: either set up the store or head to the portal.
    if (!provider.storeSetupComplete) {
      return (
        <Card
          tone="success"
          icon={<CheckCircle2 className="h-7 w-7" />}
          title="You're approved! 🎉"
          body="Your identity has been verified. Set up your store so customers can find and book you."
          action={{ href: "/provider/store/setup", label: "Set up my store" }}
        />
      )
    }
    redirect("/provider")
  }

  if (provider.status === "REJECTED") {
    return (
      <Card
        tone="error"
        icon={<AlertCircle className="h-7 w-7" />}
        title="Application needs attention"
        body={provider.reviewNotes ?? "We couldn't verify your details. Please review and resubmit."}
        action={{ href: "/onboarding/provider/kyc", label: "Update & resubmit" }}
      />
    )
  }

  return (
    <Card
      tone="pending"
      icon={<Clock className="h-7 w-7" />}
      title="Application under review"
      body="Thanks! Our team is reviewing your documents. This usually takes less than 24 hours — we'll email you as soon as you're approved."
    />
  )
}

function Card({
  tone,
  icon,
  title,
  body,
  action,
}: {
  tone: "pending" | "success" | "error"
  icon: React.ReactNode
  title: string
  body: string
  action?: { href: string; label: string }
}) {
  const toneClass =
    tone === "success"
      ? "bg-accent text-primary"
      : tone === "error"
        ? "bg-destructive/10 text-destructive"
        : "bg-warm/20 text-foreground"

  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center sm:p-10">
      <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${toneClass}`}>
        {icon}
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && (
        <Button
          className="group mt-6 rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary-hover"
          render={<Link href={action.href} />}
        >
          {action.label}
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      )}
    </div>
  )
}
