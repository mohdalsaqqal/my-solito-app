import { authProvider } from '@real/providers'
import { fail } from '../../_lib/response'
import { buildAuthSessionCookieHeader, isAuthSessionConfigValid, jsonOk } from '../../_lib/auth-session'
import { requireTrustedMutationRequest } from '../../_lib/request-auth'
import { authLimiter, buildRateLimitHeaders, buildRateLimitKey } from '../../_lib/rate-limiter'
import { LoginBodySchema } from '../../_lib/validation-schemas'

export async function POST(request: Request) {
  try {
    const trustedError = requireTrustedMutationRequest(request)
    if (trustedError) return trustedError

    if (!isAuthSessionConfigValid()) {
      return fail('AUTH_SESSION_CONFIG_INVALID', 'Authentication session configuration is missing.', 503)
    }

    const rateLimitKey = buildRateLimitKey(request)
    const limitResult = authLimiter.consume(rateLimitKey)
    if (!limitResult.allowed) {
      return fail('AUTH_LOGIN_RATE_LIMITED', 'Too many login attempts. Please try again later.', 429, undefined, buildRateLimitHeaders(limitResult))
    }

    const body = await request.json()
    const parsed = LoginBodySchema.safeParse(body)
    if (!parsed.success) {
      return fail('AUTH_LOGIN_INVALID', parsed.error.issues[0].message, 400)
    }

    const result = await authProvider.login({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (!result.ok) {
      return fail(result.error.code, result.error.message, 401)
    }

    // Reset rate limit on successful login
    authLimiter.reset(rateLimitKey)

    return jsonOk(result.data, 200, buildAuthSessionCookieHeader(result.data))
  } catch (cause) {
    return fail('AUTH_LOGIN_UNEXPECTED', 'Unexpected error while signing in.', 500, {
      scope: 'POST /api/auth/login',
      cause,
    })
  }
}
