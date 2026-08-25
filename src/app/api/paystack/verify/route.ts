import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/events"
import { verifyPaystackTransaction } from "@/lib/paystack"

async function processVerification(reference: string, isBrowserNavigation: boolean, requestUrl: string) {
  if (!reference) {
    if (isBrowserNavigation) {
      return NextResponse.redirect(new URL("/bookings?payment=error&reason=missing_reference", requestUrl))
    }
    return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
  }

  const verification = await verifyPaystackTransaction(reference)

  if (!verification.success) {
    if (isBrowserNavigation) {
      return NextResponse.redirect(new URL("/bookings?payment=failed", requestUrl))
    }
    return NextResponse.json(
      { error: verification.message || "Payment verification failed" },
      { status: 400 }
    )
  }

  // Find corresponding booking by paymentReference or reference matching pattern
  let booking = await prisma.booking.findFirst({
    where: { paymentReference: reference },
    include: { provider: true },
  })

  if (!booking && reference.includes("_")) {
    const parts = reference.split("_")
    const possibleBookingId = parts[1]
    if (possibleBookingId) {
      booking = await prisma.booking.findFirst({
        where: { id: possibleBookingId },
        include: { provider: true },
      })
    }
  }

  if (!booking) {
    booking = await prisma.booking.findFirst({
      where: { id: reference },
      include: { provider: true },
    })
  }

  if (!booking) {
    if (isBrowserNavigation) {
      return NextResponse.redirect(new URL("/bookings?payment=error&reason=booking_not_found", requestUrl))
    }
    return NextResponse.json({ error: "Booking not found for reference" }, { status: 404 })
  }

  if (booking.paymentStatus !== "PAID") {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: "PAID",
          paymentMethod: "MOBILE_MONEY",
          paidAt: new Date(),
          paymentReference: reference,
        },
      })

      // Notify customer
      await notify(tx, {
        userId: booking.customerId,
        type: "PAYMENT",
        title: "Payment Successful",
        message: "Your payment via Mobile Money was received and verified.",
        href: "/bookings",
      })

      // Notify provider
      await notify(tx, {
        userId: booking.provider.userId,
        type: "PAYMENT",
        title: "Payment Received",
        message: "Customer completed payment for the booking via Mobile Money.",
        href: "/provider",
      })
    })
  }

  if (isBrowserNavigation) {
    return NextResponse.redirect(new URL(`/bookings?payment=success&id=${booking.id}`, requestUrl))
  }

  return NextResponse.json({
    ok: true,
    message: "Payment verified successfully",
    reference,
    bookingId: booking.id,
    paymentStatus: "PAID",
  })
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const reference = url.searchParams.get("reference") || url.searchParams.get("trxref") || ""
    const acceptHeader = request.headers.get("accept") || ""
    const isBrowserNavigation = acceptHeader.includes("text/html")

    return await processVerification(reference, isBrowserNavigation, request.url)
  } catch (err) {
    console.error("[Paystack Verify GET Error]:", err)
    return NextResponse.json({ error: "Internal server error verifying payment" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const url = new URL(request.url)
    const reference = body.reference || url.searchParams.get("reference") || url.searchParams.get("trxref") || ""

    return await processVerification(reference, false, request.url)
  } catch (err) {
    console.error("[Paystack Verify POST Error]:", err)
    return NextResponse.json({ error: "Internal server error verifying payment" }, { status: 500 })
  }
}
