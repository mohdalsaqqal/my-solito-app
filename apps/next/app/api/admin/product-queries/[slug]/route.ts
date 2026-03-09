import { productQueryProvider } from '@real/providers'
import { ProductFilter } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAdminAnyDomainSession } from '../../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../_lib/admin-controls-store'

type PatchPayload = {
  active?: boolean
  title?: { en?: string; ar?: string }
  filters?: ProductFilter
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'marketing'], 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as PatchPayload
    const updated = await productQueryProvider.update(slug, {
      active: typeof body.active === 'boolean' ? body.active : undefined,
      title: body.title?.en || body.title?.ar ? {
        en: body.title?.en?.trim() || '',
        ar: body.title?.ar?.trim() || '',
      } : undefined,
      filters: body.filters,
    })
    if (!updated.ok) {
      const status = updated.error.code === 'PRODUCT_QUERY_NOT_FOUND' ? 404 : 400
      return fail(updated.error.code, updated.error.message, status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: slug,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'query.update' },
    })
    await writeAdminControlsState(state)

    return ok(updated.data)
  } catch (cause) {
    return fail('ADMIN_PRODUCT_QUERY_PATCH_UNEXPECTED', 'Unexpected error while updating product query.', 500, {
      scope: 'PATCH /api/admin/product-queries/[slug]',
      cause,
    })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'marketing'], 'full')
    if (session instanceof Response) return session

    const deleted = await productQueryProvider.delete(slug)
    if (!deleted.ok) {
      const status = deleted.error.code === 'PRODUCT_QUERY_NOT_FOUND' ? 404 : 400
      return fail(deleted.error.code, deleted.error.message, status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: slug,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'query.delete' },
    })
    await writeAdminControlsState(state)

    return ok(deleted.data)
  } catch (cause) {
    return fail('ADMIN_PRODUCT_QUERY_DELETE_UNEXPECTED', 'Unexpected error while deleting product query.', 500, {
      scope: 'DELETE /api/admin/product-queries/[slug]',
      cause,
    })
  }
}
