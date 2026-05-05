import { matchProviderResult } from '@real/providers/contracts'
import { cartProvider } from '@real/providers'
import { fail, ok } from '../_lib/response'
import { requireAuthSession } from '../_lib/request-auth'

export async function GET(request: Request) {
  const session = await requireAuthSession(request)
  if (session instanceof Response) return session

  try {
    const result = await cartProvider.get()
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail(
      'CART_GET_UNEXPECTED',
      'Unexpected error while fetching cart.',
      500,
      { scope: 'GET /api/cart', cause }
    )
  }
}
