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
        <p className="mt-4 text-xs text-muted-foreground">Last updated: August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground sm:text-base">
          <section>
            <h2 className="text-base font-semibold text-foreground">1. Acceptance of terms</h2>
            <p className="mt-2">
              By registering for or using Homify GH, you agree to be bound by these Terms of
              Service. If you do not agree, do not use the platform. We may update these terms
              from time to time; continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. Eligibility</h2>
            <p className="mt-2">
              You must be at least 18 years old and legally capable of entering into a binding
              agreement to use Homify GH. By registering, you confirm that you meet these
              requirements. Accounts must be registered with accurate, current information.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. User accounts</h2>
            <p className="mt-2">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity that occurs under your account. Notify us immediately if you
              suspect unauthorised access. We reserve the right to suspend or terminate accounts
              that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. The Homify GH marketplace</h2>
            <p className="mt-2">
              Homify GH is a technology platform that connects customers with independent
              service providers. We do not directly employ service providers and are not a party
              to any contract formed between a customer and a provider. Homify GH acts solely as
              an intermediary facilitating introductions, bookings, and payments.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Bookings and payments</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Bookings are requests — a booking is confirmed only once the service provider
                accepts it.
              </li>
              <li>
                With Flex pricing, customers may propose a price; providers may accept,
                counter-offer, or decline. An agreed amount is binding once both parties confirm.
              </li>
              <li>
                Payments made through the Homify wallet are processed securely. Pay After Service
                bookings are settled directly between customer and provider.
              </li>
              <li>
                Cancellation terms depend on the booking status. Customers may cancel pending or
                confirmed bookings; cancellation of in-progress bookings should be agreed with
                the provider.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">6. Provider verification</h2>
            <p className="mt-2">
              Providers are required to submit identity documents for review before they can
              accept bookings. Verification reduces but does not eliminate all risk. Homify GH
              does not guarantee the quality, safety, or legality of services rendered. Customers
              should exercise their own judgement when selecting a provider.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">7. Reviews and content</h2>
            <p className="mt-2">
              Reviews may only be submitted by customers with a completed booking. You agree not
              to submit false, misleading, or defamatory reviews. Homify GH reserves the right
              to remove content that violates these terms or applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">8. Prohibited conduct</h2>
            <p className="mt-2">You must not:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the platform for any unlawful purpose.</li>
              <li>Impersonate another person or entity.</li>
              <li>Submit false identity documents during provider verification.</li>
              <li>Attempt to circumvent the platform by arranging payments outside Homify GH to avoid fees.</li>
              <li>Harass, abuse, or threaten other users or our staff.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">9. Disputes between users</h2>
            <p className="mt-2">
              Homify GH provides a dispute resolution process to help resolve disagreements
              between customers and service providers. Both parties agree to engage with this
              process in good faith. Homify GH&apos;s decision on a dispute is final for platform
              purposes but does not affect any legal rights you may have.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">10. Limitation of liability</h2>
            <p className="mt-2">
              To the fullest extent permitted by Ghanaian law, Homify GH is not liable for any
              indirect, incidental, or consequential damages arising from your use of the
              platform or from services provided by independent providers. Our total liability
              for any claim will not exceed the amount paid through the platform in connection
              with the relevant booking.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">11. Governing law</h2>
            <p className="mt-2">
              These terms are governed by the laws of the Republic of Ghana. Disputes will be
              subject to the exclusive jurisdiction of the courts of Ghana.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">12. Contact</h2>
            <p className="mt-2">
              Questions about these terms:{" "}
              <a
                href="mailto:hello@homify.gh"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                hello@homify.gh
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/privacy" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/cookies" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Cookie Policy
          </Link>
          <Link href="/" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Return home
          </Link>
        </div>
      </div>
    </div>
  )
}
