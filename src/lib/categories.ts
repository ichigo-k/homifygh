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
