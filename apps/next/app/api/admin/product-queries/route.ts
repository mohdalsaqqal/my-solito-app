import { ProductFilter } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { requireAdminAnyDomainSession } from '../../_lib/request-auth'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { createAdminProductQuery, listAdminProductQueries } from '../../../../server/services/admin/admin-product-queries.service'

export async function GET(request: Request) {
  try {
    const session = await requireAdminAnyDomainSession(request, ['catalog', 'marketing'])
    if (session instanceof Response) return session

    return ok(await listAdminProductQueries())
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/product-queries',
        cause: cause.cause ?? cause,
      })
    }
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
    const session = await requireAdminAnyDomainSession(request, ['catalog', 'marketing'], 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as CreatePayload
    return ok(
      await createAdminProductQuery(body, { userId: session.userId, email: session.email }),
      201,
    )
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/admin/product-queries',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_PRODUCT_QUERY_CREATE_UNEXPECTED', 'Unexpected error while creating product query.', 500, {
      scope: 'POST /api/admin/product-queries',
      cause,
    })
  }
}
