import { fail, ok } from '../../_lib/response'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { createCheckoutQuote } from '../../../../server/services/checkout/checkout-quote.service'
import { requireTrustedMutationRequest } from '../../_lib/request-auth'
import { buildRateLimitHeaders, buildRateLimitKey, checkoutQuoteLimiter } from '../../_lib/rate-limiter'

export async function POST(request: Request) {
  try {
    const trustedError = requireTrustedMutationRequest(request)
    if (trustedError) return trustedError

    const limitResult = await checkoutQuoteLimiter.consume(buildRateLimitKey(request))
    if (!limitResult.allowed) {
      return fail(
        'CHECKOUT_QUOTE_RATE_LIMITED',
        'Too many checkout quote requests. Please try again later.',
        429,
        undefined,
        buildRateLimitHeaders(limitResult),
      )
    }

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
