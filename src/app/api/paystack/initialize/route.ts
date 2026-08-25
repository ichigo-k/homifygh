import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { initializePaystackTransaction } from "@/lib/paystack"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { bookingId } = body

    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: session.user.id,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    const amount =
      booking.agreedAmount ??
      booking.amount ??
      booking.offeredAmount ??
      booking.depositAmount ??
      0

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Booking does not have a valid payment amount" },
        { status: 400 }
      )
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    const callbackUrl = `${origin}/api/paystack/verify`

    const { url, reference } = await initializePaystackTransaction({
      email: session.user.email,
      amount,
      bookingId: booking.id,
      callbackUrl,
    })

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentReference: reference },
    })

    return NextResponse.json({ url, reference })
  } catch (err) {
    console.error("[Paystack Initialize Error]:", err)
    return NextResponse.json(
      { error: "Internal server error initializing payment" },
      { status: 500 }
    )
  }
}
