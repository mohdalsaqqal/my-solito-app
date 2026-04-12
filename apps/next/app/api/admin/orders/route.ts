import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { listAdminOrders } from '../../../../server/services/admin/admin-orders.service'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'sales')
    if (session instanceof Response) return session

    return ok(await listAdminOrders(request))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/orders',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_ORDERS_LIST_UNEXPECTED', 'Unexpected error while loading admin orders.', 500, {
      scope: 'GET /api/admin/orders',
      cause,
    })
  }
}
