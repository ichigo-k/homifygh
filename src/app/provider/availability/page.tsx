import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { AvailabilityClient } from "./availability-client"

export default async function AvailabilityPage() {
  const user = await requireRole("PROVIDER")
  const provider = await prisma.provider.findUnique({ where: { userId: user.id }, select: { bookingLeadHours: true, workingDays: true, workStart: true, workEnd: true, breakStart: true, breakEnd: true, bufferMinutes: true, unavailableDates: true } })
  if (!provider) redirect("/provider")
  return <AvailabilityClient initial={provider} />
}
