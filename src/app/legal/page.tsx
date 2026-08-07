import Link from "next/link"
import { ChevronRight, FileText, ShieldCheck } from "lucide-react"
import { requireRole } from "@/lib/session"
import { BackButton } from "@/components/back-button"

const DOCS = [
  { href: "/terms", icon: FileText, title: "Terms of Service", desc: "The rules for using Homify GH" },
  { href: "/privacy", icon: ShieldCheck, title: "Privacy Policy", desc: "How we handle your data" },
]

export default async function LegalPage() {
  await requireRole("CUSTOMER")
  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <BackButton className="mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-1 text-3xl font-extrabold">Legal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Our terms and privacy commitments.</p>
        <div className="mt-6 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {DOCS.map((d) => (
            <Link key={d.href} href={d.href} title={d.desc} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"><d.icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{d.title}</span>
                <span className="block text-sm text-muted-foreground">{d.desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
