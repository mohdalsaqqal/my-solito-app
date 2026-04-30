import { fail } from '../../_lib/response'
import { jsonOk } from '../../_lib/auth-session'
import { ensureRequestConnection } from '../../_lib/route-connection'
import { buildRateLimitHeaders, buildRateLimitKey, sessionReadLimiter } from '../../_lib/rate-limiter'
import { resolveAuthSessionFromRequest } from './session-resolver'

export async function GET(request: Request) {
  try {
    await ensureRequestConnection()

    const limitResult = await sessionReadLimiter.consume(buildRateLimitKey(request))
    if (!limitResult.allowed) {
      return fail(
        'AUTH_SESSION_RATE_LIMITED',
        'Too many session checks. Please try again later.',
        429,
        undefined,
        buildRateLimitHeaders(limitResult),
      )
    }

    const session = await resolveAuthSessionFromRequest(request)
    if (session) {
      return jsonOk(session)
    }

    return jsonOk(null)
  } catch (cause) {
    return fail('AUTH_SESSION_UNEXPECTED', 'Unexpected error while reading session.', 500, {
      scope: 'GET /api/auth/session',
      cause,
    })
  }
}
