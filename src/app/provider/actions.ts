"use server"

import { z } from "zod"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

const storeSchema = z.object({
  storeName: z.string().trim().min(3, "Store name is too short").max(60),
  bio: z.string().trim().min(20, "Add a bit more detail"),
})

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
}

export async function completeStoreSetup(input: z.infer<typeof storeSchema>) {
  const user = await requireRole("PROVIDER")
  const data = storeSchema.parse(input)

  // Ensure a unique slug.
  const base = slugify(data.storeName) || "store"
  let slug = base
  for (let i = 2; ; i++) {
    const taken = await prisma.provider.findFirst({
      where: { storeSlug: slug, NOT: { userId: user.id } },
      select: { id: true },
    })
    if (!taken) break
    slug = `${base}-${i}`
  }

  await prisma.provider.update({
    where: { userId: user.id },
    data: {
      storeName: data.storeName,
      storeSlug: slug,
      bio: data.bio,
      storeSetupComplete: true,
    },
  })

  redirect("/provider")
}
