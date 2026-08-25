import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BadgeCheck, CalendarCheck, CheckCircle2, MessageSquare, Search, Wallet } from "lucide-react"

export const metadata: Metadata = {
    title: "How It Works | Homify GH",
    description: "Learn how to find, book, and pay for trusted home service professionals on Homify GH.",
}

const steps = [
    {
        step: "01",
        icon: Search,
        title: "Find a professional",
        description:
            "Browse verified providers by service type — plumbing, electrical, cleaning and more. Filter by rating, location, and availability to find the right match.",
    },
    {
        step: "02",
        icon: CalendarCheck,
        title: "Request a booking",
        description:
            "Choose your preferred date and time, enter your service address, describe the job, and optionally propose your own price using Flex. No payment is taken at this stage.",
    },
    {
        step: "03",
        icon: MessageSquare,
        title: "Provider confirms & quotes",
        description:
            "The professional reviews your request and confirms an estimate. You'll be notified when they accept or when they propose a different amount.",
    },
    {
        step: "04",
        icon: Wallet,
        title: "Pay your way",
        description:
            "Pay using your Homify wallet (topped up via Mobile Money) once the price is agreed — or choose Pay After Service to settle with the provider directly when the job is done.",
    },
    {
        step: "05",
        icon: CheckCircle2,
        title: "Job done — leave a review",
        description:
            "Once the work is complete, leave a verified review to help other customers make informed decisions. Only completed bookings can be reviewed.",
    },
]

const trust = [
    { icon: BadgeCheck, title: "Identity verified", desc: "Every provider submits a Ghana Card and selfie before they can accept bookings." },
    { icon: CheckCircle2, title: "Real reviews only", desc: "Reviews are linked to completed bookings — no fake or anonymous ratings." },
    { icon: Wallet, title: "Secure payments", desc: "Pay through your Homify wallet via Mobile Money, or choose Pay After Service." },
]

export default function HowItWorksPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-primary">How it works</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Booking a pro is simple
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    From search to service in a few taps. Homify GH makes it easy to find, book, and pay
                    trusted professionals — all in one place.
                </p>
            </div>

            {/* Steps */}
            <ol className="mt-12 space-y-6">
                {steps.map(({ step, icon: Icon, title, description }) => (
                    <li
                        key={step}
                        className="flex gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm"
                    >
                        <div className="flex shrink-0 flex-col items-center gap-2">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                                <Icon className="h-5 w-5" />
                            </span>
                            <span className="text-xs font-black text-muted-foreground/50">{step}</span>
                        </div>
                        <div>
                            <h2 className="font-extrabold">{title}</h2>
                            <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{description}</p>
                        </div>
                    </li>
                ))}
            </ol>

            {/* Trust section */}
            <div className="mt-14">
                <h2 className="text-xl font-extrabold">Why you can trust Homify GH</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {trust.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="rounded-2xl border border-border bg-card p-5">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                                <Icon className="h-5 w-5" />
                            </span>
                            <h3 className="mt-3 font-bold">{title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="mt-12 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
                <Link
                    href="/search"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                    Find a pro now
                    <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-bold transition hover:bg-muted/40"
                >
                    Create a free account
                </Link>
            </div>
        </div>
    )
}
