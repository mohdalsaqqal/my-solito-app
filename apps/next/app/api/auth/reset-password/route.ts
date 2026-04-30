import { fail, ok } from '../../_lib/response'
import { passwordResetLimiter, buildRateLimitHeaders, buildRateLimitKey } from '../../_lib/rate-limiter'
import { ResetPasswordBodySchema } from '../../_lib/validation-schemas'
import { requireTrustedMutationRequest } from '../../_lib/request-auth'
import { auth } from '../../../../lib/auth'
import { isBetterAuthConfigValid } from '../../_lib/security-policy'

export async function POST(request: Request) {
  try {
    const trustedError = requireTrustedMutationRequest(request)
    if (trustedError) return trustedError

    if (!isBetterAuthConfigValid()) {
      return fail('AUTH_SESSION_CONFIG_INVALID', 'Authentication session configuration is missing.', 503)
    }

    const rateLimitKey = buildRateLimitKey(request)
    const limitResult = await passwordResetLimiter.consume(rateLimitKey)
    if (!limitResult.allowed) {
      return fail('AUTH_RESET_PASSWORD_RATE_LIMITED', 'Too many reset requests. Please try again later.', 429, undefined, buildRateLimitHeaders(limitResult))
    }

    const body = await request.json()
    const parsed = ResetPasswordBodySchema.safeParse(body)
    if (!parsed.success) {
      return fail('AUTH_RESET_PASSWORD_INVALID', parsed.error.issues[0].message, 400)
    }

    const result = await auth.api.resetPassword({
      asResponse: true,
      headers: request.headers,
      body: {
        token: parsed.data.token,
        newPassword: parsed.data.newPassword,
      },
    })

    if (!result.ok) {
      return fail('AUTH_RESET_PASSWORD_FAILED', 'Unable to reset password.', 400)
    }

    return ok({ accepted: true })
  } catch (cause) {
    return fail('AUTH_RESET_PASSWORD_UNEXPECTED', 'Unexpected error while resetting password.', 500, {
      scope: 'POST /api/auth/reset-password',
      cause,
    })
  }
}
