"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Star,
  MapPin,
  BadgeCheck,
  Sparkles,
  X,
  ArrowRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Check,
} from "lucide-react"
import { CATEGORIES, categoryImage, type CategorySlug } from "@/lib/categories"

export type SearchProvider = {
  id: string
  slug: string
  name: string
  bio: string | null
  cover: string | null
  category: string
  location: string | null
  rating: number
  reviews: number
  verified: boolean
  image: string | null
}

const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<
  CategorySlug,
  (typeof CATEGORIES)[number]
>

type Sort = "rating" | "reviews"
type MinRating = 0 | 4 | 4.5

export function SearchClient({
  providers,
  initialCategory,
  initialQuery,
  defaultAddress,
}: {
  providers: SearchProvider[]
  initialCategory: CategorySlug | "ALL"
  initialQuery: string
  defaultAddress: string
}) {
  void defaultAddress
  const [query, setQuery] = useState(initialQuery)
  const [cat, setCat] = useState<CategorySlug | "ALL">(initialCategory)
  const [sort, setSort] = useState<Sort>("rating")
  const [minRating, setMinRating] = useState<MinRating>(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")

  // Provider counts per category (for the sidebar badges).
  const counts = useMemo(() => {
    const m: Record<string, number> = { ALL: providers.length }
    for (const p of providers) m[p.category] = (m[p.category] ?? 0) + 1
    return m
  }, [providers])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = providers.filter((p) => {
      if (cat !== "ALL" && p.category !== cat) return false
      if (verifiedOnly && !p.verified) return false
      if (p.rating < minRating) return false
      if (q) {
        const hay = `${p.name} ${CAT[p.category as CategorySlug]?.label ?? ""} ${p.location ?? ""} ${p.bio ?? ""}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    list.sort((a, b) =>
      sort === "rating" ? b.rating - a.rating || b.reviews - a.reviews : b.reviews - a.reviews
    )
    return list
  }, [providers, cat, query, sort, minRating, verifiedOnly])

  const activeFilters = (verifiedOnly ? 1 : 0) + (minRating > 0 ? 1 : 0)

  const filterControls = (
    <FilterControls
      counts={counts}
      cat={cat}
      setCat={setCat}
      sort={sort}
      setSort={setSort}
      minRating={minRating}
      setMinRating={setMinRating}
      verifiedOnly={verifiedOnly}
      setVerifiedOnly={setVerifiedOnly}
      activeFilters={activeFilters}
    />
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Find a pro</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse verified providers near you and request a booking.
        </p>
      </header>

      <div className="mt-6 flex gap-6">
        {/* Filter sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
            {filterControls}
          </div>
        </aside>

        {/* Results column */}
        <div className="min-w-0 flex-1">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-sm)]">
            <div className="flex flex-1 items-center gap-2 pl-2">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, service or area…"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button onClick={() => setQuery("")} className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results header */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "pro" : "pros"}
            </p>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
              <ViewBtn active={view === "grid"} onClick={() => setView("grid")} label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ViewBtn>
              <ViewBtn active={view === "list"} onClick={() => setView("list")} label="List view">
                <List className="h-4 w-4" />
              </ViewBtn>
            </div>
          </div>

          {/* Mobile filters */}
          <details className="group mt-4 rounded-2xl border border-border bg-card p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4" />
                Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
            </summary>
            <div className="mt-4">{filterControls}</div>
          </details>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Search className="h-6 w-6" />
              </span>
              <div>
                <p className="font-medium">No pros found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try a different service or adjust your filters.</p>
              </div>
            </div>
          ) : view === "grid" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {filtered.map((p) => (
                <ProviderRow key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

function ViewBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        active ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function FilterControls({
  counts,
  cat,
  setCat,
  sort,
  setSort,
  minRating,
  setMinRating,
  verifiedOnly,
  setVerifiedOnly,
  activeFilters,
}: {
  counts: Record<string, number>
  cat: CategorySlug | "ALL"
  setCat: (c: CategorySlug | "ALL") => void
  sort: Sort
  setSort: (s: Sort) => void
  minRating: MinRating
  setMinRating: (r: MinRating) => void
  verifiedOnly: boolean
  setVerifiedOnly: (fn: (v: boolean) => boolean) => void
  activeFilters: number
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </p>
        {(activeFilters > 0 || cat !== "ALL") && (
          <button
            onClick={() => {
              setVerifiedOnly(() => false)
              setMinRating(0)
              setCat("ALL")
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort by</p>
        <div className="grid grid-cols-2 gap-1.5">
          <SegBtn active={sort === "rating"} onClick={() => setSort("rating")}>Top rated</SegBtn>
          <SegBtn active={sort === "reviews"} onClick={() => setSort("reviews")}>Most reviews</SegBtn>
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service</p>
        <div className="space-y-0.5">
          <CatRow icon={Sparkles} label="All services" count={counts.ALL ?? 0} active={cat === "ALL"} onClick={() => setCat("ALL")} />
          {CATEGORIES.map(({ slug, label, icon: Icon }) => (
            <CatRow
              key={slug}
              icon={Icon}
              label={label}
              count={counts[slug] ?? 0}
              active={cat === slug}
              onClick={() => setCat(slug)}
            />
          ))}
        </div>
      </div>

      {/* Min rating */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Minimum rating</p>
        <div className="grid grid-cols-3 gap-1.5">
          <SegBtn active={minRating === 0} onClick={() => setMinRating(0)}>Any</SegBtn>
          <SegBtn active={minRating === 4} onClick={() => setMinRating(4)}>4.0+</SegBtn>
          <SegBtn active={minRating === 4.5} onClick={() => setMinRating(4.5)}>4.5+</SegBtn>
        </div>
      </div>

      {/* Verified */}
      <button
        onClick={() => setVerifiedOnly((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
      >
        <span className="flex items-center gap-2 font-medium">
          <BadgeCheck className="h-4 w-4 text-primary" />
          Verified only
        </span>
        <span className={`relative h-5 w-9 rounded-full transition-colors ${verifiedOnly ? "bg-primary" : "bg-muted-foreground/30"}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${verifiedOnly ? "left-4" : "left-0.5"}`} />
        </span>
      </button>
    </div>
  )
}

function CatRow({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: typeof Sparkles
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all ${
        active
          ? "bg-accent font-semibold text-primary"
          : "font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
      <span className="flex-1 text-left">{label}</span>
      {active ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <span className="text-xs font-semibold text-muted-foreground/70">{count}</span>
      )}
    </button>
  )
}

function ProviderRow({ provider }: { provider: SearchProvider }) {
  const meta = CAT[provider.category as CategorySlug]
  return (
    <Link href={`/pros/${provider.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-sm)] transition-all hover:border-primary/30 hover:shadow-[var(--shadow-md)]"
    >
      <CoverImage provider={provider} className="h-20 w-28 shrink-0 rounded-xl" sizes="112px" showChip={false} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-semibold">{provider.name}</p>
          {provider.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">{meta?.label ?? provider.category}</p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
            <span>({provider.reviews})</span>
          </span>
          {provider.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{provider.location}</span>
            </span>
          )}
        </div>
      </div>
      <span className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:inline-flex">
        View
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

function CoverImage({
  provider,
  className = "",
  sizes,
  showChip = true,
}: {
  provider: SearchProvider
  className?: string
  sizes?: string
  showChip?: boolean
}) {
  const meta = CAT[provider.category as CategorySlug]
  const Icon = meta?.icon ?? Sparkles
  // Always show a service-appropriate photo — the provider's own cover, or a
  // representative image for their trade so the card reflects the service type.
  const src = provider.cover ?? categoryImage(provider.category)
  return (
    <div className={`relative overflow-hidden bg-accent ${className}`}>
      <Image
        src={src}
        alt={`${meta?.label ?? provider.category} — ${provider.name}`}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {showChip && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-[var(--shadow-sm)] backdrop-blur">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {meta?.label ?? provider.category}
        </span>
      )}
    </div>
  )
}

function SegBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all active:scale-95 ${
        active
          ? "border-primary bg-accent text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function ProviderCard({ provider }: { provider: SearchProvider }) {
  return (
    <Link href={`/pros/${provider.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-md)]"
    >
      <CoverImage provider={provider} className="aspect-[16/10]" />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-semibold">{provider.name}</p>
          {provider.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
        </div>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
            <span>({provider.reviews})</span>
          </span>
          {provider.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{provider.location}</span>
            </span>
          )}
        </div>

        {provider.bio && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{provider.bio}</p>
        )}

        <span className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent py-2.5 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          View details
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

