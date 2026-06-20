import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { AccountClient } from "./account-client"

export default async function AccountPage() {
  const sessionUser = await requireRole("CUSTOMER")

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      phone: true,
      locationLabel: true,
    },
  })

  return (
    <AccountClient
      profile={{
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        locationLabel: user?.locationLabel ?? "",
      }}
    />
  )
}
