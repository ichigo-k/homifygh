"use server"

import { z } from "zod"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

const CATEGORIES = [
  "PLUMBER",
  "ELECTRICIAN",
  "CARPENTER",
  "AC_TECHNICIAN",
  "CLEANER",
  "PAINTER",
  "MASON",
] as const
const categoryEnum = z.enum(CATEGORIES)

const customerSchema = z.object({
  locationLabel: z.string().trim().min(2, "Enter your location"),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  interests: z.array(categoryEnum).min(1, "Pick at least one service"),
})

export async function completeCustomerOnboarding(input: z.infer<typeof customerSchema>) {
  const user = await requireUser()
  const data = customerSchema.parse(input)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: "CUSTOMER",
      locationLabel: data.locationLabel,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      interests: data.interests,
      onboardingComplete: true,
    },
  })

  redirect("/search")
}

const kycSchema = z.object({
  category: categoryEnum,
  bio: z.string().trim().min(20, "Tell customers a bit more (20+ characters)"),
  locationLabel: z.string().trim().min(2, "Enter your base location"),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  serviceRadiusKm: z.coerce.number().min(1).max(100),
  ghanaCardNumber: z
    .string()
    .trim()
    .regex(/^GHA-\d{9}-\d$/i, "Format: GHA-XXXXXXXXX-X"),
  ghanaCardFrontUrl: z.string().url("Upload the front of your Ghana Card"),
  ghanaCardBackUrl: z.string().url("Upload the back of your Ghana Card"),
  selfieUrl: z.string().url("Upload a selfie"),
})

export async function submitProviderKyc(input: z.infer<typeof kycSchema>) {
  const user = await requireUser()
  const data = kycSchema.parse(input)

  await prisma.$transaction([
    prisma.provider.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        category: data.category,
        bio: data.bio,
        locationLabel: data.locationLabel,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        serviceRadiusKm: data.serviceRadiusKm,
        ghanaCardNumber: data.ghanaCardNumber.toUpperCase(),
        ghanaCardFrontUrl: data.ghanaCardFrontUrl,
        ghanaCardBackUrl: data.ghanaCardBackUrl,
        selfieUrl: data.selfieUrl,
        status: "PENDING",
        // Reset review trail on (re)submit.
        reviewNotes: null,
        reviewedAt: null,
        reviewedById: null,
        isVerified: false,
      },
      update: {
        category: data.category,
        bio: data.bio,
        locationLabel: data.locationLabel,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        serviceRadiusKm: data.serviceRadiusKm,
        ghanaCardNumber: data.ghanaCardNumber.toUpperCase(),
        ghanaCardFrontUrl: data.ghanaCardFrontUrl,
        ghanaCardBackUrl: data.ghanaCardBackUrl,
        selfieUrl: data.selfieUrl,
        status: "PENDING",
        reviewNotes: null,
        reviewedAt: null,
        reviewedById: null,
        isVerified: false,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      // Provider's onboarding is "complete" once KYC is submitted; the gates
      // beyond this (review, store setup) live in the /provider area.
      data: { role: "PROVIDER", onboardingComplete: true },
    }),
  ])

  redirect("/onboarding/provider/pending")
}
