import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { listAdminProducts } from '../../../../server/services/admin/admin-products.service'

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'catalog')
    if (session instanceof Response) return session

    return ok(await listAdminProducts(request))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/products',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_PRODUCTS_LIST_UNEXPECTED', 'Unexpected error while loading admin products.', 500, {
      scope: 'GET /api/admin/products',
      cause,
    })
  }
}
