import { accountProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const result = await accountProvider.listWishlist(session.userId)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail('ACCOUNT_WISHLIST_UNEXPECTED', 'Unexpected error while fetching wishlist.', 500, {
      scope: 'GET /api/account/wishlist',
      cause,
    })
  }
}

