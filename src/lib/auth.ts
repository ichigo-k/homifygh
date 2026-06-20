import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { emailOTP } from "better-auth/plugins"
import { prisma } from "./prisma"
import { sendOtpEmail } from "./email"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh if older than 1 day
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      role: { type: "string", defaultValue: "CUSTOMER", input: false },
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      onboardingComplete: { type: "boolean", defaultValue: false, input: false },
      locationLabel: { type: "string", required: false },
      lat: { type: "number", required: false },
      lng: { type: "number", required: false },
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp }) {
        await sendOtpEmail(email, otp)
      },
    }),
  ],
})

export type Session = typeof auth.$Infer.Session
