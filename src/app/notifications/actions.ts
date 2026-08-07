"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireOnboarded } from "@/lib/session"

export async function markNotificationRead(notificationId: string) {
  const user = await requireOnboarded()
  await prisma.notification.updateMany({ where: { id: notificationId, userId: user.id }, data: { readAt: new Date() } })
  // The unread badge is rendered by the customer shell layout and the provider
  // dashboard, not by this page, so revalidating /notifications alone would
  // leave a stale count sitting on every other route.
  revalidatePath("/notifications")
  revalidatePath("/provider")
  revalidatePath("/", "layout")
}

export async function markAllNotificationsRead() {
  const user = await requireOnboarded()
  await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } })
  // The unread badge is rendered by the customer shell layout and the provider
  // dashboard, not by this page, so revalidating /notifications alone would
  // leave a stale count sitting on every other route.
  revalidatePath("/notifications")
  revalidatePath("/provider")
  revalidatePath("/", "layout")
}
