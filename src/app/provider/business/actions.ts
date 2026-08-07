"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"

const MAX_SERVICES = 30
const MAX_PORTFOLIO = 40

type Result = { ok: true } | { ok: false; message: string }

/** Resolves the signed-in provider. Every mutation below is additionally scoped by this id so one provider can never reach another's rows. */
async function myProviderId(userId: string) { const provider = await prisma.provider.findUniqueOrThrow({ where: { userId }, select: { id: true } }); return provider.id }
function refresh() { revalidatePath("/provider/business") }

const serviceSchema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().max(300), startingPrice: z.number().positive().max(1_000_000).nullable() })
const INVALID_SERVICE = "Use a name of 2–80 characters, a description under 300, and a price above zero."

async function nameTaken(providerId: string, name: string, exceptId?: string) {
  const clash = await prisma.serviceOffering.findFirst({ where: { providerId, name: { equals: name, mode: "insensitive" }, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } })
  return clash != null
}

export async function addService(input: z.infer<typeof serviceSchema>): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: INVALID_SERVICE }
  const providerId = await myProviderId(user.id)
  if (await prisma.serviceOffering.count({ where: { providerId } }) >= MAX_SERVICES) return { ok: false, message: `You can list up to ${MAX_SERVICES} services.` }
  if (await nameTaken(providerId, parsed.data.name)) return { ok: false, message: "You already offer a service with that name." }
  const service = await prisma.serviceOffering.create({ data: { providerId, ...parsed.data, description: parsed.data.description || null } })
  await audit(prisma, { actorId: user.id, action: "SERVICE_CREATED", entityType: "ServiceOffering", entityId: service.id })
  refresh()
  return { ok: true }
}

const serviceEditSchema = serviceSchema.extend({ id: z.string().min(1) })

export async function updateService(input: z.infer<typeof serviceEditSchema>): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const parsed = serviceEditSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: INVALID_SERVICE }
  const { id, ...data } = parsed.data
  const providerId = await myProviderId(user.id)
  if (await nameTaken(providerId, data.name, id)) return { ok: false, message: "You already offer a service with that name." }
  const { count } = await prisma.serviceOffering.updateMany({ where: { id, providerId }, data: { ...data, description: data.description || null } })
  if (!count) return { ok: false, message: "That service no longer exists." }
  await audit(prisma, { actorId: user.id, action: "SERVICE_UPDATED", entityType: "ServiceOffering", entityId: id })
  refresh()
  return { ok: true }
}

/** Pausing hides a service from search and the public profile without losing it — both read `active: true`. */
export async function setServiceActive(id: string, active: boolean): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const providerId = await myProviderId(user.id)
  const { count } = await prisma.serviceOffering.updateMany({ where: { id, providerId }, data: { active } })
  if (!count) return { ok: false, message: "That service no longer exists." }
  await audit(prisma, { actorId: user.id, action: active ? "SERVICE_PUBLISHED" : "SERVICE_PAUSED", entityType: "ServiceOffering", entityId: id })
  refresh()
  return { ok: true }
}

export async function removeService(id: string): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const providerId = await myProviderId(user.id)
  const { count } = await prisma.serviceOffering.deleteMany({ where: { id, providerId } })
  if (!count) return { ok: false, message: "That service no longer exists." }
  await audit(prisma, { actorId: user.id, action: "SERVICE_DELETED", entityType: "ServiceOffering", entityId: id })
  refresh()
  return { ok: true }
}

const portfolioSchema = z.object({ imageUrl: z.string().url(), caption: z.string().trim().max(120) })
const captionSchema = z.object({ id: z.string().min(1), caption: z.string().trim().max(120) })

export async function addPortfolioImage(input: z.infer<typeof portfolioSchema>): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const parsed = portfolioSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Upload an image and keep the caption under 120 characters." }
  const providerId = await myProviderId(user.id)
  if (await prisma.portfolioImage.count({ where: { providerId } }) >= MAX_PORTFOLIO) return { ok: false, message: `Your portfolio holds up to ${MAX_PORTFOLIO} photos.` }
  const last = await prisma.portfolioImage.findFirst({ where: { providerId }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } })
  const image = await prisma.portfolioImage.create({ data: { providerId, imageUrl: parsed.data.imageUrl, caption: parsed.data.caption || null, sortOrder: (last?.sortOrder ?? -1) + 1 } })
  await audit(prisma, { actorId: user.id, action: "PORTFOLIO_IMAGE_ADDED", entityType: "PortfolioImage", entityId: image.id })
  refresh()
  return { ok: true }
}

export async function updatePortfolioCaption(input: z.infer<typeof captionSchema>): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const parsed = captionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Keep the caption under 120 characters." }
  const providerId = await myProviderId(user.id)
  const { count } = await prisma.portfolioImage.updateMany({ where: { id: parsed.data.id, providerId }, data: { caption: parsed.data.caption || null } })
  if (!count) return { ok: false, message: "That photo no longer exists." }
  refresh()
  return { ok: true }
}

/**
 * Moves one photo a single place up or down. Photos created before ordering
 * existed all share `sortOrder: 0`, so rather than swapping two rows we rewrite
 * the whole list into sequential positions — the first move normalises the set.
 */
export async function movePortfolioImage(id: string, direction: "up" | "down"): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const providerId = await myProviderId(user.id)
  const items = await prisma.portfolioImage.findMany({ where: { providerId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true } })
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return { ok: false, message: "That photo no longer exists." }
  const target = direction === "up" ? index - 1 : index + 1
  if (target < 0 || target >= items.length) return { ok: true }
  const [moved] = items.splice(index, 1)
  items.splice(target, 0, moved)
  await prisma.$transaction(items.map((item, position) => prisma.portfolioImage.update({ where: { id: item.id }, data: { sortOrder: position } })))
  refresh()
  return { ok: true }
}

export async function removePortfolioImage(id: string): Promise<Result> {
  const user = await requireRole("PROVIDER")
  const providerId = await myProviderId(user.id)
  const { count } = await prisma.portfolioImage.deleteMany({ where: { id, providerId } })
  if (!count) return { ok: false, message: "That photo no longer exists." }
  await audit(prisma, { actorId: user.id, action: "PORTFOLIO_IMAGE_REMOVED", entityType: "PortfolioImage", entityId: id })
  refresh()
  return { ok: true }
}
