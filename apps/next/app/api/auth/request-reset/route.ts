import { fail, ok } from '../../_lib/response'
import { passwordResetLimiter, buildRateLimitHeaders, buildRateLimitKey } from '../../_lib/rate-limiter'
import { RequestResetBodySchema } from '../../_lib/validation-schemas'
import { requireTrustedMutationRequest } from '../../_lib/request-auth'
import { auth } from '../../../../lib/auth'
import {
  getBetterAuthPasswordResetRedirectUrl,
  isBetterAuthConfigValid,
  isBetterAuthPasswordResetDeliveryEnabled,
} from '../../_lib/security-policy'

export async function POST(request: Request) {
  try {
    const trustedError = requireTrustedMutationRequest(request)
    if (trustedError) return trustedError

    if (!isBetterAuthConfigValid()) {
      return fail('AUTH_SESSION_CONFIG_INVALID', 'Authentication session configuration is missing.', 503)
    }

    if (!isBetterAuthPasswordResetDeliveryEnabled()) {
      return fail(
        'AUTH_RESET_DELIVERY_UNAVAILABLE',
        'Password reset delivery is not configured.',
        503,
      )
    }

    const rateLimitKey = buildRateLimitKey(request)
    const limitResult = await passwordResetLimiter.consume(rateLimitKey)
    if (!limitResult.allowed) {
      return fail('AUTH_REQUEST_RESET_RATE_LIMITED', 'Too many reset requests. Please try again later.', 429, undefined, buildRateLimitHeaders(limitResult))
    }

    const body = await request.json()
    const parsed = RequestResetBodySchema.safeParse(body)
    if (!parsed.success) {
      return fail('AUTH_REQUEST_RESET_INVALID', parsed.error.issues[0].message, 400)
    }

    const result = await auth.api.requestPasswordReset({
      asResponse: true,
      headers: request.headers,
      body: {
        email: parsed.data.email,
        redirectTo: getBetterAuthPasswordResetRedirectUrl(),
      },
    })

    if (!result.ok) {
      return fail('AUTH_REQUEST_RESET_FAILED', 'Unable to request password reset.', 400)
    }

    return ok({ accepted: true })
  } catch (cause) {
    return fail('AUTH_REQUEST_RESET_UNEXPECTED', 'Unexpected error while requesting password reset.', 500, {
      scope: 'POST /api/auth/request-reset',
      cause,
    })
  }
}
