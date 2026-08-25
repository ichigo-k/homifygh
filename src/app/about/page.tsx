import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us | Homify GH",
  description: "Learn about Homify GH — Ghana's marketplace connecting homeowners with verified home service professionals.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">About Homify GH</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Transforming home services across Ghana
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Homify GH is Ghana&apos;s digital marketplace connecting homeowners, tenants, and businesses with vetted, reliable, and skilled local service professionals. Whether you need an emergency plumber, an electrician, a cleaner, or a carpenter, Homify GH makes finding trusted tradespeople effortless.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <BadgeCheck className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-bold">Verified Professionals</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Every provider undergoes identity review using Ghana Card verification before accepting jobs.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-bold">Fair & Flex Pricing</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We empower customers and providers to negotiate prices transparently before work begins.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-bold">Dispute Protection</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              End-to-end complaint resolution ensures customers get quality work and providers get paid promptly.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <Users className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-bold">Empowering Artisans</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We give Ghanaian craftsmen digital tools to grow their business, manage earnings, and build trust.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            Find a professional
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-up?as=provider"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-bold transition hover:bg-muted/40"
          >
            Join as a provider
          </Link>
        </div>
      </div>
    </div>
  )
}
