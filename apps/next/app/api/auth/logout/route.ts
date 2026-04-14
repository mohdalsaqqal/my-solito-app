import { fail } from '../../_lib/response'
import { clearAuthSessionCookieHeader } from '../../_lib/auth-session'
import { requireTrustedMutationRequest } from '../../_lib/request-auth'
import { auth } from '../../../../lib/auth'

export async function POST(request: Request) {
  try {
    const trustedError = requireTrustedMutationRequest(request)
    if (trustedError) return trustedError

    const result = await auth.api.signOut({
      asResponse: true,
      headers: request.headers,
    })

    if (!result.ok) {
      return fail('AUTH_LOGOUT_FAILED', 'Unable to sign out.', 500)
    }

    const headers = new Headers()
    const betterAuthSetCookie = result.headers.get('set-cookie')
    if (betterAuthSetCookie) {
      headers.append('Set-Cookie', betterAuthSetCookie)
    }
    headers.append('Set-Cookie', clearAuthSessionCookieHeader())

    return Response.json(
      {
        success: true,
        data: { accepted: true },
      },
      {
        status: 200,
        headers,
      },
    )
  } catch (cause) {
    return fail('AUTH_LOGOUT_UNEXPECTED', 'Unexpected error while signing out.', 500, {
      scope: 'POST /api/auth/logout',
      cause,
    })
  }
}
