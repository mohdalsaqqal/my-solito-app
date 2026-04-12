import { createHash } from 'node:crypto'

/**
 * In-memory sliding-window rate limiter for Next.js route handlers.
 *
 * Zero external dependencies. Uses a fixed-size bucket window
 * to approximate sliding-window semantics.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 })
 *   const result = limiter.consume(ipKey)
 *   if (!result.allowed) return fail('RATE_LIMITED', ...)
 */

interface BucketEntry {
  count: number
  resetAt: number
}

export interface RateLimitStore {
  get(key: string): BucketEntry | undefined
  set(key: string, entry: BucketEntry): void
  delete(key: string): void
  prune(now: number): number
  size(): number
}

export interface RateLimiterConfig {
  /** Time window in milliseconds (e.g. 60_000 for 1 minute) */
  windowMs: number
  /** Maximum requests allowed per window per key */
  maxRequests: number
  /** Optional prefix for key namespacing */
  prefix?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: number
  retryAfterMs?: number
}

export class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, BucketEntry>()

  get(key: string) {
    return this.buckets.get(key)
  }

  set(key: string, entry: BucketEntry) {
    this.buckets.set(key, entry)
  }

  delete(key: string) {
    this.buckets.delete(key)
  }

  prune(now: number) {
    let pruned = 0
    this.buckets.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        this.buckets.delete(key)
        pruned++
      }
    })
    return pruned
  }

  size() {
    return this.buckets.size
  }
}

export class RateLimiter {
  private readonly windowMs: number
  private readonly maxRequests: number
  private readonly prefix: string
  private readonly store: RateLimitStore

  constructor(config: RateLimiterConfig, store: RateLimitStore = new MemoryRateLimitStore()) {
    this.windowMs = config.windowMs
    this.maxRequests = config.maxRequests
    this.prefix = config.prefix ?? 'rl'
    this.store = store
  }

  consume(key: string): RateLimitResult {
    const now = Date.now()
    const fullKey = `${this.prefix}:${key}`
    const entry = this.store.get(fullKey)

    if (!entry || now >= entry.resetAt) {
      // New window
      const newEntry: BucketEntry = {
        count: 1,
        resetAt: now + this.windowMs,
      }
      this.store.set(fullKey, newEntry)
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        limit: this.maxRequests,
        resetAt: newEntry.resetAt,
      }
    }

    // Existing window
    entry.count += 1

    if (entry.count > this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        limit: this.maxRequests,
        resetAt: entry.resetAt,
        retryAfterMs: entry.resetAt - now,
      }
    }

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      limit: this.maxRequests,
      resetAt: entry.resetAt,
    }
  }

  /** Reset counters for a specific key (e.g. after successful login) */
  reset(key: string): void {
    const fullKey = `${this.prefix}:${key}`
    this.store.delete(fullKey)
  }

  /** Remove expired buckets (call periodically or on a timer) */
  prune(): number {
    return this.store.prune(Date.now())
  }

  /** Total active buckets (for monitoring) */
  get size(): number {
    return this.store.size()
  }
}

// ── Singleton instances per endpoint category ─────────────────────────

// Auth endpoints: strict — 5 attempts per 10 minutes per IP
export const authLimiter = new RateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  prefix: 'auth',
})

// Registration: 3 per 10 minutes per IP
export const registrationLimiter = new RateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 3,
  prefix: 'register',
})

// Password reset: 2 per 15 minutes per IP
export const passwordResetLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 2,
  prefix: 'reset',
})

// Public read endpoints (search, browse): 60 per minute per IP
export const publicReadLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  prefix: 'read',
})

// General API catch-all: 30 per minute per IP
export const generalLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  prefix: 'general',
})

// Cart mutations: 20 per minute per IP
export const cartMutationLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  prefix: 'cart',
})

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Extract client IP from Next.js request headers.
 * Falls back to 'unknown' if no forwarding headers exist.
 */
export function getClientIp(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwarded) {
    return vercelForwarded.split(',')[0]!.trim()
  }
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // First IP in the chain is the client
    return forwarded.split(',')[0]!.trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

function hashFingerprint(parts: Array<string | null | undefined>) {
  const normalized = parts.map((part) => (part ?? '').trim()).join('|')
  return createHash('sha256').update(normalized).digest('hex').slice(0, 24)
}

export function buildRateLimitKey(
  request: Request,
  options?: {
    actorId?: string | null
    machineId?: string | null
  },
) {
  if (options?.actorId) {
    return `actor:${options.actorId}`
  }

  if (options?.machineId) {
    return `machine:${hashFingerprint([options.machineId])}`
  }

  const clientIp = getClientIp(request)
  if (clientIp !== 'unknown') {
    return `ip:${clientIp}`
  }

  const fallbackFingerprint = hashFingerprint([
    request.headers.get('user-agent'),
    request.headers.get('accept-language'),
    request.headers.get('sec-ch-ua'),
    request.headers.get('sec-fetch-site'),
  ])
  return `fingerprint:${fallbackFingerprint}`
}

/**
 * Build a rate-limit response helper.
 * Returns the body message and RateLimit headers to attach to the response.
 */
export function buildRateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfterMs
      ? { 'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)) }
      : {}),
  }
}

/**
 * Auto-prune expired buckets every 60 seconds.
 * Call once at module load to start the interval.
 */
let pruneStarted = false
export function startAutoPrune(): void {
  if (pruneStarted) return
  pruneStarted = true
  setInterval(() => {
    const total =
      authLimiter.prune() +
      registrationLimiter.prune() +
      passwordResetLimiter.prune() +
      publicReadLimiter.prune() +
      generalLimiter.prune() +
      cartMutationLimiter.prune()
    if (total > 0 && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[rate-limiter] Pruned ${total} expired buckets`)
    }
  }, 60_000)
}
