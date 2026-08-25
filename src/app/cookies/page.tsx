import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Cookie Policy | Homify GH",
    description: "Learn how Homify GH uses cookies and similar technologies.",
}

const cookieTypes = [
    {
        name: "Essential cookies",
        purpose:
            "These cookies are required for the platform to function. They manage your login session, keep you authenticated, and enable core features like booking and account management. You cannot opt out of essential cookies.",
        examples: "Session token, CSRF protection token",
    },
    {
        name: "Preference cookies",
        purpose:
            "These cookies remember your settings — such as your selected theme (light or dark mode) — so you do not have to reconfigure the app on every visit.",
        examples: "Theme preference",
    },
    {
        name: "Analytics cookies",
        purpose:
            "We may use analytics cookies to understand how users interact with the platform, which pages are visited most, and where improvements are needed. This data is aggregated and does not personally identify you.",
        examples: "Page views, session duration, feature usage",
    },
]

export default function CookiesPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
                <p className="text-sm font-medium text-primary">Legal</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Cookie Policy</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                    Last updated: August 2026
                </p>

                <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground sm:text-base">
                    <section>
                        <h2 className="text-base font-semibold text-foreground">What are cookies?</h2>
                        <p className="mt-2">
                            Cookies are small text files placed on your device when you visit a website or use
                            a web application. They allow the platform to remember information about your
                            session and preferences, improving your experience on return visits.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-foreground">How Homify GH uses cookies</h2>
                        <p className="mt-2">
                            Homify GH uses cookies to keep you signed in, remember your settings, and
                            understand how customers and providers interact with the platform. We do not sell
                            cookie data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-foreground">Types of cookies we use</h2>
                        <div className="mt-4 space-y-4">
                            {cookieTypes.map(({ name, purpose, examples }) => (
                                <div key={name} className="rounded-2xl border border-border p-4">
                                    <h3 className="font-semibold text-foreground">{name}</h3>
                                    <p className="mt-1">{purpose}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        <span className="font-semibold">Examples: </span>
                                        {examples}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-foreground">Managing cookies</h2>
                        <p className="mt-2">
                            You can control and delete cookies through your browser settings. Be aware that
                            disabling essential cookies will prevent you from signing in and using the
                            platform&apos;s core features. Most browsers allow you to block third-party cookies
                            without affecting essential site functionality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-foreground">Changes to this policy</h2>
                        <p className="mt-2">
                            We may update this Cookie Policy from time to time. Any significant changes will
                            be communicated through the platform. Continued use of Homify GH after changes
                            constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-foreground">Contact</h2>
                        <p className="mt-2">
                            Questions about our use of cookies?{" "}
                            <Link href="/contact" className="font-semibold text-primary underline-offset-2 hover:underline">
                                Contact us
                            </Link>.
                        </p>
                    </section>
                </div>

                <div className="mt-8 flex gap-4">
                    <Link href="/privacy" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                        Terms of Service
                    </Link>
                    <Link href="/" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                        Return home
                    </Link>
                </div>
            </div>
        </div>
    )
}
