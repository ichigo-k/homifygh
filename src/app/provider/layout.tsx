import { redirect } from "next/navigation"
import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole("PROVIDER")

  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    select: { status: true },
  })

  // No application or still in review / rejected → back to the status screen.
  if (!provider || provider.status !== "APPROVED") {
    redirect("/onboarding/provider/pending")
  }

  return <>{children}</>
}
