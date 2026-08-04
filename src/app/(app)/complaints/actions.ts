"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

const complaintSchema = z.object({
  category: z.enum(["BOOKING", "PROVIDER", "PAYMENT", "APP", "OTHER"]),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
})

export async function submitComplaint(input: z.infer<typeof complaintSchema>) {
  const user = await requireRole("CUSTOMER")
  const parsed = complaintSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, message: "Add a subject and describe the issue (at least 10 characters)." }

  await prisma.complaint.create({
    data: { userId: user.id, category: parsed.data.category, subject: parsed.data.subject, message: parsed.data.message },
  })
  revalidatePath("/complaints")
  return { ok: true as const }
}
