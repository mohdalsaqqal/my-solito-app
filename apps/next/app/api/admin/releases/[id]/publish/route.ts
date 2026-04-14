import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../../_lib/admin-controls-store'
import { resolveStoreId } from '../../../../_lib/release-env'
import { publishRelease } from '../../../../../../server/services/cms/cms-publish.service'

// Release publishing delegates snapshot creation to the CMS service, which
// persists a page-version-store snapshot via createPageVersionSnapshot.

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session
    const published = await publishRelease(id, { storeId: resolveStoreId(request) })
    if (!published.ok) {
      const status = published.error === 'RELEASE_NOT_FOUND' ? 404 : 400
      return fail(published.error ?? 'PUBLISH_FAILED', 'Unable to publish release.', status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'release.publish', environment: published.environment ?? 'staging' },
    })
    await writeAdminControlsState(state)

    return ok({
      ...(published.release ?? {
        id: published.releaseId ?? id,
        name: undefined,
        environment: published.environment ?? 'staging',
        status: 'published',
        scheduledAt: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      pageVersionId: published.pageVersionId,
    })
  } catch (cause) {
    return fail('ADMIN_RELEASE_PUBLISH_UNEXPECTED', 'Unexpected error while publishing release.', 500, {
      scope: 'POST /api/admin/releases/[id]/publish',
      cause,
    })
  }
}
