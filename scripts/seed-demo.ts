/**
 * Seeds demo providers + bookings for the first CUSTOMER so the dashboard
 * has real data to render. Idempotent-ish: clears prior demo rows first.
 *
 * Run: npx tsx --env-file=.env scripts/seed-demo.ts
 */
import { prisma } from "../src/lib/prisma"
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
  cover: string
}[] = [
  { name: "Kwame Mensah", email: "demo.kwame@homify.test", category: "PLUMBER", storeName: "Mensah Plumbing Works", bio: "Licensed plumber, 12 yrs across Accra. Leaks, pipework, installations and emergency call-outs.", location: "East Legon, Accra", rating: 4.9, reviews: 214, cover: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80" },
  { name: "Ama Boateng", email: "demo.ama@homify.test", category: "CLEANER", storeName: "Sparkle Home Cleaning", bio: "Deep cleaning for homes & offices. Move-in/out cleans, sofas and carpets.", location: "Spintex, Accra", rating: 4.8, reviews: 167, cover: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" },
  { name: "Yaw Owusu", email: "demo.yaw@homify.test", category: "ELECTRICIAN", storeName: "BrightVolt Electricals", bio: "Wiring, faults, sockets and full installations. Certified and insured.", location: "Osu, Accra", rating: 4.7, reviews: 98, cover: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80" },
  { name: "Akosua Frimpong", email: "demo.akosua@homify.test", category: "AC_TECHNICIAN", storeName: "CoolBreeze AC Services", bio: "AC repair, servicing & installs for homes and offices across Greater Accra.", location: "Tema, Greater Accra", rating: 5.0, reviews: 73, cover: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80" },
  { name: "Kofi Asante", email: "demo.kofi@homify.test", category: "CARPENTER", storeName: "Asante Woodcraft", bio: "Custom furniture, wardrobes and fittings built to order.", location: "Madina, Accra", rating: 4.6, reviews: 41, cover: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80" },
]

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
    await prisma.provider.deleteMany({ where: { userId: { in: demoUserIds } } })
    await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } })
  }

  // Create providers
  const providers: { id: string; category: Category; displayName: string; [key: string]: unknown }[] = []
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
        coverImageUrl: p.cover,
        locationLabel: p.location,
        isVerified: true,
        status: "APPROVED",
        avgRating: p.rating,
        totalReviews: p.reviews,
        storeName: p.storeName,
        storeSlug: p.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        storeSetupComplete: true,
      },
    })
    providers.push({ ...provider, displayName: p.storeName, category: p.category })
  }

  const addr = customer.locationLabel ?? "East Legon, Accra"

  // Bookings: mix of past (history) and upcoming, across statuses.
  const bookings: { providerIdx: number; status: BookingStatus; when: number; amount: number; notes?: string }[] = [
    { providerIdx: 0, status: "COMPLETED", when: -28, amount: 250, notes: "Fixed kitchen sink leak." },
    { providerIdx: 1, status: "COMPLETED", when: -21, amount: 400, notes: "Full apartment deep clean." },
    { providerIdx: 2, status: "COMPLETED", when: -14, amount: 320, notes: "Rewired living room sockets." },
    { providerIdx: 1, status: "CANCELLED", when: -7, amount: 400 },
    { providerIdx: 3, status: "IN_PROGRESS", when: 0, amount: 280, notes: "AC servicing — 2 units." },
    { providerIdx: 0, status: "ACCEPTED", when: 3, amount: 200, notes: "Bathroom tap replacement." },
    { providerIdx: 4, status: "PENDING", when: 6, amount: 600, notes: "Build a wardrobe." },
    { providerIdx: 3, status: "PENDING", when: 9, amount: 150 },
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

  console.log(`Seeded ${providers.length} providers and ${bookings.length} bookings for ${customer.email}.`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
