import { accountProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    const result = await accountProvider.getTest(session.userId, id)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 404),
    })
  } catch (cause) {
    return fail('ACCOUNT_TEST_DETAIL_UNEXPECTED', 'Unexpected error while fetching test detail.', 500, {
      scope: 'GET /api/account/tests/[id]',
      cause,
    })
  }
}

