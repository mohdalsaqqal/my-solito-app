import { authProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string
    }

    if (!body.email) {
      return fail('AUTH_REQUEST_RESET_INVALID_PAYLOAD', 'email is required.', 400)
    }

    const result = await authProvider.requestPasswordReset({
      email: body.email,
    })

    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 400),
    })
  } catch (cause) {
    return fail('AUTH_REQUEST_RESET_UNEXPECTED', 'Unexpected error while requesting password reset.', 500, {
      scope: 'POST /api/auth/request-reset',
      cause,
    })
  }
}
