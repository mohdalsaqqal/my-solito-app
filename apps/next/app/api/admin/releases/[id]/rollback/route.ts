import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../../_lib/admin-controls-store'
import { resolveStoreId } from '../../../../_lib/release-env'
import { rollbackRelease } from '../../../../../../server/services/cms/cms-rollback.service'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const rollback = await rollbackRelease(id, { storeId: resolveStoreId(request) })
    if (!rollback.ok) {
      const status = rollback.error === 'TARGET_RELEASE_NOT_FOUND' ? 404 : 400
      return fail(rollback.error ?? 'ROLLBACK_FAILED', 'Unable to roll back release.', status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'release.rollback', environment: rollback.environment ?? 'staging' },
    })
    await writeAdminControlsState(state)

    return ok({
      rolledBackToReleaseId: rollback.rolledBackToReleaseId ?? id,
      environment: rollback.environment ?? 'staging',
      pageVersionId: rollback.pageVersionId,
    })
  } catch (cause) {
    return fail('ADMIN_RELEASE_ROLLBACK_UNEXPECTED', 'Unexpected error while rolling back release.', 500, {
      scope: 'POST /api/admin/releases/[id]/rollback',
      cause,
    })
  }
}
