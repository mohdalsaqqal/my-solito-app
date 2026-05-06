import { matchProviderResult } from '@real/providers/contracts'
import { cartProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { CartRemoveBodySchema } from '../../_lib/validation-schemas'
import { runCartRequest } from '../_lib/cart-request'

export async function POST(request: Request) {
  try {
    return runCartRequest(request, async () => {
      const body = await request.json()
      const parsed = CartRemoveBodySchema.safeParse(body)
      if (!parsed.success) {
        return fail('CART_REMOVE_INVALID', parsed.error.issues[0].message, 400)
      }

      const result = await cartProvider.remove(parsed.data.productId)
      return matchProviderResult(result, {
        ok: (data) => ok(data),
        fail: (error) => fail(error.code, error.message, 500),
      })
    }, { mutation: true })
  } catch (cause) {
    return fail(
      'CART_REMOVE_UNEXPECTED',
      'Unexpected error while removing cart item.',
      500,
      { scope: 'POST /api/cart/remove', cause }
    )
  }
}
