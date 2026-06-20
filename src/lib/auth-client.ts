import { createAuthClient } from "better-auth/react"
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>(), emailOTPClient()],
})

export const { signIn, signUp, signOut, useSession, emailOtp } = authClient
