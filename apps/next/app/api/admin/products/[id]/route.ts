import { ProductUpsertInput } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { ServiceError } from '../../../../../server/services/_lib/service-error'
import { getAdminProductDetail, updateAdminProduct } from '../../../../../server/services/admin/admin-products.service'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminDomainSession(request, 'catalog')
    if (session instanceof Response) return session

    const { id } = await context.params
    return ok(await getAdminProductDetail(id))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/products/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_PRODUCT_DETAIL_UNEXPECTED', 'Unexpected error while loading product detail.', 500, {
      scope: 'GET /api/admin/products/[id]',
      cause,
    })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Partial<ProductUpsertInput>
    const { id } = await context.params
    return ok(await updateAdminProduct(id, body))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'PATCH /api/admin/products/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_PRODUCT_UPDATE_UNEXPECTED', 'Unexpected error while updating product.', 500, {
      scope: 'PATCH /api/admin/products/[id]',
      cause,
    })
  }
}
