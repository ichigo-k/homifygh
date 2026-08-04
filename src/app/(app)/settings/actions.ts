"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
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
