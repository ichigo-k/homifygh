"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"

const schema = z.object({
  workingDays: z.array(z.number().int().min(0).max(6)).min(1),
  workStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  workEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  bookingLeadHours: z.number().int().min(1).max(168),
  unavailableDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(120),
})

export async function updateAvailability(input: z.infer<typeof schema>) {
  const user = await requireRole("PROVIDER")
  const data = schema.parse(input)
  if (data.workEnd <= data.workStart) return { ok: false as const, message: "Closing time must be later than opening time." }
  const provider = await prisma.provider.update({ where: { userId: user.id }, data, select: { id: true } })
  await audit(prisma, { actorId: user.id, action: "PROVIDER_AVAILABILITY_UPDATED", entityType: "Provider", entityId: provider.id })
  revalidatePath("/provider")
  revalidatePath("/provider/availability")
  return { ok: true as const }
}
