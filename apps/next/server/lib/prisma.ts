import { PrismaClient } from '@prisma/client'

/**
 * Singleton Prisma client for the Next.js server.
 * Prevents hot-reload from creating multiple connections in dev.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
