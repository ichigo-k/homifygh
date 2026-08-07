import "server-only"
import { cache } from "react"
import { prisma } from "./prisma"

/**
 * Unread notifications for the nav badge, deduped per request so a layout and
 * the page inside it share one round trip. Covered by the
 * [userId, readAt, createdAt] index on Notification.
 */
export const unreadNotificationCount = cache(async (userId: string) =>
  prisma.notification.count({ where: { userId, readAt: null } })
)
