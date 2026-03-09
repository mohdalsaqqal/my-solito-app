import { authProvider } from '@real/providers'
import { fail } from '../../_lib/response'
import { buildAuthSessionCookieHeader, jsonOk } from '../../_lib/auth-session'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string
      email?: string
      password?: string
    }

    if (!body.email || !body.password || !body.name) {
      return fail('AUTH_REGISTER_INVALID_PAYLOAD', 'name, email, and password are required.', 400)
    }

    const result = await authProvider.register({
      name: body.name,
      email: body.email,
      password: body.password,
    })

    if (!result.ok) {
      return fail(result.error.code, result.error.message, 400)
    }

    return jsonOk(result.data, 201, buildAuthSessionCookieHeader(result.data))
  } catch (cause) {
    return fail('AUTH_REGISTER_UNEXPECTED', 'Unexpected error while creating account.', 500, {
      scope: 'POST /api/auth/register',
      cause,
    })
  }
}
