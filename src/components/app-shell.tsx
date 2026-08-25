"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Bookmark, CalendarCheck, ChevronDown, LayoutGrid, LogOut, Search, UserCog, Wallet, type LucideIcon } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatBot } from "@/components/chat-bot"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type ShellUser = { name: string; email: string; role: string; image: string | null }

// `hint` is surfaced as a native tooltip so hovering any item briefly describes
// what it does — helps first-time and low-vision users navigate with confidence.
const NAV: { label: string; href: string; icon: LucideIcon; hint: string }[] = [
  { label: "Find a pro", href: "/search", icon: Search, hint: "Browse and book verified service providers near you" },
  { label: "My bookings", href: "/bookings", icon: CalendarCheck, hint: "Track your active and past service bookings" },
  { label: "Saved", href: "/saved", icon: Bookmark, hint: "Providers you've shortlisted for later" },
  { label: "Notifications", href: "/notifications", icon: Bell, hint: "Booking and account updates" },
  { label: "More", href: "/more", icon: LayoutGrid, hint: "Wallet, complaints, account, settings, help and legal" },
]

const roleLabels: Record<string, string> = { ADMIN: "Admin", PROVIDER: "Provider", CUSTOMER: "Customer" }

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/search" aria-label="Homify GH home" title="Homify GH — home">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map(({ label, href, icon: Icon, hint }) => (
                <Link
                  key={href}
                  href={href}
                  title={hint}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold ${isActive(href) ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger render={<button title="Your account menu" className="group ml-1 flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3" />}>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-semibold sm:block">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  <span className="mt-2 inline-flex rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">{roleLabels[user.role] ?? "Customer"}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/wallet" title="Deposit and use your Homify wallet" />} className="gap-2">
                  <Wallet className="h-4 w-4" />
                  Wallet
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account" title="Complete or edit your account details" />} className="gap-2">
                  <UserCog className="h-4 w-4" />
                  Account settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive" onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content — add bottom padding on mobile so bottom nav doesn't obscure it */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${active ? "text-primary" : "text-muted-foreground"
                }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              <span className="leading-none">{label === "My bookings" ? "Bookings" : label === "Find a pro" ? "Find pro" : label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Floating help assistant, available on every customer page. */}
      <ChatBot />
    </div>
  )
}
