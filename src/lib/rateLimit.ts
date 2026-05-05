/**
 * In-memory sliding-window rate limiter for Next.js API routes.
 *
 * IMPORTANT: This store resets on serverless cold starts. In a multi-instance
 * deployment, each instance enforces limits independently. For strict cross-instance
 * limiting, replace the Map with an external store (e.g., Upstash Redis).
 * For the current single-region Vercel deployment this provides meaningful
 * per-process protection against burst abuse.
 */

import { NextResponse } from 'next/server'

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window. */
  limit: number
  /** Duration of the time window in milliseconds. */
  windowMs: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Keyed by `${routePath}:${clientIP}` — one counter per route per IP.
const store = new Map<string, RateLimitEntry>()

// Prune expired entries every 5 minutes to prevent unbounded memory growth.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

/**
 * Extract the originating client IP from request headers.
 * Prefers x-forwarded-for (set by Vercel / proxies) over x-real-ip.
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP.trim()
  return 'unknown'
}

/**
 * Extract the base path from a URL (strips query string) for use as the
 * rate limit bucket key.
 */
function getRoutePath(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url.split('?')[0]
  }
}

/**
 * Check whether the request exceeds the rate limit.
 *
 * @returns A `NextResponse` with status 429 if the limit is exceeded,
 *          or `null` if the request is allowed to proceed.
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const limited = rateLimit(request, PUBLIC_LIMIT)
 *   if (limited) return limited
 *   // ... handler logic
 * }
 * ```
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig
): NextResponse | null {
  const ip = getClientIP(request)
  const route = getRoutePath(request.url)
  const key = `${route}:${ip}`
  const now = Date.now()

  let entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + config.windowMs }
    store.set(key, entry)
    return null
  }

  if (entry.count >= config.limit) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    )
  }

  entry.count++
  return null
}

/** 30 requests per minute — applied to all public proxy routes. */
export const PUBLIC_LIMIT: RateLimitConfig = { limit: 30, windowMs: 60_000 }

/** 10 requests per minute — applied to authenticated action routes (subscribe/unsubscribe). */
export const AUTH_LIMIT: RateLimitConfig = { limit: 10, windowMs: 60_000 }
