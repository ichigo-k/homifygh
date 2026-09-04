"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"

const serviceSchema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(300), startingPrice: z.number().positive().max(1_000_000).nullable() })
export async function addService(input: z.infer<typeof serviceSchema>) { const user = await requireRole("PROVIDER"); const data = serviceSchema.parse(input); const provider = await prisma.provider.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } }); const service = await prisma.serviceOffering.create({ data: { providerId: provider.id, ...data, description: data.description || null } }); await audit(prisma, { actorId: user.id, action: "SERVICE_CREATED", entityType: "ServiceOffering", entityId: service.id }); revalidatePath("/provider/business"); return { ok: true as const } }
export async function removeService(id: string) { const user = await requireRole("PROVIDER"); await prisma.serviceOffering.deleteMany({ where: { id, provider: { userId: user.id } } }); revalidatePath("/provider/business") }
const portfolioSchema = z.object({ imageUrl: z.string().url(), beforeImageUrl: z.union([z.string().url(), z.literal("")]).optional(), category: z.string().trim().max(40).optional(), caption: z.string().trim().max(120) })
export async function addPortfolioImage(input: z.infer<typeof portfolioSchema>) { const user = await requireRole("PROVIDER"); const data = portfolioSchema.parse(input); const provider = await prisma.provider.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } }); await prisma.portfolioImage.create({ data: { providerId: provider.id, imageUrl: data.imageUrl, beforeImageUrl: data.beforeImageUrl || null, category: data.category || null, caption: data.caption || null } }); revalidatePath("/provider/business"); return { ok: true as const } }
export async function removePortfolioImage(id: string) { const user = await requireRole("PROVIDER"); await prisma.portfolioImage.deleteMany({ where: { id, provider: { userId: user.id } } }); revalidatePath("/provider/business") }
