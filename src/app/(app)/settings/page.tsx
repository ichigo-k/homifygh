import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/components/back-button"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const user = await requireRole("CUSTOMER")
  const prefs = await prisma.user.findUnique({
    where: { id: user.id },
    select: { notificationsEnabled: true, locationSharingEnabled: true },
  })

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <BackButton className="mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Preferences</p>
        <h1 className="mt-1 text-3xl font-extrabold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Control notifications and location sharing.</p>
        <SettingsClient
          notificationsEnabled={prefs?.notificationsEnabled ?? true}
          locationSharingEnabled={prefs?.locationSharingEnabled ?? false}
        />
      </div>
    </main>
  )
}
