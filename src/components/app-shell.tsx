"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Bookmark, CalendarCheck, ChevronDown, LogOut, Search, UserCog, type LucideIcon } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type ShellUser = { name: string; email: string; role: string; image: string | null }
const NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Find a pro", href: "/search", icon: Search },
  { label: "My bookings", href: "/bookings", icon: CalendarCheck },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Notifications", href: "/notifications", icon: Bell },
]
const roleLabels: Record<string,string> = { ADMIN: "Admin", PROVIDER: "Provider", CUSTOMER: "Customer" }
export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) { const pathname = usePathname(); return <div className="flex min-h-screen flex-col"><header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"><div className="flex items-center gap-5"><Link href="/search" aria-label="Homify GH home"><Logo /></Link><nav className="hidden items-center gap-1 lg:flex">{NAV.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium ${pathname === href || pathname.startsWith(href + "/") ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted"}`}><Icon className="h-4 w-4" />{label}</Link>)}</nav></div><div className="flex items-center gap-1"><ThemeToggle /><DropdownMenu><DropdownMenuTrigger render={<button className="group ml-1 flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3" />}><Avatar className="h-7 w-7"><AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar><span className="hidden text-sm font-medium sm:block">{user.name.split(" ")[0]}</span><ChevronDown className="h-4 w-4 text-muted-foreground" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-60"><div className="px-3 py-2"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p><span className="mt-2 inline-flex rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">{roleLabels[user.role] ?? "Customer"}</span></div><DropdownMenuSeparator />{NAV.map(({ label, href, icon: Icon }) => <DropdownMenuItem key={href} render={<Link href={href} />} className="gap-2 lg:hidden"><Icon className="h-4 w-4" />{label}</DropdownMenuItem>)}<DropdownMenuItem render={<Link href="/account" />} className="gap-2"><UserCog className="h-4 w-4" />Account settings</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="gap-2 text-destructive" onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}><LogOut className="h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div></header><main className="flex-1">{children}</main></div> }
