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
        <p className="mt-4 text-xs text-muted-foreground">Last updated: August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground sm:text-base">
          <section>
            <h2 className="text-base font-semibold text-foreground">1. Who we are</h2>
            <p className="mt-2">
              Homify GH operates a marketplace connecting customers with verified home-service
              professionals across Ghana. When you use our platform — whether as a customer,
              service provider, or visitor — you trust us with your information. This policy
              explains what we collect, how we use it, and the choices you have.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. Information we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium text-foreground">Account details</span> — name, email
                address, phone number, and profile photo provided during registration.
              </li>
              <li>
                <span className="font-medium text-foreground">Identity documents</span> — for
                service providers only: Ghana Card (front and back) and a selfie for identity
                verification.
              </li>
              <li>
                <span className="font-medium text-foreground">Location data</span> — service
                address entered during booking, and optional live location when you enable it in
                settings.
              </li>
              <li>
                <span className="font-medium text-foreground">Booking and transaction data</span>{" "}
                — details of bookings made, payment status, and wallet transactions.
              </li>
              <li>
                <span className="font-medium text-foreground">Communications</span> — reviews,
                complaints, and messages sent through the platform.
              </li>
              <li>
                <span className="font-medium text-foreground">Device and usage data</span> —
                browser type, IP address, and pages visited, collected automatically when you
                use the platform.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. How we use your information</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To create and manage your account and verify your identity.</li>
              <li>To match customers with service providers and process bookings.</li>
              <li>To process payments and maintain wallet transaction records.</li>
              <li>To send booking confirmations, updates, and account notifications.</li>
              <li>To investigate complaints and resolve disputes between customers and providers.</li>
              <li>To improve the platform, detect fraud, and maintain security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. How we share your information</h2>
            <p className="mt-2">
              We do not sell your personal data. We share information only when necessary to
              operate the service:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium text-foreground">With service providers</span> — your
                name, booking address, and job details are shared with the provider you book.
              </li>
              <li>
                <span className="font-medium text-foreground">With payment processors</span> —
                Mobile Money transaction data is handled by our payment partner.
              </li>
              <li>
                <span className="font-medium text-foreground">With cloud services</span> — uploaded
                images are stored securely via Cloudinary.
              </li>
              <li>
                <span className="font-medium text-foreground">Where required by law</span> — we
                will disclose information to comply with legal obligations or protect the safety
                of our users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Data retention</h2>
            <p className="mt-2">
              We retain your account and booking data for as long as your account is active and
              for a reasonable period afterwards to resolve disputes or comply with legal
              obligations. Identity verification documents are retained for compliance purposes.
              You may request deletion of your account and personal data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">6. Security</h2>
            <p className="mt-2">
              Passwords are hashed and never stored in plain text. All data transmitted between
              your device and our servers is encrypted using TLS. We apply access controls to
              limit who within our team can view sensitive data. No system is completely immune
              to breaches — if a security incident affects your data, we will notify you promptly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">7. Your rights</h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete information via Account settings.</li>
              <li>Delete your account and associated data.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights,{" "}
              <Link
                href="/contact"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                contact us
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">8. Cookies</h2>
            <p className="mt-2">
              We use essential cookies to keep you signed in and remember your preferences. See
              our{" "}
              <Link
                href="/cookies"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Cookie Policy
              </Link>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">9. Changes to this policy</h2>
            <p className="mt-2">
              We may update this policy from time to time. We will notify you of significant
              changes via the platform. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">10. Contact</h2>
            <p className="mt-2">
              Privacy questions or data requests:{" "}
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
          <Link href="/terms" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Terms of Service
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
