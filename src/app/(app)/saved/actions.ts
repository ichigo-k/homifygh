"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export async function toggleSavedProvider(providerId: string) {
  const user = await requireRole("CUSTOMER")
  const existing = await prisma.savedProvider.findUnique({ where: { customerId_providerId: { customerId: user.id, providerId } } })
  if (existing) await prisma.savedProvider.delete({ where: { id: existing.id } })
  else await prisma.savedProvider.create({ data: { customerId: user.id, providerId } })
  revalidatePath("/saved")
  revalidatePath("/search")
  return { saved: !existing }
}
