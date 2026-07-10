import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BadgeCheck, CheckCircle2, Clock3, MapPin, ShieldCheck, Star, UsersRound } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { CATEGORIES, type CategorySlug } from "@/lib/categories"
import { BookingPanel } from "./booking-panel"

export default async function ProviderProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireRole("CUSTOMER")
  const { slug } = await params
  const provider = await prisma.provider.findFirst({
    where: { storeSlug: slug, status: "APPROVED", storeSetupComplete: true },
    include: {
      user: { select: { name: true, image: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 12, include: { customer: { select: { name: true } } } },
      _count: { select: { bookings: { where: { status: "COMPLETED" } } } },
    },
  })
  if (!provider) notFound()
  const category = CATEGORIES.find((item) => item.slug === provider.category as CategorySlug)
  const CategoryIcon = category?.icon

  return <main className="min-h-[calc(100vh-4rem)] bg-muted/20"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10"><Link href="/search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to search</Link>
    <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-sm)]"><div className="relative h-52 bg-accent sm:h-72">{provider.coverImageUrl ? <Image src={provider.coverImageUrl} alt={provider.storeName ?? provider.user.name} fill priority sizes="(max-width: 1200px) 100vw, 1152px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-primary/30">{CategoryIcon && <CategoryIcon className="h-20 w-20" />}</div>}<div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" /><div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-7 sm:left-7"><div className="flex items-center gap-2"><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{provider.storeName ?? provider.user.name}</h1><BadgeCheck className="h-6 w-6 text-emerald-300" /></div><p className="mt-1 text-sm text-white/85">{category?.label ?? provider.category} · {provider.locationLabel}</p></div></div>
      <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4"><Metric icon={Star} label="Rating" value={provider.totalReviews ? provider.avgRating.toFixed(1) : "New"} /><Metric icon={UsersRound} label="Reviews" value={provider.totalReviews.toString()} /><Metric icon={CheckCircle2} label="Jobs done" value={provider._count.bookings.toString()} /><Metric icon={MapPin} label="Service radius" value={`${provider.serviceRadiusKm} km`} /></div>
    </section>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start"><div className="space-y-6"><section className="rounded-3xl border border-border bg-card p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-wider text-primary">About this professional</p><h2 className="mt-2 text-xl font-extrabold">Experienced, verified and ready to help</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{provider.bio}</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Trust icon={ShieldCheck} title="Identity verified" body="Documents reviewed by Homify GH." /><Trust icon={BadgeCheck} title="Verified reviews" body="Feedback comes from completed jobs." /><Trust icon={Clock3} title="Clear job updates" body="Track progress from request to completion." /></div></section>
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Customer feedback</p><h2 className="mt-2 text-xl font-extrabold">Verified reviews</h2></div>{provider.totalReviews > 0 && <span className="flex items-center gap-1 text-sm font-bold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{provider.avgRating.toFixed(1)}</span>}</div>{provider.reviews.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{provider.reviews.map((review) => <article key={review.id} className="rounded-2xl border border-border bg-muted/20 p-4"><div className="flex gap-0.5">{[1,2,3,4,5].map((star) => <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}</div><p className="mt-3 text-sm leading-6">{review.comment || "Great service experience."}</p><p className="mt-3 text-xs font-semibold text-muted-foreground">{review.customer.name} · Verified booking</p></article>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-border py-10 text-center"><Star className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-2 text-sm font-semibold">No reviews yet</p><p className="text-xs text-muted-foreground">Be the first customer to book this professional.</p></div>}</section></div>
      <aside className="lg:sticky lg:top-24"><BookingPanel providerId={provider.id} providerName={provider.storeName ?? provider.user.name} defaultAddress={user.locationLabel ?? ""} /></aside></div>
  </div></main>
}

function Metric({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) { return <div className="p-4 text-center sm:p-5"><Icon className="mx-auto h-4 w-4 text-primary" /><p className="mt-2 font-extrabold">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div> }
function Trust({ icon: Icon, title, body }: { icon: typeof Star; title: string; body: string }) { return <div className="rounded-2xl bg-muted/40 p-4"><Icon className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p></div> }
