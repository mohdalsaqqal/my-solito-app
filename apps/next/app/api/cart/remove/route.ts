import { matchProviderResult } from '@real/providers/contracts'
import { cartProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string
    }

    if (!body.productId) {
      return fail('INVALID_CART_REMOVE_PAYLOAD', 'productId is required.', 400)
    }

    const result = await cartProvider.remove(body.productId)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail(
      'CART_REMOVE_UNEXPECTED',
      'Unexpected error while removing cart item.',
      500,
      { scope: 'POST /api/cart/remove', cause }
    )
  }
}
