import Link from "next/link"
import { requireRole } from "@/lib/session"
import { ShieldCheck, LayoutDashboard, Users } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("ADMIN")

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-56 shrink-0 border-r border-border/50 bg-muted/20 lg:block">
        <div className="flex flex-col gap-0.5 p-3 pt-4">
          <p className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Moderation
          </p>
          {[
            { label: "Overview", href: "/admin", icon: LayoutDashboard },
            { label: "Provider review", href: "/admin/providers", icon: Users },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </aside>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
