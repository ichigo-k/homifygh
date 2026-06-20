import { requireUser } from "@/lib/session"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Must be signed in + email verified to onboard.
  await requireUser()

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <main className="w-full max-w-xl">{children}</main>
    </div>
  )
}
