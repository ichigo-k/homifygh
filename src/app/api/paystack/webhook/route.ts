import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notify, audit } from "@/lib/events"
import { verifyPaystackSignature } from "@/lib/paystack"

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-paystack-signature")
    const rawBody = await request.text()

    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const { event, data } = payload

    if (event === "charge.success") {
      const reference = data?.reference
      const bookingIdFromMeta = data?.metadata?.bookingId

      let booking = await prisma.booking.findFirst({
        where: { paymentReference: reference },
        include: { provider: true },
      })

      if (!booking && bookingIdFromMeta) {
        booking = await prisma.booking.findFirst({
          where: { id: bookingIdFromMeta },
          include: { provider: true },
        })
      }

      if (!booking && reference?.includes("_")) {
        const parts = reference.split("_")
        const possibleBookingId = parts[1]
        if (possibleBookingId) {
          booking = await prisma.booking.findFirst({
            where: { id: possibleBookingId },
            include: { provider: true },
          })
        }
      }

      if (booking && booking.paymentStatus !== "PAID") {
        const amount =
          booking.agreedAmount ??
          booking.amount ??
          booking.offeredAmount ??
          booking.depositAmount ??
          (data.amount ? data.amount / 100 : 0)

        const channel = data.channel ? `PAYSTACK_${data.channel.toUpperCase()}` : "MOBILE_MONEY"

        await prisma.$transaction(async (tx) => {
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: "PAID",
              paymentMethod: channel,
              paidAt: new Date(),
              paymentReference: reference || booking.paymentReference,
            },
          })

          if (amount > 0) {
            await tx.user.update({
              where: { id: booking.provider.userId },
              data: {
                walletBalance: { increment: amount },
              },
            })

            await tx.walletTransaction.create({
              data: {
                userId: booking.provider.userId,
                amount,
                type: "CREDIT",
                description: `Payment for booking #${booking.id.slice(-6)}`,
              },
            })
          }

          await audit(tx, {
            actorId: booking.customerId,
            action: "PAYMENT_WEBHOOK_PAID",
            entityType: "Booking",
            entityId: booking.id,
            metadata: { amount, reference, channel },
          })

          await notify(tx, {
            userId: booking.customerId,
            type: "PAYMENT",
            title: "Payment Confirmed",
            message: "Your payment was successfully processed.",
            href: "/bookings",
          })

          await notify(tx, {
            userId: booking.provider.userId,
            type: "PAYMENT",
            title: "Payment Received",
            message: `Payment of GH₵${amount.toLocaleString()} for booking #${booking.id.slice(-6)} was credited to your wallet.`,
            href: "/wallet",
          })
        })
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 })
  } catch (err) {
    console.error("[Paystack Webhook Error]:", err)
    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    )
  }
}
