import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck, FileCheck, MessageSquareWarning, Phone, ShieldCheck, Star } from "lucide-react"

export const metadata: Metadata = {
    title: "Trust & Safety | Homify GH",
    description: "Learn how Homify GH verifies professionals and keeps customers safe.",
}

const pillars = [
    {
        icon: BadgeCheck,
        title: "ID & background verification",
        body: "Every service provider must submit a valid Ghana Card (front and back) plus a live selfie before their account is reviewed. An admin manually approves or rejects each application. Providers cannot accept bookings until fully approved.",
    },
    {
        icon: Star,
        title: "Verified reviews only",
        body: "Star ratings and written reviews are only accepted from customers who have a completed booking with that provider. This prevents fake reviews and ensures every rating reflects a real experience.",
    },
    {
        icon: FileCheck,
        title: "Transparent pricing & Flex",
        body: "Providers publish starting prices before a booking is made. With Flex pricing, customers can propose their own budget — the provider can accept, counter-offer, or decline. No hidden charges.",
    },
    {
        icon: ShieldCheck,
        title: "Dispute resolution",
        body: "If something goes wrong, customers can open a dispute from their booking page. Our admin team reviews the case, contacts both parties, and works towards a fair resolution.",
    },
    {
        icon: MessageSquareWarning,
        title: "Complaints & feedback",
        body: "Customers can lodge a complaint at any time — about a booking, a provider, a payment, or the app itself. Every complaint is logged, tracked, and responded to by our support team.",
    },
    {
        icon: Phone,
        title: "Direct contact",
        body: "Providers who opt in to WhatsApp contact allow customers to reach them directly for quick queries before or during a job. The platform supports open, traceable communication.",
    },
]

export default function SafetyPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
                <p className="text-sm font-bold uppercase tracking-widest text-primary">Trust &amp; Safety</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Your safety is our priority
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                    Homify GH is built on trust. We verify every professional, back every booking with
                    transparent pricing, and stand behind every customer with a full dispute and complaints
                    process.
                </p>

                <div className="mt-10 grid gap-5 sm:grid-cols-2">
                    {pillars.map(({ icon: Icon, title, body }) => (
                        <div key={title} className="rounded-2xl border border-border p-5">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                                <Icon className="h-5 w-5" />
                            </span>
                            <h2 className="mt-3 font-bold">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 rounded-2xl bg-primary/5 p-5 text-sm leading-7 text-muted-foreground">
                    <span className="font-semibold text-foreground">Have a concern? </span>
                    If you experience anything on the platform that makes you feel unsafe or uncomfortable,
                    please{" "}
                    <Link href="/contact" className="font-semibold text-primary underline-offset-2 hover:underline">
                        contact us
                    </Link>{" "}
                    or{" "}
                    <Link href="/sign-in" className="font-semibold text-primary underline-offset-2 hover:underline">
                        lodge a complaint
                    </Link>{" "}
                    from within the app.
                </div>

                <div className="mt-8">
                    <Link href="/" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                        Return home
                    </Link>
                </div>
            </div>
        </div>
    )
}
