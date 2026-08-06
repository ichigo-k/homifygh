"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { availabilityError } from "@/lib/availability"
import { audit, notify } from "@/lib/events"
import { sendBookingRequestEmail } from "@/lib/email"
import { CATEGORIES } from "@/lib/categories"

const bookingSchema = z.object({
  providerId: z.string().min(1),
  scheduledAt: z.string().min(1),
  address: z.string().trim().min(3).max(180),
  notes: z.string().trim().max(800).optional(),
  // Flex: an optional price the customer proposes for negotiation.
  offeredAmount: z.coerce.number().positive().max(1_000_000).optional(),
})

export async function createBooking(input: z.infer<typeof bookingSchema>) {
  const user = await requireRole("CUSTOMER")
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: "Check the booking details and try again." }
  const provider = await prisma.provider.findFirst({
    where: { id: parsed.data.providerId, status: "APPROVED", storeSetupComplete: true },
    select: {
      id: true, userId: true, category: true, storeName: true, bookingLeadHours: true, workingDays: true, workStart: true, workEnd: true, unavailableDates: true,
      user: { select: { email: true, name: true } },
      services: { where: { active: true, startingPrice: { not: null } }, select: { startingPrice: true } },
    },
  })
  if (!provider) return { ok: false as const, error: "This provider is not currently available." }
  const scheduledAt = new Date(parsed.data.scheduledAt)
  if (Number.isNaN(scheduledAt.getTime())) return { ok: false as const, error: "Pick a valid date and time." }
  const availabilityMessage = availabilityError(provider, scheduledAt)
  if (availabilityMessage) return { ok: false as const, error: availabilityMessage }
  const conflict = await prisma.booking.findFirst({ where: { providerId: provider.id, scheduledAt, status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } }, select: { id: true } })
  if (conflict) return { ok: false as const, error: "That time is already reserved. Choose another time." }

  // Hold the customer's Flex offer (or, absent one, the provider's lowest
  // starting price) from their wallet at request time. This is a provisional
  // hold, not a final charge — updateProviderBooking trues it up to the
  // provider's actual quote on accept, and refunds it in full on decline.
  const startingPrices = provider.services.map((s) => s.startingPrice).filter((p): p is number => p != null)
  const chargeAmount = parsed.data.offeredAmount ?? (startingPrices.length ? Math.min(...startingPrices) : null)

  // The booking write (plus the wallet hold, which must be atomic with it) is
  // the only critical step. Notifications, audit log and the provider email
  // are best-effort side-effects run AFTER the write and outside this
  // transaction — bundling them in too could exceed Neon's 5s
  // interactive-transaction limit and make the whole booking fail with an
  // opaque server error.
  const booking = await prisma.$transaction(async (tx) => {
    if (chargeAmount != null) {
      const debited = await tx.user.updateMany({ where: { id: user.id, walletBalance: { gte: chargeAmount } }, data: { walletBalance: { decrement: chargeAmount } } })
      if (!debited.count) return null
      await tx.walletTransaction.create({ data: { userId: user.id, amount: chargeAmount, type: "DEBIT", description: `Booking hold — ${provider.storeName ?? provider.user.name}` } })
    }
    return tx.booking.create({
      data: {
        customerId: user.id,
        providerId: provider.id,
        category: provider.category,
        scheduledAt,
        address: parsed.data.address,
        notes: parsed.data.notes || null,
        offeredAmount: parsed.data.offeredAmount ?? null,
        depositAmount: chargeAmount,
      },
    })
  })
  if (!booking) return { ok: false as const, error: "You do not have enough balance in your wallet. Top up and try again." }

  const when = scheduledAt.toLocaleString("en-GH")
  const offerLine = parsed.data.offeredAmount ? ` They proposed GH₵${parsed.data.offeredAmount.toLocaleString()} (Flex).` : ""
  try {
    await notify(prisma, { userId: provider.userId, type: "BOOKING", title: "New booking request", message: `${user.name} requested a service for ${when}.${offerLine}`, href: "/provider" })
    await audit(prisma, { actorId: user.id, action: "BOOKING_CREATED", entityType: "Booking", entityId: booking.id })
  } catch (err) {
    console.error("[createBooking] side-effect (notify/audit) failed:", err)
  }
  try {
    if (provider.user?.email) {
      const categoryLabel = CATEGORIES.find((c) => c.slug === provider.category)?.label ?? provider.category
      await sendBookingRequestEmail({
        to: provider.user.email,
        providerName: provider.storeName ?? provider.user.name ?? "there",
        customerName: user.name,
        category: categoryLabel,
        when,
        address: parsed.data.address,
        notes: parsed.data.notes,
        offeredAmount: parsed.data.offeredAmount ?? null,
        link: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/provider`,
      })
    }
  } catch (err) {
    console.error("[createBooking] provider email failed:", err)
  }

  revalidatePath("/bookings")
  revalidatePath("/provider")
  revalidatePath("/admin/bookings")
  revalidatePath("/wallet")
  revalidatePath("/more")
  return { ok: true as const, bookingId: booking.id }
}
