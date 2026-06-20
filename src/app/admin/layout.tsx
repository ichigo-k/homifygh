import { requireRole } from "@/lib/session"
import { AdminNav } from "./admin-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole("ADMIN")

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-muted/10">
      <AdminNav user={user} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
