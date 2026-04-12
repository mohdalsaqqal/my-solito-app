import { commerceCapabilityProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'dashboard')
    if (session instanceof Response) return session

    const result = await commerceCapabilityProvider.getCapabilities()
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_CAPABILITIES_UNEXPECTED', 'Unexpected error while loading capabilities.', 500, {
      scope: 'GET /api/admin/capabilities',
      cause,
    })
  }
}
