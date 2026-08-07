import { BadgeCheck, Handshake, ShieldCheck, Sparkles } from "lucide-react"
import { requireRole } from "@/lib/session"
import { BackButton } from "@/components/back-button"

const POINTS = [
  { icon: BadgeCheck, title: "Verified professionals", desc: "Providers pass an identity review before they can take bookings." },
  { icon: Handshake, title: "Fair, flexible pricing", desc: "See starting prices up front and use Flex to propose your own price." },
  { icon: ShieldCheck, title: "Reviews you can trust", desc: "Only customers with completed bookings can leave a review." },
  { icon: Sparkles, title: "Everything in one place", desc: "Book, track, pay from your wallet and get help without leaving the app." },
]

export default async function AboutPage() {
  await requireRole("CUSTOMER")
  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <BackButton className="mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-primary">About</p>
        <h1 className="mt-1 text-3xl font-extrabold">About Homify GH</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Homify GH connects home owners across Ghana with trusted, verified professionals —
          plumbers, electricians, carpenters, AC technicians, cleaners, painters and masons.
          Find a pro near you, agree a price, book, and manage everything from one place.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {POINTS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary"><p.icon className="h-5 w-5" /></span>
              <h2 className="mt-3 font-bold">{p.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">© {new Date().getFullYear()} Homify GH · Accra, Ghana</p>
      </div>
    </main>
  )
}
