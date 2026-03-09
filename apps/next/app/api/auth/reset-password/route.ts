import { authProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string
      newPassword?: string
    }

    if (!body.token || !body.newPassword) {
      return fail('AUTH_RESET_PASSWORD_INVALID_PAYLOAD', 'token and newPassword are required.', 400)
    }

    const result = await authProvider.resetPassword({
      token: body.token,
      newPassword: body.newPassword,
    })

    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 400),
    })
  } catch (cause) {
    return fail('AUTH_RESET_PASSWORD_UNEXPECTED', 'Unexpected error while resetting password.', 500, {
      scope: 'POST /api/auth/reset-password',
      cause,
    })
  }
}
