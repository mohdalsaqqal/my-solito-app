import { cmsProvider } from '@real/providers'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import {
  applyAdminControlsToCms,
  readAdminControlsState,
  resolveAdminPermissionsForSession,
} from '../../../_lib/admin-controls-store'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing')
    if (session instanceof Response) {
      return session
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
    const toggles = home.identity?.admin?.controlToggles ?? []

    const data = toggles.map((toggle) => ({
      id: toggle.id,
      enabled: toggle.enabled,
      updatedAt: state.toggleOverrides[toggle.id]?.updatedAt ?? null,
      updatedBy: state.toggleOverrides[toggle.id]?.updatedBy ?? null,
    }))

    return ok(data)
  } catch (cause) {
    return fail('ADMIN_CMS_TOGGLES_UNEXPECTED', 'Unexpected error while loading CMS toggles.', 500, {
      scope: 'GET /api/admin/cms/toggles',
      cause,
    })
  }
}
