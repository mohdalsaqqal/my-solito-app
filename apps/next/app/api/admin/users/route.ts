import { prisma } from '../../../../server/lib/prisma'
import { cmsProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { applyAdminControlsToCms, readAdminControlsState, writeAdminControlsState, pushAudit } from '../../_lib/admin-controls-store'
import { AdminCreateUserInput, AdminDomainPermissionSet, AdminPermissionSet, AdminUserControlRecord, AuthRole } from '@real/app/lib/types'
import { AdminDomain, hasAdminDomainPermission } from '../../_lib/admin-rbac'
import { hashBetterAuthPassword } from '../../_lib/password-hash'
import { isReleaseLikeEnvironment } from '../../_lib/security-policy'

const VALID_DOMAINS = ['dashboard', 'catalog', 'sales', 'inventory', 'marketplace', 'marketing', 'customers', 'operations', 'settings'] as const
const VALID_PERMISSION_VALUES = ['none', 'read', 'full'] as const

function isValidDomainPermissionSet(input: unknown): input is Partial<AdminDomainPermissionSet> {
  if (!input || typeof input !== 'object') return false
  const obj = input as Record<string, unknown>
  for (const [key, value] of Object.entries(obj)) {
    if (!(VALID_DOMAINS as readonly string[]).includes(key)) return false
    if (!(VALID_PERMISSION_VALUES as readonly string[]).includes(value as string)) return false
  }
  return true
}

function defaultAdminPermissions(role: AuthRole): AdminPermissionSet {
  return {
    canManageCmsToggles: role === 'admin',
    canManageUsers: role === 'admin',
    canRunCacheOps: role === 'admin' || role === 'ops',
  }
}

async function readDbAdminUsers(): Promise<AdminUserControlRecord[]> {
  const state = await readAdminControlsState()
  const dbRoleMappings = await prisma.appAuthRoleMapping.findMany({
    include: { user: true },
    orderBy: { updatedAt: 'desc' },
  })

  return dbRoleMappings.map((mapping) => {
    const override = state.userOverrides[mapping.user.id]
    const role = override?.role ?? mapping.role
    return {
      id: mapping.user.id,
      name: mapping.user.name,
      email: mapping.user.email,
      role,
      status: override?.status ?? 'active',
      lastActiveAt: undefined,
      permissions: override?.permissions ?? defaultAdminPermissions(role),
      domainPermissions: override?.domainPermissions,
    }
  })
}

async function readMockRolePreviewUsers(): Promise<AdminUserControlRecord[]> {
  const cmsResult = await cmsProvider.getHome()
  if (!cmsResult.ok) {
    throw new Error(`${cmsResult.error.code}: ${cmsResult.error.message}`)
  }

  const state = await readAdminControlsState()
  const home = applyAdminControlsToCms(cmsResult.data, state)
  return (home.identity?.admin?.rolePreview ?? []).map((user) => {
    const override = state.userOverrides[user.id]
    const role = override?.role ?? user.role
    return {
      ...user,
      role,
      status: override?.status ?? user.status,
      permissions: override?.permissions ?? user.permissions ?? defaultAdminPermissions(role),
      domainPermissions: override?.domainPermissions,
    }
  })
}

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'customers')
    if (session instanceof Response) {
      return session
    }

    let users: AdminUserControlRecord[] = []
    try {
      users = await readDbAdminUsers()
    } catch (cause) {
      if (isReleaseLikeEnvironment()) {
        throw cause
      }
    }

    if (users.length === 0 && !isReleaseLikeEnvironment()) {
      users = await readMockRolePreviewUsers()
    }

    return ok(users)
  } catch (cause) {
    return fail('ADMIN_USERS_UNEXPECTED', 'Unexpected error while loading users.', 500, {
      scope: 'GET /api/admin/users',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'customers', 'full')
    if (session instanceof Response) {
      return session
    }

    const body = await request.json() as AdminCreateUserInput

    if (!body.name?.trim()) {
      return fail('ADMIN_USER_CREATE_MISSING_NAME', 'Name is required.', 400)
    }
    if (!body.email?.trim() || !body.email.includes('@')) {
      return fail('ADMIN_USER_CREATE_MISSING_EMAIL', 'A valid email is required.', 400)
    }
    if (!body.password || body.password.length < 8) {
      return fail('ADMIN_USER_CREATE_MISSING_PASSWORD', 'Password must be at least 8 characters.', 400)
    }
    if (!body.role) {
      return fail('ADMIN_USER_CREATE_INVALID_ROLE', 'A role is required.', 400)
    }

    // Prevent privilege escalation: non-admin creators can only assign roles
    // at or below their own privilege level.
    const CREATOR_DELEGATABLE: AuthRole[] = session.role === 'admin'
      ? ['admin', 'marketing', 'catalog', 'support', 'ops', 'pharmacist', 'customer']
      : ['customer', 'pharmacist', session.role]
    if (!CREATOR_DELEGATABLE.includes(body.role)) {
      return fail('ADMIN_USER_CREATE_INVALID_ROLE', 'You cannot assign this role.', 403)
    }

    if (body.domainPermissions && !isValidDomainPermissionSet(body.domainPermissions)) {
      return fail('ADMIN_USER_CREATE_INVALID_PERMISSIONS', 'Invalid domain permissions.', 400)
    }

    // Prevent privilege escalation: creator can only grant domain permissions
    // they themselves hold. Non-admin-panel roles cannot receive domain permissions.
    if (body.domainPermissions && Object.keys(body.domainPermissions).length > 0) {
      if (body.role === 'customer' || body.role === 'pharmacist') {
        return fail('ADMIN_USER_CREATE_INVALID_PERMISSIONS', 'Domain permissions can only be assigned to admin panel roles.', 400)
      }
      const state = await readAdminControlsState()
      const creatorPerms = state.userOverrides[session.userId]?.domainPermissions as
        | Partial<AdminDomainPermissionSet>
        | undefined
      for (const [domain, level] of Object.entries(body.domainPermissions)) {
        if (!hasAdminDomainPermission(session.role, domain as AdminDomain, level as 'read' | 'full', creatorPerms)) {
          return fail(
            'ADMIN_USER_CREATE_PERMISSION_DENIED',
            `You cannot grant ${level} access to ${domain}.`,
            403,
          )
        }
      }
    }

    const email = body.email.toLowerCase().trim()
    const existingUser = await prisma.user.findUnique({ where: { email } })

    let created: { id: string; name: string; email: string }
    let isUpgraded = false

    if (existingUser) {
      // Check if existing user is a customer — if so, upgrade role instead of failing
      const existingMapping = await prisma.appAuthRoleMapping.findUnique({
        where: { userId: existingUser.id },
      })
      if (existingMapping && existingMapping.role === 'customer') {
        await prisma.appAuthRoleMapping.update({
          where: { userId: existingUser.id },
          data: {
            role: body.role,
            updatedByEmail: session.email,
          },
        })
        created = existingUser
        isUpgraded = true
      } else {
        return fail('ADMIN_USER_CREATE_DUPLICATE_EMAIL', 'A user with this email already exists.', 409)
      }
    } else {
      const hashedPassword = hashBetterAuthPassword(body.password)
      created = await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            id: crypto.randomUUID(),
            name: body.name.trim(),
            email,
            emailVerified: true,
          },
        })
        await tx.account.create({
          data: {
            id: crypto.randomUUID(),
            accountId: user.id,
            providerId: 'credential',
            userId: user.id,
            password: hashedPassword,
          },
        })
        await tx.appAuthRoleMapping.create({
          data: {
            userId: user.id,
            role: body.role,
            updatedByEmail: session.email,
          },
        })
        return user
      })
    }

    const state = await readAdminControlsState()
    state.userOverrides[created.id] = {
      role: body.role,
      status: 'active',
      permissions: { canManageCmsToggles: false, canManageUsers: false, canRunCacheOps: false },
      domainPermissions: body.domainPermissions as Record<string, 'none' | 'read' | 'full'> | undefined,
      updatedAt: new Date().toISOString(),
      updatedBy: { userId: session.userId, email: session.email },
    }
    pushAudit(state, {
      type: 'user',
      targetId: created.id,
      actor: { userId: session.userId, email: session.email },
      changes: {
        action: isUpgraded ? 'upgraded' : 'created',
        name: body.name.trim(),
        email,
        role: body.role,
        status: 'active',
      },
    } as never)
    await writeAdminControlsState(state)

    return ok({
      id: created.id,
      name: created.name,
      email: created.email,
      role: body.role,
      status: 'active',
      upgraded: isUpgraded,
    }, isUpgraded ? 200 : 201)
  } catch (cause) {
    console.error('[ADMIN_USER_CREATE_ERROR]', cause)
    return fail('ADMIN_USER_CREATE_UNEXPECTED', 'Unexpected error while creating user.', 500, {
      scope: 'POST /api/admin/users',
      cause: cause instanceof Error ? cause.message : String(cause),
    })
  }
}
