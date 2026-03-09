import { productQueryProvider, releaseProvider } from '@real/providers'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { parseHomeBlock } from '@real/app/lib/cms/blocks'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../_lib/admin-controls-store'

type PatchPayload = {
  position?: number
  type?: 'hero' | 'product_slider' | 'brand_promo' | 'promo_strip'
  payloadJson?: unknown
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as PatchPayload

    if (body.payloadJson !== undefined) {
      const parsed = parseHomeBlock(body.payloadJson)
      if (!parsed) return fail('ADMIN_RELEASE_BLOCK_INVALID', 'Block payload does not match schema.', 400)
      if (body.type && parsed.type !== body.type) {
        return fail('ADMIN_RELEASE_BLOCK_TYPE_MISMATCH', 'Block payload type does not match request type.', 400)
      }
      if (parsed.type === 'product_slider' || (parsed.type === 'brand_promo' && parsed.querySlug)) {
        const querySlug = parsed.type === 'product_slider' ? parsed.querySlug : parsed.querySlug
        if (!querySlug) return fail('ADMIN_RELEASE_QUERY_REQUIRED', 'querySlug is required for product blocks.', 400)
        const query = await productQueryProvider.getBySlug(querySlug)
        if (!query.ok || !query.data.active) {
          return fail('ADMIN_RELEASE_QUERY_INVALID', 'querySlug references missing/inactive query.', 400)
        }
      }
    }

    const updated = await releaseProvider.updateBlock(id, {
      position: typeof body.position === 'number' ? body.position : undefined,
      type: body.type,
      payloadJson: body.payloadJson,
    })
    if (!updated.ok) {
      const status = updated.error.code === 'RELEASE_BLOCK_NOT_FOUND' ? 404 : 400
      return fail(updated.error.code, updated.error.message, status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'release.block.update' },
    })
    await writeAdminControlsState(state)

    return ok(updated.data)
  } catch (cause) {
    return fail('ADMIN_RELEASE_BLOCK_PATCH_UNEXPECTED', 'Unexpected error while updating release block.', 500, {
      scope: 'PATCH /api/admin/release-blocks/[id]',
      cause,
    })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const deleted = await releaseProvider.deleteBlock(id)
    if (!deleted.ok) {
      const status = deleted.error.code === 'RELEASE_BLOCK_NOT_FOUND' ? 404 : 400
      return fail(deleted.error.code, deleted.error.message, status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'release.block.delete' },
    })
    await writeAdminControlsState(state)

    return ok(deleted.data)
  } catch (cause) {
    return fail('ADMIN_RELEASE_BLOCK_DELETE_UNEXPECTED', 'Unexpected error while deleting release block.', 500, {
      scope: 'DELETE /api/admin/release-blocks/[id]',
      cause,
    })
  }
}

