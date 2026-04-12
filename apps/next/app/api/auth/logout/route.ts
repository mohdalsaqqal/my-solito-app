import { authProvider } from '@real/providers'
import { fail } from '../../_lib/response'
import { clearAuthSessionCookieHeader, jsonOk } from '../../_lib/auth-session'
import { requireTrustedMutationRequest } from '../../_lib/request-auth'

export async function POST(request: Request) {
  try {
    const trustedError = requireTrustedMutationRequest(request)
    if (trustedError) return trustedError

    const result = await authProvider.logout()
    if (!result.ok) {
      return fail(result.error.code, result.error.message, 500)
    }

    return jsonOk(result.data, 200, clearAuthSessionCookieHeader())
  } catch (cause) {
    return fail('AUTH_LOGOUT_UNEXPECTED', 'Unexpected error while signing out.', 500, {
      scope: 'POST /api/auth/logout',
      cause,
    })
  }
}
