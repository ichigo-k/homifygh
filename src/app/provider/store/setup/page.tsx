import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { StoreEditor } from "./store-editor"
export default async function StoreSetupPage() { const user = await requireRole("PROVIDER"); const provider = await prisma.provider.findUnique({ where: { userId: user.id }, select: { storeName: true, bio: true, coverImageUrl: true, locationLabel: true, serviceRadiusKm: true, storeSetupComplete: true } }); if (!provider) return null; return <StoreEditor initial={{ storeName: provider.storeName ?? "", bio: provider.bio ?? "", coverImageUrl: provider.coverImageUrl ?? "", locationLabel: provider.locationLabel ?? "", serviceRadiusKm: provider.serviceRadiusKm, isComplete: provider.storeSetupComplete }} /> }
