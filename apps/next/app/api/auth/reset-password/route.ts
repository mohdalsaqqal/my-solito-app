import { authProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { passwordResetLimiter, buildRateLimitHeaders, buildRateLimitKey } from '../../_lib/rate-limiter'
import { ResetPasswordBodySchema } from '../../_lib/validation-schemas'

export async function POST(request: Request) {
  try {
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

    const result = await authProvider.resetPassword({
      token: parsed.data.token,
      newPassword: parsed.data.newPassword,
    })

    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 400),
    })
  } catch (cause) {
    return fail('AUTH_RESET_PASSWORD_UNEXPECTED', 'Unexpected error while resetting password.', 500, {
      scope: 'POST /api/auth/reset-password',
      cause,
    })
  }
}
