"use server"
import { z } from "zod"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
const storeSchema = z.object({ storeName: z.string().trim().min(3).max(60), bio: z.string().trim().min(20).max(900), coverImageUrl: z.union([z.string().url(), z.literal("")]), locationLabel: z.string().trim().min(2).max(120), serviceRadiusKm: z.coerce.number().int().min(1).max(100) })
function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) }
export async function completeStoreSetup(input: z.infer<typeof storeSchema>) { const user = await requireRole("PROVIDER"); const data = storeSchema.parse(input); const current = await prisma.provider.findUnique({ where: { userId: user.id }, select: { storeSlug: true } }); let slug = current?.storeSlug ?? (slugify(data.storeName) || "store"); if (!current?.storeSlug) { const base = slug; for (let suffix = 2; await prisma.provider.findFirst({ where: { storeSlug: slug, NOT: { userId: user.id } }, select: { id: true } }); suffix += 1) slug = `${base}-${suffix}` }; await prisma.provider.update({ where: { userId: user.id }, data: { storeName: data.storeName, storeSlug: slug, bio: data.bio, coverImageUrl: data.coverImageUrl || null, locationLabel: data.locationLabel, serviceRadiusKm: data.serviceRadiusKm, storeSetupComplete: true } }); redirect("/provider") }
