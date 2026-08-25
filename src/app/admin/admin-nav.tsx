"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlertTriangle, CalendarDays, LayoutDashboard, LogOut, MessageSquareWarning, ShieldCheck, Users } from "lucide-react"
import { signOut } from "@/lib/auth-client"

const links = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Provider review", href: "/admin/providers", icon: Users },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { label: "Complaints", href: "/admin/complaints", icon: MessageSquareWarning },
  { label: "Disputes", href: "/admin/disputes", icon: AlertTriangle },
]

export function AdminNav({ user }: { user: { name: string; email: string; image?: string | null } }) {
  const pathname = usePathname()
  return (
    <>
      <aside className="relative hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-card p-4 lg:flex">
        <div>
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold">Control Center</h2>
              <p className="text-[10px] font-semibold uppercase text-primary">Administrator</p>
            </div>
          </div>
          <nav className="mt-6 space-y-1">
            {links.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="border-t border-border pt-4">
          <p className="truncate text-xs font-semibold">{user.name}</p>
          <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>
      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card p-2 lg:hidden">
        {links.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${pathname === href ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
