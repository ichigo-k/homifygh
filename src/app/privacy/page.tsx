import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | Homify GH",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <p className="text-sm font-medium text-primary">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          This page is a lightweight placeholder so the public links work. It should be replaced with your production privacy policy before launch.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-6 text-muted-foreground sm:text-base">
          <section>
            <h2 className="text-base font-semibold text-foreground">What we collect</h2>
            <p className="mt-2">Account details, booking activity, and support messages needed to operate the platform.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">How we use it</h2>
            <p className="mt-2">To authenticate users, process bookings, improve service quality, and send account-related notifications.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Contact</h2>
            <p className="mt-2">
              Questions about privacy should be handled by the product owner or support team.
            </p>
          </section>
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