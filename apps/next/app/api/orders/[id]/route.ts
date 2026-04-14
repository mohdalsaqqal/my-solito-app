import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { getAccessibleOrder } from '../../../../server/services/orders/order-access.service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const { id } = await params

    return ok(await getAccessibleOrder(session, id))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/orders/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ORDER_GET_UNEXPECTED', 'Unexpected error while fetching order.', 500, {
      scope: 'GET /api/orders/[id]',
      cause,
    })
  }
}
