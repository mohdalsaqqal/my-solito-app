import { fail } from '../../_lib/response'
import {
  AUTH_SESSION_COOKIE,
  jsonOk,
  parseAuthSessionCookie,
} from '../../_lib/auth-session'

export async function GET(request: Request) {
  try {
    const rawCookie = request.headers.get('cookie')
    const cookieValue = rawCookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${AUTH_SESSION_COOKIE}=`))
      ?.split('=')
      .slice(1)
      .join('=')

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
