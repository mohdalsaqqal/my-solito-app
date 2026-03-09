/* eslint-disable @typescript-eslint/no-explicit-any */

type PrismaModule = {
  PrismaClient: new (...args: any[]) => any
}

let prismaSingleton: any | null = null

function loadPrismaModule(): PrismaModule {
  try {
    const req = (0, eval)('require') as (id: string) => PrismaModule
    return req('@prisma/client')
  } catch {
    throw new Error('Prisma client is not installed. Run prisma generate in apps/next before using DB-backed providers.')
  }
}

export function getDbClient() {
  if (prismaSingleton) {
    return prismaSingleton
  }

  const { PrismaClient } = loadPrismaModule()
  prismaSingleton = new PrismaClient()
  return prismaSingleton
}
