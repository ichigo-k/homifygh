import Link from "next/link"
import { ChevronRight, FileText, HelpCircle, Info, MessageSquareWarning, Settings, UserCog, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/components/back-button"

const ITEMS: { href: string; icon: LucideIcon; title: string; desc: string }[] = [
  { href: "/wallet", icon: Wallet, title: "Wallet", desc: "Deposit funds and use them for your bookings" },
  { href: "/complaints", icon: MessageSquareWarning, title: "Complaints", desc: "Lodge a complaint and track our response" },
  { href: "/account", icon: UserCog, title: "Account", desc: "Complete and update your personal details" },
  { href: "/settings", icon: Settings, title: "Settings", desc: "Notifications, live location and preferences" },
  { href: "/about", icon: Info, title: "About", desc: "What Homify GH is and how it works" },
  { href: "/help", icon: HelpCircle, title: "Help & feedback", desc: "Get answers or send us your feedback" },
  { href: "/legal", icon: FileText, title: "Legal", desc: "Terms of service and privacy policy" },
]

export default async function MorePage() {
  const user = await requireRole("CUSTOMER")
  const wallet = await prisma.user.findUnique({ where: { id: user.id }, select: { walletBalance: true } })

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <BackButton className="mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Everything else</p>
        <h1 className="mt-1 text-3xl font-extrabold">More</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your wallet, complaints, account and app settings.</p>

        <Link
          href="/wallet"
          title="Open your wallet to deposit or spend"
          className="mt-6 flex items-center justify-between rounded-3xl border border-primary/20 bg-primary/5 p-5"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Wallet balance</p>
            <p className="mt-1 text-2xl font-extrabold">GH₵{(wallet?.walletBalance ?? 0).toLocaleString()}</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Wallet className="h-6 w-6" /></span>
        </Link>

        <div className="mt-4 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {ITEMS.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href} title={desc} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-muted-foreground">{desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
