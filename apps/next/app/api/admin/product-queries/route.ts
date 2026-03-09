import { productQueryProvider } from '@real/providers'
import { ProductFilter } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { requireAdminAnyDomainSession } from '../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../_lib/admin-controls-store'

export async function GET(request: Request) {
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'marketing'])
    if (session instanceof Response) return session

    const result = await productQueryProvider.list()
    if (!result.ok) return fail(result.error.code, result.error.message, 500)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_PRODUCT_QUERY_LIST_UNEXPECTED', 'Unexpected error while loading product queries.', 500, {
      scope: 'GET /api/admin/product-queries',
      cause,
    })
  }
}

type CreatePayload = {
  slug?: string
  active?: boolean
  title?: { en?: string; ar?: string }
  filters?: ProductFilter
}

export async function POST(request: Request) {
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'marketing'], 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as CreatePayload
    const slug = (body.slug ?? '').trim().toLowerCase()
    if (!slug) return fail('ADMIN_PRODUCT_QUERY_SLUG_REQUIRED', 'slug is required.', 400)

    const created = await productQueryProvider.create({
      slug,
      active: body.active ?? true,
      title: {
        en: body.title?.en?.trim() || slug,
        ar: body.title?.ar?.trim() || slug,
      },
      filters: body.filters ?? {},
    })
    if (!created.ok) {
      const status = created.error.code === 'PRODUCT_QUERY_EXISTS' ? 409 : 400
      return fail(created.error.code, created.error.message, status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: slug,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'query.create' },
    })
    await writeAdminControlsState(state)

    return ok(created.data, 201)
  } catch (cause) {
    return fail('ADMIN_PRODUCT_QUERY_CREATE_UNEXPECTED', 'Unexpected error while creating product query.', 500, {
      scope: 'POST /api/admin/product-queries',
      cause,
    })
  }
}
