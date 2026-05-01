import { createHash } from 'node:crypto'
import { prisma } from '../../../server/lib/prisma'

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
  consume(key: string, windowMs: number): Promise<BucketEntry>
  delete(key: string): Promise<void>
  prune(now: number): Promise<number>
  size(): Promise<number>
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

  async consume(key: string, windowMs: number) {
    const now = Date.now()
    const entry = this.buckets.get(key)

    if (!entry || now >= entry.resetAt) {
      const newEntry: BucketEntry = {
        count: 1,
        resetAt: now + windowMs,
      }
      this.buckets.set(key, newEntry)
      return newEntry
    }

    entry.count += 1
    return entry
  }

  async delete(key: string) {
    this.buckets.delete(key)
  }

  async prune(now: number) {
    let pruned = 0
    this.buckets.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        this.buckets.delete(key)
        pruned++
      }
    })
    return pruned
  }

  async size() {
    return this.buckets.size
  }
}

class PrismaRateLimitStore implements RateLimitStore {
  async consume(key: string, windowMs: number) {
    const resetAt = new Date(Date.now() + windowMs)
    const rows = await prisma.$queryRawUnsafe(
      `
        INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
        VALUES ($1, 1, $2, NOW())
        ON CONFLICT ("key") DO UPDATE
        SET
          "count" = CASE
            WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1
            ELSE "RateLimitBucket"."count" + 1
          END,
          "resetAt" = CASE
            WHEN "RateLimitBucket"."resetAt" <= NOW() THEN $2
            ELSE "RateLimitBucket"."resetAt"
          END,
          "updatedAt" = NOW()
        RETURNING "count", "resetAt"
      `,
      key,
      resetAt,
    )

    const row = (rows as Array<{ count: unknown; resetAt: unknown }>)[0]
    if (!row) {
      throw new Error('Prisma rate limiter did not return a bucket row.')
    }

    return {
      count: Number(row.count),
      resetAt: new Date(row.resetAt as string).getTime(),
    }
  }

  async delete(key: string) {
    await prisma.$executeRawUnsafe(`DELETE FROM "RateLimitBucket" WHERE "key" = $1`, key)
  }

  async prune(now: number) {
    return prisma.$executeRawUnsafe(
      `DELETE FROM "RateLimitBucket" WHERE "resetAt" <= $1`,
      new Date(now),
    )
  }

  async size() {
    const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `SELECT COUNT(*)::bigint AS "count" FROM "RateLimitBucket"`,
    )
    const value = rows[0]?.count ?? 0
    return typeof value === 'bigint' ? Number(value) : Number(value)
  }
}

type RateLimitStoreBackend = 'memory' | 'prisma'

function resolveRateLimitStoreBackend(): RateLimitStoreBackend {
  const configured = process.env.RATE_LIMIT_STORE?.trim().toLowerCase()
  if (configured === 'prisma') {
    return 'prisma'
  }
  return 'memory'
}

let sharedRateLimitStore: RateLimitStore | null = null
let prismaRateLimitFallbackWarned = false

async function getConfiguredRateLimitStore() {
  if (sharedRateLimitStore) {
    return sharedRateLimitStore
  }

  if (resolveRateLimitStoreBackend() === 'prisma') {
    sharedRateLimitStore = new PrismaRateLimitStore()
    return sharedRateLimitStore
  }

  sharedRateLimitStore = new MemoryRateLimitStore()
  return sharedRateLimitStore
}

export class RateLimiter {
  private readonly windowMs: number
  private readonly maxRequests: number
  private readonly prefix: string

  constructor(config: RateLimiterConfig) {
    this.windowMs = config.windowMs
    this.maxRequests = config.maxRequests
    this.prefix = config.prefix ?? 'rl'
  }

  async consume(key: string): Promise<RateLimitResult> {
    const fullKey = `${this.prefix}:${key}`
    const now = Date.now()
    try {
      const store = await getConfiguredRateLimitStore()
      const entry = await store.consume(fullKey, this.windowMs)
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
    } catch (error) {
      if (!prismaRateLimitFallbackWarned && resolveRateLimitStoreBackend() === 'prisma') {
        prismaRateLimitFallbackWarned = true
        console.warn('[rate-limiter] Falling back to in-memory store after Prisma failure.', error)
      }

      sharedRateLimitStore = new MemoryRateLimitStore()
      const entry = await sharedRateLimitStore.consume(fullKey, this.windowMs)
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
  }

  /** Reset counters for a specific key (e.g. after successful login) */
  async reset(key: string): Promise<void> {
    const fullKey = `${this.prefix}:${key}`
    const store = await getConfiguredRateLimitStore()
    await store.delete(fullKey)
  }

  /** Remove expired buckets (call periodically or on a timer) */
  async prune(): Promise<number> {
    const store = await getConfiguredRateLimitStore()
    return store.prune(Date.now())
  }

  /** Total active buckets (for monitoring) */
  async size(): Promise<number> {
    const store = await getConfiguredRateLimitStore()
    return store.size()
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

// Session reads: moderate ceiling to prevent cheap authenticated hammering
export const sessionReadLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  prefix: 'session',
})

// Password reset: 2 per 15 minutes per IP
export const passwordResetLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 2,
  prefix: 'reset',
})

// Checkout quote creation: persisted write surface, moderate ceiling
export const checkoutQuoteLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  prefix: 'checkout-quote',
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
  setInterval(async () => {
    const totals = await Promise.all([
      authLimiter.prune(),
      registrationLimiter.prune(),
      sessionReadLimiter.prune(),
      passwordResetLimiter.prune(),
      checkoutQuoteLimiter.prune(),
      publicReadLimiter.prune(),
      generalLimiter.prune(),
      cartMutationLimiter.prune(),
    ])
    const total = totals.reduce((sum, value) => sum + value, 0)
    if (total > 0 && process.env.NODE_ENV !== 'production') {
      console.log(`[rate-limiter] Pruned ${total} expired buckets`)
    }
  }, 60_000)
}
