"use server"

import { prisma } from "@/lib/prisma"

export async function isEmailTaken(email: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) return false

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  return Boolean(user)
}