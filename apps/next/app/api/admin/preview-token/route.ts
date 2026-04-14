import { ensureRequestConnection } from '../../_lib/route-connection'
import { releaseProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { createPreviewToken } from '../../_lib/preview-token'
import { resolveStoreId } from '../../_lib/release-env'
import { createPageVersionSnapshot } from '../../_lib/page-version-store'
import { getPageConfigByReleaseId } from '../../_lib/page-config-store'

export async function GET(request: Request) {
  try {
    await ensureRequestConnection()
    const session = await requireAdminDomainSession(request, 'marketing')
    if (session instanceof Response) return session

    const releaseId = new URL(request.url).searchParams.get('releaseId')
    if (!releaseId) return fail('PREVIEW_TOKEN_MISSING_RELEASE', 'releaseId is required', 400)

    const storeId = resolveStoreId(request)
    const draftPage = await getPageConfigByReleaseId(releaseId)
    const release = await releaseProvider.getById(releaseId)
    if (!release.ok) return fail(release.error.code, release.error.message, 404)
    if (draftPage && draftPage.storeId !== storeId) {
      return fail('PREVIEW_TOKEN_STORE_MISMATCH', 'releaseId is linked to a different store draft.', 400)
    }

    const blocks = await releaseProvider.listBlocks(releaseId)
    if (!blocks.ok) return fail(blocks.error.code, blocks.error.message, 400)

    const pageVersion = await createPageVersionSnapshot({
      releaseId,
      storeId,
      source: 'preview',
      blocks: blocks.data,
    })

    const token = createPreviewToken(releaseId, storeId, 60 * 30, pageVersion.id) // 30 min TTL
    return ok({ token, versionId: pageVersion.id })
  } catch (cause) {
    return fail('PREVIEW_TOKEN_UNEXPECTED', 'Unexpected error generating preview token.', 500, {
      scope: 'GET /api/admin/preview-token',
      cause,
    })
  }
}
