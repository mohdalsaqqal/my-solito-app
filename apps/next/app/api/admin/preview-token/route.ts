import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { createPreviewToken } from '../../_lib/preview-token'
import { resolveStoreId } from '../../_lib/release-env'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing')
    if (session instanceof Response) return session

    const releaseId = new URL(request.url).searchParams.get('releaseId')
    if (!releaseId) return fail('PREVIEW_TOKEN_MISSING_RELEASE', 'releaseId is required', 400)

    const storeId = resolveStoreId(request)
    const token = createPreviewToken(releaseId, storeId, 60 * 30) // 30 min TTL
    return ok({ token })
  } catch (cause) {
    return fail('PREVIEW_TOKEN_UNEXPECTED', 'Unexpected error generating preview token.', 500, {
      scope: 'GET /api/admin/preview-token',
      cause,
    })
  }
}
