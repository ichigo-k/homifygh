"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireOnboarded } from "@/lib/session"

export async function markNotificationRead(notificationId: string) {
  const user = await requireOnboarded()
  await prisma.notification.updateMany({ where: { id: notificationId, userId: user.id }, data: { readAt: new Date() } })
  revalidatePath("/notifications")
}

export async function markAllNotificationsRead() {
  const user = await requireOnboarded()
  await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } })
  revalidatePath("/notifications")
}
