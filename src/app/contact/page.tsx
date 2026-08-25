import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MapPin, MessageSquareWarning, Phone } from "lucide-react"

export const metadata: Metadata = {
    title: "Contact Us | Homify GH",
    description: "Get in touch with the Homify GH team for support, partnerships, or general inquiries.",
}

const channels = [
    {
        icon: Mail,
        title: "Email",
        value: "hello@homify.gh",
        desc: "General inquiries and support",
        href: "mailto:hello@homify.gh",
    },
    {
        icon: Phone,
        title: "Phone",
        value: "+233 30 000 0000",
        desc: "Monday – Friday, 8 am – 6 pm GMT",
        href: "tel:+233300000000",
    },
    {
        icon: MapPin,
        title: "Office",
        value: "Accra, Ghana",
        desc: "Greater Accra Region",
        href: null,
    },
]

export default function ContactPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
                <p className="text-sm font-bold uppercase tracking-widest text-primary">Contact</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Get in touch</h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                    We&apos;d love to hear from you. Reach out with questions, feedback, or partnership
                    inquiries and our team will get back to you as soon as possible.
                </p>

                {/* Contact channels */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {channels.map(({ icon: Icon, title, value, desc, href }) => (
                        <div key={title} className="rounded-2xl border border-border p-5">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                                <Icon className="h-5 w-5" />
                            </span>
                            <h2 className="mt-3 font-bold">{title}</h2>
                            {href ? (
                                <a
                                    href={href}
                                    className="mt-1 block text-sm font-semibold text-primary underline-offset-2 hover:underline"
                                >
                                    {value}
                                </a>
                            ) : (
                                <p className="mt-1 text-sm font-semibold">{value}</p>
                            )}
                            <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* In-app complaint prompt */}
                <div className="mt-8 flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <MessageSquareWarning className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="font-semibold">Already a Homify customer?</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            For booking issues, disputes, or feedback about a provider, the fastest way to get
                            help is through the in-app complaints system — it tracks your case and gets a response
                            from our support team.
                        </p>
                        <Link
                            href="/sign-in"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-2 hover:underline"
                        >
                            Sign in to lodge a complaint
                        </Link>
                    </div>
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
