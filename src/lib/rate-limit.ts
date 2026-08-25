/**
 * In-memory sliding window rate limiter for security & brute force protection.
 * Protects login, signup, password reset, and payment endpoints.
 */

type RecordEntry = {
  count: number
  resetTime: number
}

const tracker = new Map<string, RecordEntry>()

export function checkRateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const entry = tracker.get(key)

  if (!entry || now > entry.resetTime) {
    tracker.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetMs: windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetMs: entry.resetTime - now }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, resetMs: entry.resetTime - now }
}
