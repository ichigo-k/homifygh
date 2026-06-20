"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, ShieldCheck, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth-client"

interface AdminNavProps {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()

  const links = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Provider Review", href: "/admin/providers", icon: Users },
  ]

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ───────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-border/40 bg-card p-4 relative">
        <div className="space-y-6">
          {/* Header */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-foreground">Control Center</h2>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">Moderator</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
              Menu
            </p>
            {links.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-primary" />
                  )}
                  <Icon className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    active ? "text-primary" : "text-muted-foreground group-hover:scale-115 group-hover:text-foreground"
                  )} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer: Moderator profile card */}
        <div className="border-t border-border/40 pt-4 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-muted/30">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}
            className="w-full flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MOBILE SUB-NAVIGATION BAR ────────────────────────── */}
      <div className="lg:hidden border-b border-border/40 bg-card px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1">
            {links.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
          
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}
            className="flex items-center gap-1 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-full px-3 py-2 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}
