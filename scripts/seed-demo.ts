/**
 * Seeds demo providers + bookings for the first CUSTOMER so the dashboard
 * has real data to render. Idempotent-ish: clears prior demo rows first.
 *
 * Covers every service category (so "Find a pro" is never empty), a mix of
 * verified/unverified providers (to exercise the "Verified only" filter) and a
 * spread of ratings 3.5 → 5.0 (to exercise the "Minimum rating" filter).
 *
 * Run: npx tsx --env-file=.env scripts/seed-demo.ts
 */
import { prisma } from "../src/lib/prisma"
import { CATEGORY_IMAGES } from "../src/lib/categories"

type Category = "PLUMBER" | "ELECTRICIAN" | "CARPENTER" | "AC_TECHNICIAN" | "CLEANER" | "PAINTER" | "MASON"
type BookingStatus = "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

const PROVIDERS: {
  name: string
  email: string
  category: Category
  storeName: string
  bio: string
  location: string
  rating: number
  reviews: number
  verified: boolean
  startingPrice: number
}[] = [
  { name: "Kwame Mensah", email: "demo.kwame@homify.test", category: "PLUMBER", storeName: "Mensah Plumbing Works", bio: "Licensed plumber, 12 yrs across Accra. Leaks, pipework, installations and emergency call-outs.", location: "East Legon, Accra", rating: 4.9, reviews: 214, verified: true, startingPrice: 150 },
  { name: "Ama Boateng", email: "demo.ama@homify.test", category: "CLEANER", storeName: "Sparkle Home Cleaning", bio: "Deep cleaning for homes & offices. Move-in/out cleans, sofas and carpets.", location: "Spintex, Accra", rating: 4.8, reviews: 167, verified: true, startingPrice: 200 },
  { name: "Yaw Owusu", email: "demo.yaw@homify.test", category: "ELECTRICIAN", storeName: "BrightVolt Electricals", bio: "Wiring, faults, sockets and full installations. Certified and insured.", location: "Osu, Accra", rating: 4.0, reviews: 98, verified: true, startingPrice: 180 },
  { name: "Akosua Frimpong", email: "demo.akosua@homify.test", category: "AC_TECHNICIAN", storeName: "CoolBreeze AC Services", bio: "AC repair, servicing & installs for homes and offices across Greater Accra.", location: "Tema, Greater Accra", rating: 5.0, reviews: 73, verified: true, startingPrice: 250 },
  { name: "Kofi Asante", email: "demo.kofi@homify.test", category: "CARPENTER", storeName: "Asante Woodcraft", bio: "Custom furniture, wardrobes and fittings built to order.", location: "Madina, Accra", rating: 3.5, reviews: 41, verified: true, startingPrice: 300 },
  // Painters — fixes "No pros found for painting"
  { name: "Nana Adjei", email: "demo.nana@homify.test", category: "PAINTER", storeName: "TrueColour Painters", bio: "Interior & exterior painting, textured finishes and waterproofing. Neat, on-time crews.", location: "Adenta, Accra", rating: 4.8, reviews: 129, verified: true, startingPrice: 220 },
  { name: "Esi Quaye", email: "demo.esi@homify.test", category: "PAINTER", storeName: "Quaye Finishing", bio: "Residential repainting and decorative wall finishes for homes and shops.", location: "Dansoman, Accra", rating: 4.0, reviews: 34, verified: false, startingPrice: 160 },
  // Masons — fixes "No pros found for masonry"
  { name: "Ibrahim Mahama", email: "demo.ibrahim@homify.test", category: "MASON", storeName: "SolidBlock Masonry", bio: "Blockwork, plastering, tiling and general building works. 15 yrs on site.", location: "Kasoa, Central Region", rating: 5.0, reviews: 88, verified: true, startingPrice: 350 },
  { name: "Kojo Amankwah", email: "demo.kojo@homify.test", category: "MASON", storeName: "Amankwah Builders", bio: "Bricklaying, screeding and concrete works for new builds and renovations.", location: "Ashaiman, Greater Accra", rating: 3.5, reviews: 22, verified: false, startingPrice: 280 },
  // Extra unverified providers to exercise the "Verified only" filter
  { name: "Selorm Dzato", email: "demo.selorm@homify.test", category: "ELECTRICIAN", storeName: "PowerLine Electricals", bio: "Newly onboarded electrician. House wiring, repairs and inverter installs.", location: "Ashaiman, Greater Accra", rating: 4.0, reviews: 12, verified: false, startingPrice: 140 },
  { name: "Abena Sarpong", email: "demo.abena@homify.test", category: "CLEANER", storeName: "FreshNest Cleaners", bio: "Affordable home cleaning and laundry. Weekly and one-off bookings.", location: "Achimota, Accra", rating: 3.5, reviews: 9, verified: false, startingPrice: 120 },
]

const SERVICES: Record<Category, { name: string; description: string; startingPrice: number }[]> = {
  PLUMBER: [{ name: "Leak repair", description: "Trace and fix pipe or tap leaks.", startingPrice: 150 }, { name: "Fixture installation", description: "Sinks, taps, water heaters and closets.", startingPrice: 250 }],
  ELECTRICIAN: [{ name: "Fault diagnosis", description: "Find and fix electrical faults safely.", startingPrice: 180 }, { name: "Wiring & sockets", description: "New points, sockets and rewiring.", startingPrice: 300 }],
  CARPENTER: [{ name: "Custom furniture", description: "Wardrobes, shelves and cabinets built to order.", startingPrice: 400 }, { name: "Repairs & fittings", description: "Doors, hinges and general woodwork.", startingPrice: 200 }],
  AC_TECHNICIAN: [{ name: "AC servicing", description: "Clean, gas top-up and performance check.", startingPrice: 250 }, { name: "AC installation", description: "Supply and mount split units.", startingPrice: 500 }],
  CLEANER: [{ name: "Standard home clean", description: "Full home clean, all rooms.", startingPrice: 200 }, { name: "Deep clean", description: "Move-in/out, sofas and carpets.", startingPrice: 400 }],
  PAINTER: [{ name: "Interior painting", description: "Walls, ceilings and trims.", startingPrice: 220 }, { name: "Exterior & waterproofing", description: "Outer walls with weather protection.", startingPrice: 450 }],
  MASON: [{ name: "Blockwork & plastering", description: "Walls, plastering and screeding.", startingPrice: 350 }, { name: "Tiling", description: "Floor and wall tiling.", startingPrice: 300 }],
}

function daysFromNow(d: number) {
  const date = new Date()
  date.setDate(date.getDate() + d)
  date.setHours(10, 0, 0, 0)
  return date
}

async function main() {
  const customer = await prisma.user.findFirst({ where: { role: "CUSTOMER" } })
  if (!customer) throw new Error("No CUSTOMER user found. Sign up first.")

  // Wipe prior demo data (providers whose user email ends with @homify.test)
  const demoUsers = await prisma.user.findMany({ where: { email: { endsWith: "@homify.test" } }, select: { id: true } })
  const demoUserIds = demoUsers.map((u: { id: string }) => u.id)
  if (demoUserIds.length) {
    const demoProviders = await prisma.provider.findMany({ where: { userId: { in: demoUserIds } }, select: { id: true } })
    const demoProviderIds = demoProviders.map((p: { id: string }) => p.id)
    await prisma.review.deleteMany({ where: { providerId: { in: demoProviderIds } } })
    await prisma.booking.deleteMany({ where: { providerId: { in: demoProviderIds } } })
    await prisma.serviceOffering.deleteMany({ where: { providerId: { in: demoProviderIds } } })
    await prisma.provider.deleteMany({ where: { userId: { in: demoUserIds } } })
    await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } })
  }

  // Create providers
  const providers: { id: string; category: Category }[] = []
  for (const p of PROVIDERS) {
    const u = await prisma.user.create({
      data: {
        name: p.name,
        firstName: p.name.split(" ")[0],
        lastName: p.name.split(" ")[1],
        email: p.email,
        emailVerified: true,
        role: "PROVIDER",
        onboardingComplete: true,
      },
    })
    const provider = await prisma.provider.create({
      data: {
        userId: u.id,
        category: p.category,
        bio: p.bio,
        coverImageUrl: CATEGORY_IMAGES[p.category],
        locationLabel: p.location,
        isVerified: p.verified,
        // Unverified providers are still APPROVED so they show in search — the
        // "Verified only" filter distinguishes them by the isVerified flag.
        status: "APPROVED",
        avgRating: p.rating,
        totalReviews: p.reviews,
        storeName: p.storeName,
        storeSlug: p.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        storeSetupComplete: true,
        services: {
          create: SERVICES[p.category].map((s) => ({ name: s.name, description: s.description, startingPrice: s.startingPrice, active: true })),
        },
      },
    })
    providers.push({ id: provider.id, category: p.category })
  }

  const addr = customer.locationLabel ?? "East Legon, Accra"

  // Bookings: mix of past (history) and upcoming, across statuses.
  const bookings: { providerIdx: number; status: BookingStatus; when: number; amount: number; notes?: string }[] = [
    { providerIdx: 0, status: "COMPLETED", when: -28, amount: 250, notes: "Fixed kitchen sink leak." },
    { providerIdx: 1, status: "COMPLETED", when: -21, amount: 400, notes: "Full apartment deep clean." },
    { providerIdx: 2, status: "COMPLETED", when: -14, amount: 320, notes: "Rewired living room sockets." },
    { providerIdx: 1, status: "CANCELLED", when: -7, amount: 400 },
    { providerIdx: 5, status: "CANCELLED", when: -5, amount: 220, notes: "Rescheduled — bedroom repaint." },
    { providerIdx: 3, status: "IN_PROGRESS", when: 0, amount: 280, notes: "AC servicing — 2 units." },
    { providerIdx: 0, status: "ACCEPTED", when: 3, amount: 200, notes: "Bathroom tap replacement." },
    { providerIdx: 4, status: "PENDING", when: 6, amount: 600, notes: "Build a wardrobe." },
    { providerIdx: 7, status: "PENDING", when: 9, amount: 350, notes: "Plaster back wall." },
  ]

  for (const b of bookings) {
    const prov = providers[b.providerIdx]
    await prisma.booking.create({
      data: {
        customerId: customer.id,
        providerId: prov.id,
        category: prov.category,
        status: b.status,
        scheduledAt: daysFromNow(b.when),
        address: addr,
        notes: b.notes,
        amount: b.amount,
        createdAt: daysFromNow(b.when - 2),
      },
    })
  }

  console.log(`Seeded ${providers.length} providers (verified + unverified, all categories) and ${bookings.length} bookings for ${customer.email}.`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
