"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Logo } from "./logo"
import {
  ChevronDown,
  LayoutDashboard,
  Wrench,
  ShieldCheck,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react"

type SessionUser = {
  name?: string | null
  email?: string | null
  role?: string | null
  onboardingComplete?: boolean | null
}

function homeLabelHref(user: SessionUser): {
  label: string
  href: string
  icon: LucideIcon
} {
  if (!user.onboardingComplete)
    return { label: "Complete setup", href: "/onboarding/account-type", icon: Settings }
  switch (user.role) {
    case "ADMIN":
      return { label: "Moderation", href: "/admin", icon: ShieldCheck }
    case "PROVIDER":
      return { label: "Provider portal", href: "/provider", icon: Wrench }
    default:
      return { label: "Find a pro", href: "/search", icon: LayoutDashboard }
  }
}

/** Routes that render their own app shell — the marketing navbar is hidden here. */
const APP_PREFIXES = ["/search", "/bookings", "/account"]

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  PROVIDER: "Provider",
  CUSTOMER: "Customer",
}

export function Navbar() {
  const { data: session, isPending } = useSession()
  const user = session?.user as SessionUser | undefined
  const pathname = usePathname()

  const dest = user ? homeLabelHref(user) : null

  // The authenticated app area has its own sidebar shell — no marketing navbar.
  if (APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          aria-label="homify GH home"
          className="transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>

        {/* Right side */}
        <nav className="flex items-center gap-1">
          <ThemeToggle />

          {isPending ? (
            <div className="ml-1 h-10 w-24 animate-pulse rounded-full bg-muted" />
          ) : user ? (
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
                {user.role && roleLabels[user.role] && (
                  <div className="px-3 pb-2">
                    <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {roleLabels[user.role]}
                    </span>
                  </div>
                )}
                <DropdownMenuSeparator />
                {dest && (
                  <DropdownMenuItem render={<Link href={dest.href} />} className="gap-2">
                    <dest.icon className="h-4 w-4 text-muted-foreground" />
                    {dest.label}
                  </DropdownMenuItem>
                )}
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
          ) : (
            <div className="ml-1 flex items-center gap-1">
              <Button variant="ghost" size="sm" className="rounded-full font-medium" render={<Link href="/sign-in" />}>
                Sign in
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-primary font-medium text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-[oklch(from_var(--primary)_calc(l-0.06)_c_h)] hover:shadow-[var(--shadow-md)]"
                render={<Link href="/sign-up" />}
              >
                Sign up
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
