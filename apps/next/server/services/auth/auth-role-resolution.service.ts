import { prisma } from '../../lib/prisma'
import type { AuthRole } from '@real/providers/contracts'
import { isReleaseLikeEnvironment } from '../../../app/api/_lib/security-policy'

const SEEDED_ROLE_BY_EMAIL: Record<string, AuthRole> = {
  'user@realcosmetics.local': 'customer',
  'admin@realcosmetics.local': 'admin',
  'pharma@realcosmetics.local': 'pharmacist',
  'marketing@realcosmetics.local': 'marketing',
  'catalog@realcosmetics.local': 'catalog',
  'support@realcosmetics.local': 'support',
  'ops@realcosmetics.local': 'ops',
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function inferRoleFromEmail(email: string): AuthRole {
  return SEEDED_ROLE_BY_EMAIL[normalizeEmail(email)] ?? 'customer'
}

export async function resolveAppOwnedRoleForUser(user: { id: string; email: string }): Promise<AuthRole> {
  const inferredRole = inferRoleFromEmail(user.email)
  if (process.env.NODE_ENV === 'test') {
    return inferredRole
  }

  let mapping: { role: AuthRole } | null = null
  try {
    mapping = await prisma.appAuthRoleMapping.findUnique({
      where: { userId: user.id },
      select: { role: true },
    }) as { role: AuthRole } | null
  } catch {
    return isReleaseLikeEnvironment() ? 'customer' : inferredRole
  }

  if (mapping) {
    return mapping.role
  }

  if (isReleaseLikeEnvironment()) {
    return 'customer'
  }

  const role = inferredRole
  try {
    await prisma.appAuthRoleMapping.upsert({
      where: { userId: user.id },
      update: { role },
      create: {
        userId: user.id,
        role,
      },
    })
  } catch {
    return role
  }

  return role
}
