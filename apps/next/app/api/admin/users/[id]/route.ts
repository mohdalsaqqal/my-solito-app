import { AdminDomainPermissionSet, AdminPermissionSet, AuthRole, CMSHome } from '@real/app/lib/types'
import { cmsProvider } from '@real/providers'
import { prisma } from '../../../../../server/lib/prisma'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { AdminDomain, hasAdminDomainPermission, isAdminPanelRole } from '../../../_lib/admin-rbac'
import {
  applyAdminControlsToCms,
  pushAudit,
  readAdminControlsState,
  writeAdminControlsState,
} from '../../../_lib/admin-controls-store'
type UserPayload = {
  role?: AuthRole
  status?: 'active' | 'invited' | 'disabled'
  permissions?: Partial<AdminPermissionSet>
  domainPermissions?: Partial<AdminDomainPermissionSet>
}

function hasRole(value: unknown): value is AuthRole {
  return (
    value === 'customer' ||
    value === 'pharmacist' ||
    value === 'admin' ||
    value === 'marketing' ||
    value === 'catalog' ||
    value === 'support' ||
    value === 'ops'
  )
}

function hasStatus(value: unknown): value is 'active' | 'invited' | 'disabled' {
  return value === 'active' || value === 'invited' || value === 'disabled'
}

function findUser(home: CMSHome, id: string) {
  return (home.identity?.admin?.rolePreview ?? []).find((item) => item.id === id)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminDomainSession(request, 'customers', 'full')
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    const payload = ((await request.json().catch(() => ({}))) ?? {}) as UserPayload

    const hasRoleInput = payload.role !== undefined
    const hasStatusInput = payload.status !== undefined

    const hasPermissionsInput = payload.permissions !== undefined
    const hasDomainPermissionsInput = payload.domainPermissions !== undefined

    if (!hasRoleInput && !hasStatusInput && !hasPermissionsInput && !hasDomainPermissionsInput) {
      return fail('ADMIN_USER_UPDATE_EMPTY', 'Provide role, status, permissions, or domainPermissions to update.', 400)
    }

    if (hasRoleInput && !hasRole(payload.role)) {
      return fail('ADMIN_USER_ROLE_INVALID', 'Invalid user role.', 400)
    }

    if (hasStatusInput && !hasStatus(payload.status)) {
      return fail('ADMIN_USER_STATUS_INVALID', 'Invalid user status.', 400)
    }

    if (hasPermissionsInput && typeof payload.permissions !== 'object') {
      return fail('ADMIN_USER_PERMISSIONS_INVALID', 'Invalid permissions payload.', 400)
    }

    if (hasPermissionsInput) {
      const raw = payload.permissions as Record<string, unknown>
      const keys = ['canManageCmsToggles', 'canManageUsers', 'canRunCacheOps'] as const
      for (const key of keys) {
        if (raw[key] !== undefined && typeof raw[key] !== 'boolean') {
          return fail('ADMIN_USER_PERMISSIONS_INVALID', `Permission ${key} must be boolean.`, 400)
        }
      }
    }

    const cmsResult = await cmsProvider.getHome()
    if (!cmsResult.ok) {
      return fail(cmsResult.error.code, cmsResult.error.message, 500)
    }

    const state = await readAdminControlsState()
    const home = applyAdminControlsToCms(cmsResult.data, state)
    let user = findUser(home, id)
    let isDbUser = false

    if (!user) {
      const dbUser = await prisma.user.findUnique({ where: { id } })
      if (dbUser) {
        const dbRoleMapping = await prisma.appAuthRoleMapping.findUnique({ where: { userId: id } })
        const existingOverride = state.userOverrides[id]
        user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: existingOverride?.role ?? dbRoleMapping?.role ?? 'customer',
          status: existingOverride?.status ?? 'active',
          permissions: existingOverride?.permissions ?? {
            canManageCmsToggles: false,
            canManageUsers: false,
            canRunCacheOps: false,
          },
          lastActiveAt: undefined,
        }
        isDbUser = true
      }
    }

    if (!user) {
      return fail('ADMIN_USER_NOT_FOUND', 'Admin user record not found.', 404)
    }

    const nextRole = payload.role ?? user.role
    const nextStatus = payload.status ?? user.status
    const nextPermissions = {
      canManageCmsToggles: payload.permissions?.canManageCmsToggles ?? user.permissions?.canManageCmsToggles ?? false,
      canManageUsers: payload.permissions?.canManageUsers ?? user.permissions?.canManageUsers ?? false,
      canRunCacheOps: payload.permissions?.canRunCacheOps ?? user.permissions?.canRunCacheOps ?? false,
    }

    const isSelfTarget = user.email.toLowerCase() === session.email.toLowerCase()
    if (isSelfTarget && !isAdminPanelRole(nextRole)) {
      return fail('ADMIN_SELF_ROLE_LOCKOUT', 'You cannot remove your own admin-panel role.', 409)
    }
    if (isSelfTarget && !nextPermissions.canManageUsers) {
      return fail('ADMIN_SELF_PERMISSION_LOCKOUT', 'You cannot remove your own user-management permission.', 409)
    }

    const existingOverride = state.userOverrides[id]
    const nextDomainPermissions =
      (hasDomainPermissionsInput
        ? payload.domainPermissions
        : existingOverride?.domainPermissions) as Record<string, 'none' | 'read' | 'full'> | undefined

    // Prevent privilege escalation: creator can only grant permissions they hold
    if (hasDomainPermissionsInput && payload.domainPermissions) {
      const creatorPerms = existingOverride?.domainPermissions
      for (const [domain, level] of Object.entries(payload.domainPermissions)) {
        if (!hasAdminDomainPermission(session.role, domain as AdminDomain, level as 'read' | 'full', creatorPerms)) {
          return fail(
            'ADMIN_USER_UPDATE_PERMISSION_DENIED',
            `You cannot grant ${level} access to ${domain}.`,
            403,
          )
        }
      }
    }

    state.userOverrides[id] = {
      role: nextRole,
      status: nextStatus,
      permissions: nextPermissions,
      domainPermissions: nextDomainPermissions,
      updatedAt: new Date().toISOString(),
      updatedBy: {
        userId: session.userId,
        email: session.email,
      },
    }

    pushAudit(state, {
      type: 'user',
      targetId: id,
      actor: {
        userId: session.userId,
        email: session.email,
      },
      changes: {
        previousRole: user.role,
        nextRole,
        previousStatus: user.status,
        nextStatus,
        previousCanManageCmsToggles: String(user.permissions?.canManageCmsToggles ?? false),
        nextCanManageCmsToggles: String(nextPermissions.canManageCmsToggles),
        previousCanManageUsers: String(user.permissions?.canManageUsers ?? false),
        nextCanManageUsers: String(nextPermissions.canManageUsers),
        previousCanRunCacheOps: String(user.permissions?.canRunCacheOps ?? false),
        nextCanRunCacheOps: String(nextPermissions.canRunCacheOps),
      },
    })

    await writeAdminControlsState(state)

    return ok({
      id: user.id,
      name: user.name,
      email: user.email,
      role: nextRole,
      status: nextStatus,
      lastActiveAt: user.lastActiveAt,
      permissions: nextPermissions,
    })
  } catch (cause) {
    return fail('ADMIN_USER_UPDATE_UNEXPECTED', 'Unexpected error while updating user.', 500, {
      scope: 'POST /api/admin/users/[id]',
      cause,
    })
  }
}
