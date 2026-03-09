import { matchProviderResult } from '@real/providers/contracts'
import { cartProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string
      quantity?: number
    }

    if (!body.productId || !body.quantity || body.quantity < 1) {
      return fail('INVALID_CART_PAYLOAD', 'productId and positive quantity are required.', 400)
    }

    const result = await cartProvider.add(body.productId, body.quantity)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail(
      'CART_ADD_UNEXPECTED',
      'Unexpected error while updating cart.',
      500,
      { scope: 'POST /api/cart/add', cause }
    )
  }
}
