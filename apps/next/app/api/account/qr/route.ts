import { accountProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }
    const result = await accountProvider.getQr(session.userId)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 400),
    })
  } catch (cause) {
    return fail('ACCOUNT_QR_UNEXPECTED', 'Unexpected error while loading account QR.', 500, {
      scope: 'GET /api/account/qr',
      cause,
    })
  }
}

