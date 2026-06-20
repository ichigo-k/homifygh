import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

// Optimistic, cookie-only checks (no DB). Fine-grained role / verification /
// onboarding gating happens server-side in each area's layout via session.ts.
const PROTECTED = ["/dashboard", "/provider", "/admin", "/onboarding"]
const AUTH_PAGES = ["/sign-in", "/sign-up"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = !!getSessionCookie(request)

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))

  if (isProtected && !hasSession) {
    const url = new URL("/sign-in", request.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // Already signed in but visiting sign-in/sign-up → send into the app; the
  // server layouts route to the correct role home / onboarding step.
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/provider/:path*", "/admin/:path*", "/onboarding/:path*", "/sign-in", "/sign-up"],
}
