"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"

export async function deleteCustomerAccount(confirmation: string) {
  const user = await requireRole("CUSTOMER")
  if (confirmation !== "DELETE MY ACCOUNT") return { ok: false as const, message: "Type DELETE MY ACCOUNT exactly." }
  await audit(prisma, { actorId: user.id, action: "ACCOUNT_DELETION_REQUESTED", entityType: "User", entityId: user.id })
  await prisma.user.delete({ where: { id: user.id } })
  redirect("/")
}
