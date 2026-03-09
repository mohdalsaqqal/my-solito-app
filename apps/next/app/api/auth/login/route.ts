import { authProvider } from '@real/providers'
import { fail } from '../../_lib/response'
import { buildAuthSessionCookieHeader, jsonOk } from '../../_lib/auth-session'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    if (!body.email || !body.password) {
      return fail('AUTH_LOGIN_INVALID_PAYLOAD', 'email and password are required.', 400)
    }

    const result = await authProvider.login({
      email: body.email,
      password: body.password,
    })

    if (!result.ok) {
      return fail(result.error.code, result.error.message, 401)
    }

    return jsonOk(result.data, 200, buildAuthSessionCookieHeader(result.data))
  } catch (cause) {
    return fail('AUTH_LOGIN_UNEXPECTED', 'Unexpected error while signing in.', 500, {
      scope: 'POST /api/auth/login',
      cause,
    })
  }
}
