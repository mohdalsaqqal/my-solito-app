import { cmsProvider } from '@real/providers'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import {
  applyAdminControlsToCms,
  pushAudit,
  readAdminControlsState,
  resolveAdminPermissionsForSession,
  writeAdminControlsState,
} from '../../../../_lib/admin-controls-store'

type TogglePayload = {
  enabled?: boolean
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    const payload = ((await request.json().catch(() => ({}))) ?? {}) as TogglePayload
    if (typeof payload.enabled !== 'boolean') {
      return fail('ADMIN_TOGGLE_INVALID', 'enabled must be boolean.', 400)
    }

    const cmsResult = await cmsProvider.getHome()
    if (!cmsResult.ok) {
      return fail(cmsResult.error.code, cmsResult.error.message, 500)
    }

    const state = await readAdminControlsState()
    const home = applyAdminControlsToCms(cmsResult.data, state)
    const permissions = resolveAdminPermissionsForSession(home, { email: session.email })
    if (!permissions.canManageCmsToggles) {
      return fail('AUTH_FORBIDDEN', 'Permission denied: manage CMS toggles.', 403)
    }
    const target = (home.identity?.admin?.controlToggles ?? []).find((item) => item.id === id)
    if (!target) {
      return fail('ADMIN_TOGGLE_NOT_FOUND', 'Toggle not found.', 404)
    }

    const previous = target.enabled
    const now = new Date().toISOString()
    state.toggleOverrides[id] = {
      enabled: payload.enabled,
      updatedAt: now,
      updatedBy: {
        userId: session.userId,
        email: session.email,
      },
    }

    pushAudit(state, {
      type: 'toggle',
      targetId: id,
      actor: {
        userId: session.userId,
        email: session.email,
      },
      changes: {
        previous: previous ? 'enabled' : 'disabled',
        next: payload.enabled ? 'enabled' : 'disabled',
      },
    })

    await writeAdminControlsState(state)

    return ok({
      id,
      enabled: payload.enabled,
      updatedAt: now,
      updatedBy: {
        userId: session.userId,
        email: session.email,
      },
    })
  } catch (cause) {
    return fail('ADMIN_TOGGLE_UPDATE_UNEXPECTED', 'Unexpected error while updating toggle.', 500, {
      scope: 'POST /api/admin/cms/toggles/[id]',
      cause,
    })
  }
}
