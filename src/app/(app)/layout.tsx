import { requireRole } from "@/lib/session"
import { AppShell, type ShellUser } from "@/components/app-shell"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("CUSTOMER")

  const shellUser: ShellUser = {
    name: user.name ?? "User",
    email: user.email ?? "",
    role: (user.role as string) ?? "CUSTOMER",
    image: user.image ?? null,
  }

  return <AppShell user={shellUser}>{children}</AppShell>
}
