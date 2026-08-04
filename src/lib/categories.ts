import { Wrench, Zap, Hammer, Wind, Sparkles, Paintbrush, Layers } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type CategorySlug =
  | "PLUMBER"
  | "ELECTRICIAN"
  | "CARPENTER"
  | "AC_TECHNICIAN"
  | "CLEANER"
  | "PAINTER"
  | "MASON"

export const CATEGORIES: { slug: CategorySlug; label: string; icon: LucideIcon }[] = [
  { slug: "PLUMBER", label: "Plumbing", icon: Wrench },
  { slug: "ELECTRICIAN", label: "Electrical", icon: Zap },
  { slug: "CARPENTER", label: "Carpentry", icon: Hammer },
  { slug: "AC_TECHNICIAN", label: "AC Repair", icon: Wind },
  { slug: "CLEANER", label: "Cleaning", icon: Sparkles },
  { slug: "PAINTER", label: "Painting", icon: Paintbrush },
  { slug: "MASON", label: "Masonry", icon: Layers },
]

/**
 * A representative photo per service type. Used as the cover fallback so every
 * card visually reflects the actual trade, even before a provider uploads their
 * own store photo. Keep these in sync with next.config remotePatterns.
 */
export const CATEGORY_IMAGES: Record<CategorySlug, string> = {
  PLUMBER: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80",
  ELECTRICIAN: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
  CARPENTER: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
  AC_TECHNICIAN: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80",
  CLEANER: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
  PAINTER: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
  MASON: "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=800&q=80",
}

export function categoryImage(slug: string): string {
  return CATEGORY_IMAGES[slug as CategorySlug] ?? CATEGORY_IMAGES.PLUMBER
}
