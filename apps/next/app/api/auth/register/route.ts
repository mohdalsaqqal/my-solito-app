import { fail } from '../../_lib/response'
import { jsonOk } from '../../_lib/auth-session'
import { requireTrustedMutationRequest } from '../../_lib/request-auth'
import { registrationLimiter, buildRateLimitHeaders, buildRateLimitKey } from '../../_lib/rate-limiter'
import { RegisterBodySchema } from '../../_lib/validation-schemas'
import { auth } from '../../../../lib/auth'
import {
  buildCookieHeaderFromBetterAuthSetCookie,
  isBetterAuthIdentityAllowed,
  resolveBetterAuthIdentity,
  resolveNormalizedSessionFromHeaders,
} from '../../../../server/services/auth'
import { isBetterAuthConfigValid } from '../../_lib/security-policy'

function buildExpiredSessionCookie(setCookie: string | null) {
  if (!setCookie) return undefined
  const [cookiePair] = setCookie.split(';', 1)
  const [cookieName] = cookiePair.split('=', 1)
  if (!cookieName) return undefined
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export async function POST(request: Request) {
  try {
    const trustedError = requireTrustedMutationRequest(request)
    if (trustedError) return trustedError

    if (!isBetterAuthConfigValid()) {
      return fail('AUTH_SESSION_CONFIG_INVALID', 'Authentication session configuration is missing.', 503)
    }

    const rateLimitKey = buildRateLimitKey(request)
    const limitResult = await registrationLimiter.consume(rateLimitKey)
    if (!limitResult.allowed) {
      return fail('AUTH_REGISTER_RATE_LIMITED', 'Too many registration attempts. Please try again later.', 429, undefined, buildRateLimitHeaders(limitResult))
    }

    const body = await request.json()
    const parsed = RegisterBodySchema.safeParse(body)
    if (!parsed.success) {
      return fail('AUTH_REGISTER_INVALID', parsed.error.issues[0].message, 400)
    }

    const result = await auth.api.signUpEmail({
      asResponse: true,
      headers: request.headers,
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
    })

    if (!result.ok) {
      return fail('AUTH_REGISTER_FAILED', 'Unable to create account.', 400)
    }

    const setCookie = result.headers.get('set-cookie')
    const authHeaders = await buildCookieHeaderFromBetterAuthSetCookie(setCookie, request.headers)
    const identity = await resolveBetterAuthIdentity(authHeaders)
    if (identity && !isBetterAuthIdentityAllowed(identity.user)) {
      const clearCookie = buildExpiredSessionCookie(setCookie)
      return fail(
        'AUTH_EMAIL_VERIFICATION_REQUIRED',
        'Verify your email address before accessing your account.',
        403,
        undefined,
        clearCookie ? { 'Set-Cookie': clearCookie } : undefined,
      )
    }
    const session = await resolveNormalizedSessionFromHeaders(authHeaders)

    if (!session) {
      return fail('AUTH_REGISTER_SESSION_UNAVAILABLE', 'Account created, but failed to resolve the authenticated session.', 500)
    }

    return jsonOk(session, 201, setCookie ?? undefined)
  } catch (cause) {
    return fail('AUTH_REGISTER_UNEXPECTED', 'Unexpected error while creating account.', 500, {
      scope: 'POST /api/auth/register',
      cause,
    })
  }
}
