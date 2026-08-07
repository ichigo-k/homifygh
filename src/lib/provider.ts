import "server-only"
import { cache } from "react"
import { prisma } from "./prisma"

/**
 * The signed-in provider's own row, deduped per request. The provider layout
 * gates on it and the page inside then reads it for free, instead of each
 * making its own round trip. Scalars only — bookings, services and portfolio
 * are fetched by the pages that actually render them.
 */
export const getMyProvider = cache(async (userId: string) =>
  prisma.provider.findUnique({ where: { userId } })
)
