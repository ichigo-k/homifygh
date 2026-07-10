import { prisma } from "@/lib/prisma"
import { requireOnboarded } from "@/lib/session"
import { NotificationsClient } from "./notifications-client"

export default async function NotificationsPage() {
  const user = await requireOnboarded()
  const rows = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 })
  return <NotificationsClient items={rows.map((item) => ({ id: item.id, title: item.title, message: item.message, href: item.href, read: Boolean(item.readAt), createdAt: item.createdAt.toISOString() }))} />
}
