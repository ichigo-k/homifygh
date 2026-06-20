import Link from "next/link"
import { redirect } from "next/navigation"
import { requireUser, homeFor } from "@/lib/session"
import { Search, Wrench, ArrowRight } from "lucide-react"

export default async function AccountTypePage() {
  const user = await requireUser()
  // Already onboarded? Go home.
  if (user.onboardingComplete) redirect(homeFor(user.role as "CUSTOMER" | "PROVIDER" | "ADMIN"))

  const options = [
    {
      href: "/onboarding/customer",
      icon: Search,
      title: "I need a service",
      desc: "Book trusted plumbers, electricians, cleaners and more near you.",
      tag: "Customer",
    },
    {
      href: "/onboarding/provider/kyc",
      icon: Wrench,
      title: "I provide a service",
      desc: "Get discovered, accept bookings, and grow your business on Homify.",
      tag: "Provider",
    },
  ]

  return (
    <div>
      <div className="text-center">
        <p className="text-sm font-medium text-primary">Step 1 of 2</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          How will you use Homify?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Hey {user.firstName ?? user.name?.split(" ")[0] ?? "there"} — pick the role that fits you best.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {options.map(({ href, icon: Icon, title, desc, tag }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-lg)]"
          >
            {/* Icon band */}
            <div className="flex items-center justify-center bg-accent/60 py-10 transition-colors duration-300 group-hover:bg-primary/10">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-[var(--shadow-sm)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[var(--shadow-md)]">
                <Icon className="h-8 w-8 text-primary" />
              </span>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6">
              <span className="inline-flex w-fit items-center rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                {tag}
              </span>
              <h2 className="mt-3 text-lg font-bold tracking-tight">{title}</h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Get started
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
