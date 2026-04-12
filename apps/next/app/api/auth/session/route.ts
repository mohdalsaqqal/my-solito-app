import { fail } from '../../_lib/response'
import {
  jsonOk,
  parseAuthSessionCookie,
  readAuthSessionCookieValue,
} from '../../_lib/auth-session'

export async function GET(request: Request) {
  try {
    const cookieValue = readAuthSessionCookieValue(request.headers.get('cookie'))

    const cookieSession = parseAuthSessionCookie(cookieValue)
    if (cookieSession) {
      return jsonOk(cookieSession)
    }

    // Session source of truth is the signed cookie only.
    // Avoid adapter-level fallback to prevent stale process-level role leakage.
    return jsonOk(null)
  } catch (cause) {
    return fail('AUTH_SESSION_UNEXPECTED', 'Unexpected error while reading session.', 500, {
      scope: 'GET /api/auth/session',
      cause,
    })
  }
}
