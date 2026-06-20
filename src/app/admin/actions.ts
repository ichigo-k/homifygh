"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { sendStoreSetupEmail, sendRejectionEmail } from "@/lib/email"

const appBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export async function approveProvider(providerId: string) {
  const admin = await requireRole("ADMIN")
  z.string().min(1).parse(providerId)

  const provider = await prisma.provider.update({
    where: { id: providerId },
    data: {
      status: "APPROVED",
      isVerified: true,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      reviewNotes: null,
    },
    include: { user: true },
  })

  await sendStoreSetupEmail(
    provider.user.email,
    provider.user.firstName ?? provider.user.name,
    `${appBase}/provider/store/setup`
  )

  revalidatePath("/admin/providers")
  revalidatePath(`/admin/providers/${providerId}`)
}

const rejectSchema = z.object({
  providerId: z.string().min(1),
  notes: z.string().trim().min(5, "Add a short reason"),
})

export async function rejectProvider(input: z.infer<typeof rejectSchema>) {
  const admin = await requireRole("ADMIN")
  const { providerId, notes } = rejectSchema.parse(input)

  const provider = await prisma.provider.update({
    where: { id: providerId },
    data: {
      status: "REJECTED",
      isVerified: false,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      reviewNotes: notes,
    },
    include: { user: true },
  })

  await sendRejectionEmail(
    provider.user.email,
    provider.user.firstName ?? provider.user.name,
    notes,
    `${appBase}/onboarding/provider/kyc`
  )

  revalidatePath("/admin/providers")
  revalidatePath(`/admin/providers/${providerId}`)
}
