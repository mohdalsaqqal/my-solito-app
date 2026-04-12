import { ProductFilter } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAdminAnyDomainSession } from '../../../_lib/request-auth'
import { ServiceError } from '../../../../../server/services/_lib/service-error'
import {
  deleteAdminProductQuery,
  getAdminProductQuery,
  updateAdminProductQuery,
} from '../../../../../server/services/admin/admin-product-queries.service'

type PatchPayload = {
  active?: boolean
  title?: { en?: string; ar?: string }
  filters?: ProductFilter
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'marketing'])
    if (session instanceof Response) return session

    return ok(await getAdminProductQuery(slug))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/product-queries/[slug]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_PRODUCT_QUERY_GET_UNEXPECTED', 'Unexpected error while loading product query.', 500, {
      scope: 'GET /api/admin/product-queries/[slug]',
      cause,
    })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'marketing'], 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as PatchPayload
    return ok(
      await updateAdminProductQuery(slug, body, { userId: session.userId, email: session.email }),
    )
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'PATCH /api/admin/product-queries/[slug]',
        cause: cause.cause ?? cause,
      })
    }
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

    return ok(
      await deleteAdminProductQuery(slug, { userId: session.userId, email: session.email }),
    )
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'DELETE /api/admin/product-queries/[slug]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_PRODUCT_QUERY_DELETE_UNEXPECTED', 'Unexpected error while deleting product query.', 500, {
      scope: 'DELETE /api/admin/product-queries/[slug]',
      cause,
    })
  }
}
