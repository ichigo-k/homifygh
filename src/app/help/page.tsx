import Link from "next/link"
import { ChevronRight, MessageSquareWarning } from "lucide-react"
import { requireRole } from "@/lib/session"
import { BackButton } from "@/components/back-button"

const FAQ = [
  { q: "How do I book a service?", a: "Open Find a pro, choose a provider, set the date, address and job details, then tap “Request booking”. The provider confirms an estimate before any payment is taken." },
  { q: "What is Flex pricing?", a: "Every provider lists a starting price. With Flex you can propose your own price when booking — the provider can accept it or send back a counter offer." },
  { q: "How do I pay?", a: "Top up your wallet under More → Wallet and use the balance towards bookings. (Wallet top-up is a demo in this build.)" },
  { q: "How do I cancel or delete a booking?", a: "Cancel pending or confirmed jobs from My bookings → Active. Cancelled jobs can be deleted from My bookings → History." },
  { q: "How do I leave a review?", a: "Once a job is marked complete, open My bookings → History and tap “Leave a review”." },
  { q: "How do I turn on live location?", a: "Go to Settings and enable Live location, or tap “Use my location” when entering a booking address." },
]

export default async function HelpPage() {
  await requireRole("CUSTOMER")
  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <BackButton className="mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Support</p>
        <h1 className="mt-1 text-3xl font-extrabold">Help &amp; feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">Answers to common questions. Still stuck? Send us a complaint and we&apos;ll help.</p>

        <div className="mt-6 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-border bg-card p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {item.q}
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>

        <Link href="/complaints" title="Send feedback or lodge a complaint" className="mt-6 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><MessageSquareWarning className="h-5 w-5" /></span>
            <span>
              <span className="block font-semibold">Send feedback or a complaint</span>
              <span className="block text-sm text-muted-foreground">We read every message.</span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
    </main>
  )
}
