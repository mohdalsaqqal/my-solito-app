import { fail, ok } from '../_lib/response'
import { requireAuthSession } from '../_lib/request-auth'
import { ServiceError } from '../../../server/services/_lib/service-error'
import { listAccessibleOrders } from '../../../server/services/orders/order-access.service'

export async function GET(request: Request) {
  try {
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    return ok(await listAccessibleOrders(session))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/orders',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ORDER_LIST_UNEXPECTED', 'Unexpected error while fetching orders.', 500, {
      scope: 'GET /api/orders',
      cause,
    })
  }
}
