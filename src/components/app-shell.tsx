"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search,
  CalendarCheck,
  UserCog,
  LogOut,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ShellUser = {
  name: string
  email: string
  role: string
  image: string | null
}

const NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Find a pro", href: "/search", icon: Search },
  { label: "My bookings", href: "/bookings", icon: CalendarCheck },
]

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  PROVIDER: "Provider",
  CUSTOMER: "Customer",
}

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/search" aria-label="homify GH home" className="transition-opacity hover:opacity-80">
              <Logo />
            </Link>

            {/* Primary nav */}
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: theme + user */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="group ml-1 flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] aria-expanded:shadow-[var(--shadow-md)]" />
                }
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:block">{user.name?.split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-aria-expanded:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 shadow-[var(--shadow-lg)]">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="px-3 pb-2">
                  <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {roleLabels[user.role] ?? "Customer"}
                  </span>
                </div>
                <DropdownMenuSeparator />
                {/* Mobile-only primary nav */}
                <div className="sm:hidden">
                  {NAV.map(({ label, href, icon: Icon }) => (
                    <DropdownMenuItem key={href} render={<Link href={href} />} className="gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>
                <DropdownMenuItem render={<Link href="/account" />} className="gap-2">
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                  Account settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
