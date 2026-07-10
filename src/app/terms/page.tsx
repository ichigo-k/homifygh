import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | Homify GH",
}

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <p className="text-sm font-medium text-primary">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          This page keeps the sign-up flow functional. Replace it with your actual terms before publishing the app.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-6 text-muted-foreground sm:text-base">
          <section>
            <h2 className="text-base font-semibold text-foreground">Using the platform</h2>
            <p className="mt-2">Users must provide accurate details and use the service in line with local laws and platform rules.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Bookings and payments</h2>
            <p className="mt-2">Service availability, pricing, and booking outcomes may vary by provider and location.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Liability</h2>
            <p className="mt-2">The production terms should clearly define responsibilities for providers, customers, and the platform.</p>
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