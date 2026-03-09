import { translationProvider } from '@real/providers'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'operations')
    if (session instanceof Response) return session

    const result = await translationProvider.getStatus()
    if (!result.ok) {
      return fail(result.error.code, result.error.message, 500)
    }

    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_I18N_STATUS_UNEXPECTED', 'Unexpected error while loading translation status.', 500, {
      scope: 'GET /api/admin/i18n/status',
      cause,
    })
  }
}
