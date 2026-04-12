import { fail, ok } from '../../_lib/response'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { createCheckoutQuote } from '../../../../server/services/checkout/checkout-quote.service'

export async function POST(request: Request) {
  try {
    return ok(await createCheckoutQuote(request))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/checkout/quote',
        cause: cause.cause ?? cause,
      })
    }

    return fail('CHECKOUT_QUOTE_UNEXPECTED', 'Unexpected error while creating checkout quote.', 500, {
      scope: 'POST /api/checkout/quote',
      cause,
    })
  }
}
