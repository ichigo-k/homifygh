"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export async function updateProfile(input: {
  firstName: string
  lastName: string
  phone: string
  locationLabel: string
}) {
  const user = await requireRole("CUSTOMER")

  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  if (!firstName) throw new Error("First name is required.")

  const name = [firstName, lastName].filter(Boolean).join(" ")

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName,
      lastName: lastName || null,
      name,
      phone: input.phone.trim() || null,
      locationLabel: input.locationLabel.trim() || null,
    },
  })

  revalidatePath("/account")
  revalidatePath("/search")
  revalidatePath("/bookings")
}
