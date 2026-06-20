import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { CATEGORIES } from "@/lib/categories"
import { SearchClient, type SearchProvider } from "./search-client"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const user = await requireRole("CUSTOMER")
  const { category, q } = await searchParams

  const validCategory = CATEGORIES.find((c) => c.slug === category)?.slug

  const rows = await prisma.provider.findMany({
    where: {
      status: "APPROVED",
      storeSetupComplete: true,
      ...(validCategory ? { category: validCategory } : {}),
      ...(q
        ? {
            OR: [
              { storeName: { contains: q, mode: "insensitive" } },
              { locationLabel: { contains: q, mode: "insensitive" } },
              { bio: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ avgRating: "desc" }, { totalReviews: "desc" }],
    select: {
      id: true,
      storeName: true,
      bio: true,
      coverImageUrl: true,
      category: true,
      locationLabel: true,
      avgRating: true,
      totalReviews: true,
      isVerified: true,
      user: { select: { name: true, image: true } },
    },
  })

  const providers: SearchProvider[] = rows.map((p: (typeof rows)[number]) => ({
    id: p.id,
    name: p.storeName ?? p.user.name,
    bio: p.bio,
    cover: p.coverImageUrl,
    category: p.category,
    location: p.locationLabel,
    rating: p.avgRating,
    reviews: p.totalReviews,
    verified: p.isVerified,
    image: p.user.image,
  }))

  return (
    <SearchClient
      providers={providers}
      initialCategory={validCategory ?? "ALL"}
      initialQuery={q ?? ""}
      defaultAddress={user.locationLabel ?? ""}
    />
  )
}
