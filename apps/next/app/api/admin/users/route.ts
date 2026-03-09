import { cmsProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { applyAdminControlsToCms, readAdminControlsState } from '../../_lib/admin-controls-store'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'customers')
    if (session instanceof Response) {
      return session
    }

    const cmsResult = await cmsProvider.getHome()
    if (!cmsResult.ok) {
      return fail(cmsResult.error.code, cmsResult.error.message, 500)
    }

    const state = await readAdminControlsState()
    const home = applyAdminControlsToCms(cmsResult.data, state)
    const users = home.identity?.admin?.rolePreview ?? []

    return ok(users)
  } catch (cause) {
    return fail('ADMIN_USERS_UNEXPECTED', 'Unexpected error while loading users.', 500, {
      scope: 'GET /api/admin/users',
      cause,
    })
  }
}
