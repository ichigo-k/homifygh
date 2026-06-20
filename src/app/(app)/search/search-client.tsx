"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Star,
  MapPin,
  BadgeCheck,
  Sparkles,
  X,
  Calendar,
  Loader2,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Check,
} from "lucide-react"
import { CATEGORIES, type CategorySlug } from "@/lib/categories"
import { Button } from "@/components/ui/button"
import { createBooking } from "./actions"

export type SearchProvider = {
  id: string
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

function defaultSchedule() {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  d.setHours(10, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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
  const [query, setQuery] = useState(initialQuery)
  const [cat, setCat] = useState<CategorySlug | "ALL">(initialCategory)
  const [sort, setSort] = useState<Sort>("rating")
  const [minRating, setMinRating] = useState<MinRating>(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selected, setSelected] = useState<SearchProvider | null>(null)

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
                <ProviderCard key={p.id} provider={p} onOpen={() => setSelected(p)} />
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {filtered.map((p) => (
                <ProviderRow key={p.id} provider={p} onOpen={() => setSelected(p)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <ProviderModal provider={selected} defaultAddress={defaultAddress} onClose={() => setSelected(null)} />
      )}
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

function ProviderRow({ provider, onOpen }: { provider: SearchProvider; onOpen: () => void }) {
  const meta = CAT[provider.category as CategorySlug]
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-sm)] transition-all hover:border-primary/30 hover:shadow-[var(--shadow-md)]"
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
    </div>
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
  return (
    <div className={`relative overflow-hidden bg-accent ${className}`}>
      {provider.cover ? (
        <Image
          src={provider.cover}
          alt={provider.name}
          fill
          sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-primary/40">
          <Icon className="h-10 w-10" />
        </div>
      )}
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

function ProviderCard({ provider, onOpen }: { provider: SearchProvider; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-md)]"
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
    </div>
  )
}

function ProviderModal({
  provider,
  defaultAddress,
  onClose,
}: {
  provider: SearchProvider
  defaultAddress: string
  onClose: () => void
}) {
  const [stage, setStage] = useState<"details" | "booking">("details")
  const [when, setWhen] = useState(defaultSchedule())
  const [address, setAddress] = useState(defaultAddress)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [pending, start] = useTransition()

  function submit() {
    setError("")
    if (!address.trim()) return setError("Enter the service address.")
    if (!when) return setError("Pick a date and time.")
    start(async () => {
      try {
        await createBooking({
          providerId: provider.id,
          scheduledAt: new Date(when).toISOString(),
          address,
          notes,
        })
        setDone(true)
      } catch {
        setError("Couldn't create the booking. Try again.")
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card shadow-[var(--shadow-lg)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="flex flex-col items-center p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-lg font-bold tracking-tight">Booking requested 🎉</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {provider.name} will confirm shortly. Track it under My bookings.
            </p>
            <Button
              className="group mt-5 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover"
              render={<Link href="/bookings" />}
            >
              Go to my bookings
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <button onClick={onClose} className="mt-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Keep browsing
            </button>
          </div>
        ) : (
          <>
            {/* Cover */}
            <div className="relative">
              <CoverImage provider={provider} className="aspect-[16/9]" sizes="(max-width: 640px) 100vw, 512px" />
              <button
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full bg-background/90 p-1.5 text-foreground shadow-[var(--shadow-sm)] backdrop-blur transition-colors hover:bg-background"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{provider.name}</h2>
                {provider.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
                  <span>({provider.reviews} reviews)</span>
                </span>
                {provider.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {provider.location}
                  </span>
                )}
              </div>

              {stage === "details" ? (
                <>
                  {provider.bio && (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{provider.bio}</p>
                  )}
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={() => setStage("booking")}
                      className="group h-12 flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover"
                    >
                      Request booking
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                    <Button variant="outline" onClick={onClose} className="h-12 rounded-xl sm:w-28">
                      Close
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-5 space-y-4">
                  <button
                    onClick={() => setStage("details")}
                    className="-mt-1 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back
                  </button>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">When</label>
                    <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="datetime-local"
                        value={when}
                        onChange={(e) => setWhen(e.target.value)}
                        className="w-full bg-transparent py-2.5 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Service address</label>
                    <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. East Legon, Accra"
                        className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                      Notes <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe the job…"
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                  </div>

                  {error && (
                    <p className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{error}</p>
                  )}

                  <Button
                    onClick={submit}
                    disabled={pending}
                    className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-70"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm request"}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
