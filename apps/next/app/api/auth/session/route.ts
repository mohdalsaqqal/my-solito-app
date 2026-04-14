import { fail } from '../../_lib/response'
import { jsonOk } from '../../_lib/auth-session'
import { ensureRequestConnection } from '../../_lib/route-connection'
import { resolveAuthSessionFromRequest } from './session-resolver'

export async function GET(request: Request) {
  try {
    await ensureRequestConnection()

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
