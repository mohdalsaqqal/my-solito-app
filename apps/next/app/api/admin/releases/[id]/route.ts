import { releaseProvider } from '@real/providers'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../_lib/admin-controls-store'

type PatchPayload = {
  environment?: 'staging' | 'production'
  status?: 'draft' | 'published'
  name?: string
  scheduledAt?: string
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as PatchPayload

    const updated = await releaseProvider.update(id, {
      environment:
        body.environment === 'staging' || body.environment === 'production'
          ? body.environment
          : undefined,
      status: body.status === 'draft' || body.status === 'published' ? body.status : undefined,
      name: typeof body.name === 'string' ? body.name : undefined,
      scheduledAt: typeof body.scheduledAt === 'string' ? body.scheduledAt : undefined,
    })

    if (!updated.ok) {
      const status = updated.error.code === 'RELEASE_NOT_FOUND' ? 404 : 400
      return fail(updated.error.code, updated.error.message, status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'release.update' },
    })
    await writeAdminControlsState(state)

    return ok(updated.data)
  } catch (cause) {
    return fail('ADMIN_RELEASE_PATCH_UNEXPECTED', 'Unexpected error while updating release.', 500, {
      scope: 'PATCH /api/admin/releases/[id]',
      cause,
    })
  }
}

