import { productQueryProvider, releaseProvider } from '@real/providers'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { validateReleasePublishReadiness } from '@real/app/lib/cms/release-publish-readiness'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../../_lib/admin-controls-store'
import { createPageVersionSnapshot } from '../../../../_lib/page-version-store'
import { resolveStoreId } from '../../../../_lib/release-env'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const releaseResult = await releaseProvider.getById(id)
    if (!releaseResult.ok) return fail(releaseResult.error.code, releaseResult.error.message, 404)

    const blocksResult = await releaseProvider.listBlocks(id)
    if (!blocksResult.ok) return fail(blocksResult.error.code, blocksResult.error.message, 400)

    const queriesResult = await productQueryProvider.list()
    if (!queriesResult.ok) return fail(queriesResult.error.code, queriesResult.error.message, 500)

    const readiness = validateReleasePublishReadiness({
      blocks: blocksResult.data,
      activeQuerySlugs: queriesResult.data.filter((query) => query.active).map((query) => query.slug),
    })
    if (!readiness.ok) {
      const firstIssue = readiness.issues[0]
      return fail(firstIssue.code, firstIssue.message, 400)
    }

    const published = await releaseProvider.publish(id)
    if (!published.ok) return fail(published.error.code, published.error.message, 400)

    const pageVersion = await createPageVersionSnapshot({
      releaseId: id,
      storeId: resolveStoreId(request),
      source: 'publish',
      blocks: blocksResult.data,
    })

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'release.publish', environment: published.data.environment },
    })
    await writeAdminControlsState(state)

    return ok({ ...published.data, pageVersionId: pageVersion.id })
  } catch (cause) {
    return fail('ADMIN_RELEASE_PUBLISH_UNEXPECTED', 'Unexpected error while publishing release.', 500, {
      scope: 'POST /api/admin/releases/[id]/publish',
      cause,
    })
  }
}
