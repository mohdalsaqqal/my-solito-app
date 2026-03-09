import { productQueryProvider, releaseProvider } from '@real/providers'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { parseHomeBlock } from '@real/app/lib/cms/blocks'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../../_lib/admin-controls-store'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const releaseResult = await releaseProvider.getById(id)
    if (!releaseResult.ok) return fail(releaseResult.error.code, releaseResult.error.message, 404)

    const blocksResult = await releaseProvider.listBlocks(id)
    if (!blocksResult.ok) return fail(blocksResult.error.code, blocksResult.error.message, 400)

    for (const block of blocksResult.data) {
      const parsed = parseHomeBlock(block.payloadJson)
      if (!parsed) {
        return fail('ADMIN_RELEASE_BLOCK_INVALID', `Block ${block.id} payload is invalid.`, 400)
      }
      if (parsed.type === 'product_slider' || (parsed.type === 'brand_promo' && parsed.querySlug)) {
        const querySlug = parsed.type === 'product_slider' ? parsed.querySlug : parsed.querySlug
        if (!querySlug) return fail('ADMIN_RELEASE_QUERY_REQUIRED', `Block ${block.id} requires querySlug.`, 400)
        const query = await productQueryProvider.getBySlug(querySlug)
        if (!query.ok || !query.data.active) {
          return fail('ADMIN_RELEASE_QUERY_INVALID', `Block ${block.id} references missing/inactive query.`, 400)
        }
      }
    }

    const published = await releaseProvider.publish(id)
    if (!published.ok) return fail(published.error.code, published.error.message, 400)

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'release.publish', environment: published.data.environment },
    })
    await writeAdminControlsState(state)

    return ok(published.data)
  } catch (cause) {
    return fail('ADMIN_RELEASE_PUBLISH_UNEXPECTED', 'Unexpected error while publishing release.', 500, {
      scope: 'POST /api/admin/releases/[id]/publish',
      cause,
    })
  }
}

