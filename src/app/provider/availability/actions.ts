"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const schema = z.object({
  workingDays: z.array(z.number().int().min(0).max(6)).min(1),
  workStart: z.string().regex(TIME),
  workEnd: z.string().regex(TIME),
  breakStart: z.union([z.string().regex(TIME), z.literal("")]).optional(),
  breakEnd: z.union([z.string().regex(TIME), z.literal("")]).optional(),
  bufferMinutes: z.number().int().min(0).max(240),
  bookingLeadHours: z.number().int().min(1).max(168),
  unavailableDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(120),
})

export async function updateAvailability(input: z.infer<typeof schema>) {
  const user = await requireRole("PROVIDER")
  const data = schema.parse(input)
  if (data.workEnd <= data.workStart) return { ok: false as const, message: "Closing time must be later than opening time." }
  const hasBreak = Boolean(data.breakStart && data.breakEnd)
  if (hasBreak) {
    if (data.breakEnd! <= data.breakStart!) return { ok: false as const, message: "Break end must be later than break start." }
    if (data.breakStart! < data.workStart || data.breakEnd! > data.workEnd) return { ok: false as const, message: "The break must fall within your working hours." }
  }
  const provider = await prisma.provider.update({
    where: { userId: user.id },
    data: {
      workingDays: data.workingDays,
      workStart: data.workStart,
      workEnd: data.workEnd,
      breakStart: hasBreak ? data.breakStart : null,
      breakEnd: hasBreak ? data.breakEnd : null,
      bufferMinutes: data.bufferMinutes,
      bookingLeadHours: data.bookingLeadHours,
      unavailableDates: data.unavailableDates,
    },
    select: { id: true },
  })
  await audit(prisma, { actorId: user.id, action: "PROVIDER_AVAILABILITY_UPDATED", entityType: "Provider", entityId: provider.id })
  revalidatePath("/provider")
  revalidatePath("/provider/availability")
  return { ok: true as const }
}
