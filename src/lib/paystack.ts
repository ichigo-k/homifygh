import crypto from "crypto"

export interface InitializePaystackParams {
  email: string
  amount: number
  bookingId: string
  reference?: string
  callbackUrl?: string
}

export interface PaystackInitializeResponse {
  url: string
  reference: string
}

export interface PaystackVerifyResponse {
  success: boolean
  message?: string
  data?: {
    reference: string
    status: string
    amount: number
    channel?: string
    gateway_response?: string
    paid_at?: string
    metadata?: Record<string, any>
  }
}

/**
 * Initializes a Paystack transaction for a booking.
 * Returns an authorization URL and payment reference.
 */
export async function initializePaystackTransaction(
  params: InitializePaystackParams
): Promise<PaystackInitializeResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  const reference =
    params.reference || `PSK_${params.bookingId}_${Date.now()}`

  if (secretKey) {
    try {
      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: params.email,
            amount: Math.round(params.amount * 100), // amount in pesewas / kobo
            reference,
            callback_url: params.callbackUrl,
            metadata: {
              bookingId: params.bookingId,
            },
          }),
        }
      )

      const data = await response.json()
      if (data.status && data.data?.authorization_url) {
        return {
          url: data.data.authorization_url,
          reference: data.data.reference || reference,
        }
      }
      console.warn("[Paystack] Initialization returned error, using fallback:", data.message)
    } catch (err) {
      console.error("[Paystack] Initialization request failed:", err)
    }
  }

  // Fallback for development / missing key
  const fallbackUrl = params.callbackUrl
    ? `${params.callbackUrl}?reference=${encodeURIComponent(reference)}`
    : `/api/paystack/verify?reference=${encodeURIComponent(reference)}`

  return {
    url: fallbackUrl,
    reference,
  }
}

/**
 * Verifies a Paystack transaction by its reference.
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (secretKey) {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        }
      )

      const data = await response.json()
      if (data.status && data.data?.status === "success") {
        return {
          success: true,
          data: data.data,
        }
      }

      return {
        success: false,
        message: data.message || "Transaction verification failed or unpaid.",
        data: data.data,
      }
    } catch (err) {
      console.error("[Paystack] Verification request failed:", err)
      return {
        success: false,
        message: "Failed to connect to payment provider.",
      }
    }
  }

  // Fallback mode for development without secret key
  return {
    success: true,
    data: {
      reference,
      status: "success",
      amount: 0,
      channel: "mobile_money",
    },
  }
}

/**
 * Verifies Paystack webhook signature using HMAC SHA512.
 */
export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    // If secret key is not configured, skip verification in dev mode
    return true
  }

  if (!signatureHeader) {
    return false
  }

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex")

  return hash === signatureHeader
}
