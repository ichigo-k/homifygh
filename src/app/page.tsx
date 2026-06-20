import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"
import { Reveal } from "@/components/reveal"
import { Logo } from "@/components/logo"
import {
  Wrench,
  Zap,
  Hammer,
  Wind,
  Paintbrush,
  Sparkles,
  Layers,
  MapPin,
  Shield,
  Star,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Headphones,
  BadgeCheck,
  Clock,
  Users,
  LayoutGrid,
  Mail,
  Phone,
} from "lucide-react"

const categories = [
  { label: "Plumbing", icon: Wrench, slug: "PLUMBER", pros: 428, from: 80 },
  { label: "Electrical", icon: Zap, slug: "ELECTRICIAN", pros: 376, from: 90 },
  { label: "Carpentry", icon: Hammer, slug: "CARPENTER", pros: 251, from: 120 },
  { label: "AC Repair", icon: Wind, slug: "AC_TECHNICIAN", pros: 184, from: 100 },
  { label: "Painting", icon: Paintbrush, slug: "PAINTER", pros: 209, from: 150 },
  { label: "Cleaning", icon: Sparkles, slug: "CLEANER", pros: 512, from: 60 },
  { label: "Masonry", icon: Layers, slug: "MASON", pros: 143, from: 130 },
]

const stats = [
  { value: "2K+", label: "Verified pros" },
  { value: "15K+", label: "Jobs done" },
  { value: "99%", label: "Satisfaction" },
]

const whyUs = [
  {
    icon: BadgeCheck,
    title: "Best in the industry",
    description: "Top-rated tradespeople across Ghana, ranked by real customer reviews.",
  },
  {
    icon: Headphones,
    title: "Customer support",
    description: "Our team is here to help you before, during, and after every booking.",
  },
  {
    icon: Clock,
    title: "Emergency service",
    description: "Need help fast? Find pros available for same-day urgent call-outs.",
  },
  {
    icon: Shield,
    title: "Vetted & verified",
    description: "Every provider passes ID and background checks before joining.",
  },
]

const checklist = [
  "Every pro passes a mandatory background check",
  "Verified ID before they can accept bookings",
  "Rated and reviewed by real customers",
  "Secure payment with Mobile Money",
]

const testimonials = [
  {
    name: "Abena Kuffour",
    location: "Accra",
    text: "Found a plumber within 20 minutes. He fixed everything the same day. Honestly the easiest, most reassuring booking experience I've had.",
    rating: 5.0,
    date: "14 May, 2026",
  },
  {
    name: "Kweku Mensah",
    location: "Kumasi",
    text: "The electrician was professional, on time, and the price was exactly as quoted. No surprises, no stress. I'll be using Homify again.",
    rating: 4.9,
    date: "2 Apr, 2026",
  },
  {
    name: "Ama Owusu",
    location: "Takoradi",
    text: "Booking was so simple and the cleaner did an incredible job — my house has genuinely never looked better. Seamless from start to finish.",
    rating: 5.0,
    date: "28 Mar, 2026",
  },
]

const footerColumns = [
  {
    heading: "Services",
    links: [
      { label: "Plumbing", href: "/search?category=PLUMBER" },
      { label: "Electrical", href: "/search?category=ELECTRICIAN" },
      { label: "Cleaning", href: "/search?category=CLEANER" },
      { label: "Painting", href: "/search?category=PAINTER" },
      { label: "Carpentry", href: "/search?category=CARPENTER" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Trust & safety", href: "/safety" },
      { label: "Contact us", href: "/contact" },
      { label: "Become a pro", href: "/sign-up?as=provider" },
    ],
  },
]

const socials = [
  {
    name: "X",
    href: "https://x.com",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="relative z-10 text-center lg:text-left">
            <span className="intro inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-primary" style={{ "--d": "0.05s" } as React.CSSProperties}>
              <Sparkles className="h-4 w-4" />
              Built for Ghana
            </span>
            <h1 className="intro mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl" style={{ "--d": "0.15s" } as React.CSSProperties}>
              Trusted home{" "}
              <span className="relative text-primary">
                services
                <svg
                  aria-hidden
                  viewBox="0 0 200 12"
                  className="absolute -bottom-1 left-0 h-3 w-full text-primary/40"
                  preserveAspectRatio="none"
                >
                  <path d="M2 9 Q 50 2 100 6 T 198 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>{" "}
              for your home.
            </h1>
            <p className="intro mx-auto mt-6 max-w-md text-lg text-muted-foreground lg:mx-0" style={{ "--d": "0.28s" } as React.CSSProperties}>
              Book a plumber, electrician, carpenter, and more — all vetted,
              rated, and close by. Pay easily with MoMo.
            </p>
            <div className="intro mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center" style={{ "--d": "0.4s" } as React.CSSProperties}>
              <Button
                size="lg"
                className="w-full rounded-full bg-primary px-8 text-primary-foreground shadow-[var(--shadow-md)] hover:bg-primary-hover hover:shadow-[var(--shadow-lg)] sm:w-auto"
                render={<Link href="/search" />}
              >
                Find a pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full px-8 sm:w-auto"
                render={<Link href="/sign-up?as=provider" />}
              >
                Join as a provider
              </Button>
            </div>

            {/* Stats */}
            <div className="intro mt-12 flex justify-center gap-8 lg:justify-start" style={{ "--d": "0.52s" } as React.CSSProperties}>
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-extrabold text-foreground">{value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: decorative card cluster */}
          <div className="intro-scale relative mx-auto hidden h-[420px] w-full max-w-md lg:block" style={{ "--d": "0.3s" } as React.CSSProperties}>
            {/* Decorative blobs */}
            <div className="absolute -right-6 top-4 h-28 w-28 rounded-[2rem] bg-warm/70 rotate-12" aria-hidden />
            <div className="absolute -left-8 bottom-8 h-24 w-24 rounded-[2rem] bg-primary/15 -rotate-12" aria-hidden />

            {/* Hero image panel */}
            <div className="absolute inset-6 overflow-hidden rounded-[2.5rem] bg-brand-soft">
              <Image
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80"
                alt="A professional electrician at work"
                fill
                sizes="(max-width: 1024px) 0px, 28rem"
                className="object-cover"
                priority
              />
            </div>

            {/* Floating chip: Trusted Pro */}
            <div className="float-soft absolute right-2 top-10 z-10 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-[var(--shadow-lg)]">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">Trusted Pro</span>
            </div>

            {/* Floating card: provider */}
            <div className="float-soft absolute left-2 top-28 z-10 w-56 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-xl)]" style={{ animationDelay: "1.2s" }}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  KO
                </span>
                <div>
                  <p className="text-sm font-semibold">Kofi Owusu</p>
                  <p className="text-xs text-muted-foreground">Electrician · Accra</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warm text-warm" />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">5.0 (128)</span>
              </div>
            </div>

            {/* Floating chip: booking confirmed */}
            <div className="float-soft absolute bottom-10 right-4 z-10 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-lg)]" style={{ animationDelay: "2.4s" }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </span>
              <div>
                <p className="text-xs font-semibold">Booking confirmed</p>
                <p className="text-[11px] text-muted-foreground">Today, 2:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          {/* Editorial header */}
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">
                Services
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                What do you need done?
              </h2>
            </div>
            <Link
              href="/search"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              View all services
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card grid */}
          <div className="stagger mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map(({ label, icon: Icon, slug, pros, from }) => (
              <Link
                key={slug}
                href={`/search?category=${slug}`}
                className="reveal-scale group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-lg)]"
              >
                {/* light sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />

                {/* icon + arrow */}
                <div className="relative flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <span className="flex h-8 w-8 -translate-x-1 items-center justify-center rounded-full border border-border text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:border-primary group-hover:text-primary group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                {/* label + meta */}
                <div className="relative mt-8">
                  <p className="font-bold tracking-tight">{label}</p>
                  <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {pros} pros
                    </span>
                    <span className="hidden text-border sm:inline">·</span>
                    <span>from GHS {from}</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Featured "all services" tile completes the 4×2 grid */}
            <Link
              href="/search"
              className="reveal-scale group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
            >
              <span
                aria-hidden
                className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform duration-500 ease-out group-hover:scale-150"
              />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 transition-transform duration-300 group-hover:scale-105">
                <LayoutGrid className="h-6 w-6" strokeWidth={2} />
              </span>
              <div className="relative mt-8">
                <p className="font-bold tracking-tight">All services</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-primary-foreground/80">
                  Explore everything
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── WHY FETCH / SPLIT SECTION ────────────────────────── */}
      <section className="overflow-hidden px-4 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          {/* Image-ish panel */}
          <div className="reveal-l relative mx-auto h-80 w-full max-w-md">
            <div className="absolute -left-4 top-0 h-24 w-24 rounded-[2rem] bg-warm/70 rotate-12" aria-hidden />
            <div className="absolute -right-4 bottom-0 h-20 w-20 rounded-[2rem] bg-primary/15 -rotate-12" aria-hidden />
            <div className="absolute inset-0 m-4 overflow-hidden rounded-[2.5rem] bg-brand-soft">
              <Image
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80"
                alt="A vetted cleaning professional at work"
                fill
                sizes="(max-width: 1024px) 100vw, 28rem"
                className="object-cover"
              />
              {/* Floating trust badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-[var(--shadow-lg)] backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">Vetted & verified</p>
                  <p className="text-xs text-muted-foreground">Background-checked pros</p>
                </div>
              </div>
            </div>
          </div>

          {/* Copy + checklist */}
          <div className="reveal-r">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Why choose <span className="text-primary">Homify GH?</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              We believe finding a reliable, professional tradesperson should be
              easy. So every member of the Homify family is a highly-experienced,
              fully-vetted local pro.
            </p>
            <ul className="mt-6 space-y-3">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-8 rounded-full bg-primary px-7 text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-primary-hover"
              render={<Link href="/sign-up" />}
            >
              Learn more
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FEATURE GRID ─────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="relative mx-auto max-w-6xl">
          <div className="reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-primary">
                <span className="h-px w-8 bg-primary" />
                Why Homify
              </div>
              <h2 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Everything you need,
                <br className="hidden sm:block" />{" "}
                <span className="text-primary">done right.</span>
              </h2>
            </div>
            <p className="max-w-sm text-lg leading-relaxed text-muted-foreground md:text-right">
              From quick fixes to big projects, we connect you with the right
              person for the job.
            </p>
          </div>

          <div className="mt-16 divide-y divide-border border-y border-border">
            {whyUs.map(({ title, description }, i) => {
              const flipped = i % 2 === 1
              return (
                <Reveal
                  key={title}
                  from={flipped ? "right" : "left"}
                  delay={i * 90}
                  className="group relative grid items-center gap-6 py-12 md:grid-cols-2 md:gap-10"
                >
                  {/* full-width hover tint */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-[-1.5rem] inset-y-0 -z-10 rounded-3xl bg-primary/0 transition-colors duration-300 group-hover:bg-primary/[0.035]"
                  />

                  {/* Title side */}
                  <div
                    className={cn(
                      "relative flex items-center gap-5",
                      flipped && "md:order-2"
                    )}
                  >
                    {/* big ghosted number */}
                    <span
                      aria-hidden
                      className="select-none text-6xl font-black leading-none tracking-tighter text-foreground/[0.07] transition-all duration-300 group-hover:text-primary/25 sm:text-7xl"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl font-extrabold tracking-tight transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
                      {title}
                    </h3>
                  </div>

                  {/* Copy side */}
                  <div className={cn(flipped && "md:order-1")}>
                    <p className="max-w-md leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-70 transition-all duration-300 group-hover:gap-3 group-hover:opacity-100">
                      Learn more
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="isolate overflow-hidden bg-muted/30 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="reveal max-w-2xl">
            <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-primary">
              <span className="h-px w-8 bg-primary" />
              Testimonials
            </div>
            <h2 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Loved by people <span className="text-primary">across Ghana</span>
            </h2>
          </div>

          <div className="reveal mt-12">
            <TestimonialsCarousel items={testimonials} />
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────── */}
      <section className="px-4 pb-12 pt-12">
        <div className="reveal-scale relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-primary px-8 py-16 text-center sm:py-20">
          {/* decorative shapes */}
          <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-[3rem] bg-warm/30" />
          <div aria-hidden className="absolute -bottom-12 -left-8 h-44 w-44 -rotate-12 rounded-[3rem] bg-white/10" />

          <div className="relative mx-auto max-w-lg space-y-5">
            <h2 className="text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="text-primary-foreground/80">
              Create a free account and book your first service in minutes.
            </p>
            <Button
              size="lg"
              className="rounded-full bg-primary-foreground px-8 text-primary shadow-[var(--shadow-md)] hover:bg-primary-foreground/90"
              render={<Link href="/sign-up" />}
            >
              Create free account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="relative overflow-hidden border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          {/* Top: brand + newsletter + link columns */}
          <div className="grid grid-cols-2 gap-10 py-16 sm:gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
            {/* Brand / newsletter */}
            <div className="col-span-2 max-w-sm lg:col-span-1">
              <Link href="/" aria-label="homify GH home" className="inline-block">
                <Logo className="text-xl" />
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Ghana&apos;s trusted marketplace for vetted home-service pros.
                Book with confidence, pay easily with MoMo.
              </p>

              {/* Newsletter */}
              <p className="mt-7 text-sm font-semibold">Get tips & offers</p>
              <form className="mt-2 flex max-w-xs items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    aria-label="Email address"
                    className="h-11 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-primary-hover"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              {/* Socials */}
              <div className="mt-7 flex items-center gap-2.5">
                {socials.map(({ name, href, path }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[var(--shadow-md)]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-sm font-bold tracking-tight">{heading}</p>
                <ul className="mt-4 space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="group inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span className="h-px w-0 bg-primary transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact strip */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border py-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> +233 30 000 0000
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> hello@homify.gh
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Accra, Ghana
            </span>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Homify GH · All rights reserved</p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
              <Link href="/cookies" className="transition-colors hover:text-foreground">Cookies</Link>
              <span className="inline-flex items-center gap-1.5">
                Made in Ghana
                <span className="relative flex flex-col overflow-hidden rounded-[2px] leading-none shadow-sm" aria-hidden>
                  <span className="h-1 w-4 bg-[#ce1126]" />
                  <span className="relative flex h-1 w-4 items-center justify-center bg-[#fcd116]">
                    <svg viewBox="0 0 24 24" className="h-2 w-2 fill-black">
                      <path d="M12 2l2.39 7.36h7.74l-6.26 4.55 2.39 7.36L12 17.27l-6.26 4.55 2.39-7.36-6.26-4.55h7.74z" />
                    </svg>
                  </span>
                  <span className="h-1 w-4 bg-[#006b3f]" />
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Oversized watermark wordmark */}
        <p
          aria-hidden
          className="pointer-events-none select-none bg-gradient-to-b from-foreground/[0.05] to-transparent bg-clip-text px-4 text-center text-[19vw] font-extrabold leading-[0.8] tracking-tighter text-transparent"
        >
          homify
        </p>
      </footer>
    </div>
  )
}
