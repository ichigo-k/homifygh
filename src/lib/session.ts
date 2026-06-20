import "server-only"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./auth"

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN"

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

/** Logged-in + email verified. Redirects otherwise. Returns the user. */
export async function requireUser() {
  const session = await getSession()
  if (!session) redirect("/sign-in")
  if (!session.user.emailVerified) redirect("/verify-email")
  return session.user
}

/** Logged-in, verified, and finished onboarding. Returns the user. */
export async function requireOnboarded() {
  const user = await requireUser()
  if (!user.onboardingComplete) redirect("/onboarding/account-type")
  return user
}

/** Requires a specific role (after onboarding). Redirects to the user's own home otherwise. */
export async function requireRole(role: Role) {
  const user = await requireOnboarded()
  if (user.role !== role) redirect(homeFor(user.role as Role))
  return user
}

/** The landing route for a given role. */
export function homeFor(role: Role) {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "PROVIDER":
      return "/provider"
    default:
      return "/search"
  }
}
