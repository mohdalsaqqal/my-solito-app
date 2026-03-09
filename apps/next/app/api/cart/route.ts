import { matchProviderResult } from '@real/providers/contracts'
import { cartProvider } from '@real/providers'
import { fail, ok } from '../_lib/response'

export async function GET() {
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
