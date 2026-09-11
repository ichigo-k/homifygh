"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { requireRole } from "@/lib/session"
import { audit } from "@/lib/events"

export async function deleteCustomerAccount(confirmation: string) {
  const user = await requireRole("CUSTOMER")

  if (confirmation !== "DELETE MY ACCOUNT") {
    return { ok: false as const, message: "Type DELETE MY ACCOUNT exactly." }
  }

  // Block deletion if the user has active bookings that are still in flight.
  const activeBooking = await prisma.booking.findFirst({
    where: {
      customerId: user.id,
      status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] },
    },
    select: { id: true },
  })

  if (activeBooking) {
    return {
      ok: false as const,
      message:
        "You have active bookings. Cancel or complete them before deleting your account.",
    }
  }

  // Write the audit trail before deleting so it survives (actorId becomes null via SetNull).
  await audit(prisma, {
    actorId: user.id,
    action: "ACCOUNT_DELETION_REQUESTED",
    entityType: "User",
    entityId: user.id,
  })

  // Revoke all sessions via better-auth so cookies are invalidated.
  try {
    await auth.api.revokeOtherSessions({ headers: await headers() })
  } catch {
    // Non-fatal — we still proceed with deletion.
  }

  // Delete in a transaction. Booking/Review/Dispute have no onDelete cascade so we
  // must remove them explicitly before the User row can be deleted.
  await prisma.$transaction([
    // Detach reviews from bookings first (Review references both booking + customer).
    prisma.review.deleteMany({ where: { customerId: user.id } }),
    // Remove disputes the user raised as customer.
    prisma.dispute.deleteMany({ where: { customerId: user.id } }),
    // Remove completed/cancelled bookings (active ones were blocked above).
    prisma.booking.deleteMany({ where: { customerId: user.id } }),
    // Delete the user — cascades: Session, Account, Notification, SavedProvider,
    // WalletTransaction, Complaint, and Provider (if any).
    prisma.user.delete({ where: { id: user.id } }),
  ])

  redirect("/")
}
