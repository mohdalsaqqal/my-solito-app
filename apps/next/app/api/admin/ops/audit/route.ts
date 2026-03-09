import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { readAdminControlsState } from '../../../_lib/admin-controls-store'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'operations')
    if (session instanceof Response) {
      return session
    }

    const state = await readAdminControlsState()
    const url = new URL(request.url)
    const actor = url.searchParams.get('actor')?.trim().toLowerCase()
    const type = url.searchParams.get('type')?.trim().toLowerCase()
    const filtered = state.audits.filter((entry) => {
      if (actor && entry.actor.email.toLowerCase() !== actor && entry.actor.userId.toLowerCase() !== actor) {
        return false
      }
      if (type && entry.type.toLowerCase() !== type) {
        return false
      }
      return true
    })
    return ok(filtered)
  } catch (cause) {
    return fail('ADMIN_OPS_AUDIT_UNEXPECTED', 'Unexpected error while loading operations audit.', 500, {
      scope: 'GET /api/admin/ops/audit',
      cause,
    })
  }
}
