import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { signUpload } from "@/lib/cloudinary"

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const folder = `homify/kyc/${session.user.id}`
  const { signature, timestamp, apiKey, cloudName } = signUpload({ folder })

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder })
}
