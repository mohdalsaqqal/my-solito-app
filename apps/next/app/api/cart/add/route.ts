import { matchProviderResult } from '@real/providers/contracts'
import { cartProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { CartAddBodySchema } from '../../_lib/validation-schemas'
import { runCartRequest } from '../_lib/cart-request'

export async function POST(request: Request) {
  try {
    return runCartRequest(request, async () => {
      const body = await request.json()
      const parsed = CartAddBodySchema.safeParse(body)
      if (!parsed.success) {
        return fail('CART_ADD_INVALID', parsed.error.issues[0].message, 400)
      }

      const result = await cartProvider.add(parsed.data.productId, parsed.data.quantity)
      return matchProviderResult(result, {
        ok: (data) => ok(data),
        fail: (error) => fail(error.code, error.message, 500),
      })
    }, { mutation: true })
  } catch (cause) {
    return fail(
      'CART_ADD_UNEXPECTED',
      'Unexpected error while updating cart.',
      500,
      { scope: 'POST /api/cart/add', cause }
    )
  }
}
