import { PrismaClient } from '@prisma/client'

/**
 * Lazy Prisma client singleton.
 *
 * The client is only instantiated on first property access (lazy proxy),
 * so it never throws during module evaluation. This prevents the
 * "Can't reach database server" error from bubbling up during SSR
 * when the database is not running locally.
 *
 * In production, ensure DATABASE_URL is set and the DB is reachable.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  globalForPrisma.prisma = new PrismaClient({
    log: process.env.PRISMA_CLIENT_LOG === 'error' ? ['error'] : [],
  })

  // Lazy-connect: attempt once, swallow error in dev so mock adapters work
  if (process.env.NODE_ENV === 'development') {
    globalForPrisma.prisma.$connect().catch(() => {
      // Database not available — mock adapters will serve data.
    })
  }

  return globalForPrisma.prisma
}

// Proxy: only creates the real PrismaClient when a property is accessed.
// This prevents initialization errors during module evaluation.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: keyof PrismaClient) {
    return getPrisma()[prop]
  },
})
