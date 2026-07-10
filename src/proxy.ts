import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const PROTECTED = ["/search", "/bookings", "/account", "/provider", "/admin", "/onboarding"]
const AUTH_PAGES = ["/sign-in", "/sign-up"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = !!getSessionCookie(request)
  const isProtected = PROTECTED.some((path) => pathname.startsWith(path))
  const isAuthPage = AUTH_PAGES.some((path) => pathname.startsWith(path))
  if (isProtected && !hasSession) {
    const url = new URL("/sign-in", request.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }
  if (isAuthPage && hasSession) return NextResponse.redirect(new URL("/search", request.url))
  return NextResponse.next()
}

export const config = { matcher: ["/search/:path*", "/bookings/:path*", "/account/:path*", "/provider/:path*", "/admin/:path*", "/onboarding/:path*", "/sign-in", "/sign-up"] }
