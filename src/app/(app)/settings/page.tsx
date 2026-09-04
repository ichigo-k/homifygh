import { headers } from "next/headers"
import { requireRole, getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { BackButton } from "@/components/back-button"
import { SettingsClient, type DeviceSession } from "./settings-client"

export default async function SettingsPage() {
  const user = await requireRole("CUSTOMER")
  const [prefs, current, sessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { notificationsEnabled: true, locationSharingEnabled: true },
    }),
    getSession(),
    auth.api.listSessions({ headers: await headers() }).catch(() => [] as Awaited<ReturnType<typeof auth.api.listSessions>>),
  ])

  const currentToken = current?.session.token
  const devices: DeviceSession[] = sessions
    .map((s) => ({
      id: s.id,
      current: s.token === currentToken,
      userAgent: s.userAgent ?? null,
      ipAddress: s.ipAddress ?? null,
      createdAt: s.createdAt.toISOString(),
    }))
    .sort((a, b) => (a.current ? -1 : b.current ? 1 : 0))

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <BackButton className="mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Preferences</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Control notifications, location sharing and account security.</p>
        <SettingsClient
          notificationsEnabled={prefs?.notificationsEnabled ?? true}
          locationSharingEnabled={prefs?.locationSharingEnabled ?? false}
          devices={devices}
        />
      </div>
    </main>
  )
}
