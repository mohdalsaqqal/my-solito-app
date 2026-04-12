import { fail, ok } from '../../_lib/response'
import { requireTrustedMutationRequest } from '../../_lib/request-auth'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { placeOrder } from '../../../../server/services/orders/place-order.service'

export async function POST(request: Request) {
  try {
    const trustedError = requireTrustedMutationRequest(request)
    if (trustedError) return trustedError

    return ok(await placeOrder(request))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/orders/place',
        cause: cause.cause ?? cause,
      })
    }

    return fail('ORDER_PLACE_UNEXPECTED', 'Unexpected error while placing order.', 500, {
      scope: 'POST /api/orders/place',
      cause,
    })
  }
}
