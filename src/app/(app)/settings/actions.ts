"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { requireRole } from "@/lib/session"

const schema = z.object({
  notificationsEnabled: z.boolean().optional(),
  locationSharingEnabled: z.boolean().optional(),
})

export async function updateSettings(input: z.infer<typeof schema>) {
  const user = await requireRole("CUSTOMER")
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false as const, message: "Could not save that setting." }
  await prisma.user.update({ where: { id: user.id }, data: parsed.data })
  revalidatePath("/settings")
  return { ok: true as const }
}

/** Sign out every other device, keeping the current session active. */
export async function signOutOtherDevices() {
  await requireRole("CUSTOMER")
  try {
    await auth.api.revokeOtherSessions({ headers: await headers() })
  } catch {
    return { ok: false as const, message: "Could not sign out other devices. Please try again." }
  }
  revalidatePath("/settings")
  return { ok: true as const }
}
