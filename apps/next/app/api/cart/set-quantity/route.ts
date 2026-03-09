import { cartProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: string
      quantity?: number
    }

    if (!body.productId || typeof body.quantity !== 'number' || body.quantity < 0) {
      return fail('INVALID_CART_SET_QUANTITY_PAYLOAD', 'productId and non-negative quantity are required.', 400)
    }

    const current = await cartProvider.get()
    if (!current.ok) {
      return fail(current.error.code, current.error.message, 500)
    }

    const existing = current.data.items.find((item) => item.productId === body.productId)
    if (existing) {
      const removed = await cartProvider.remove(body.productId)
      if (!removed.ok) {
        return fail(removed.error.code, removed.error.message, 500)
      }
      if (body.quantity === 0) {
        return ok(removed.data)
      }
    } else if (body.quantity === 0) {
      return ok(current.data)
    }

    const added = await cartProvider.add(body.productId, body.quantity)
    if (!added.ok) {
      return fail(added.error.code, added.error.message, 500)
    }

    return ok(added.data)
  } catch (cause) {
    return fail(
      'CART_SET_QUANTITY_UNEXPECTED',
      'Unexpected error while setting cart quantity.',
      500,
      { scope: 'POST /api/cart/set-quantity', cause }
    )
  }
}
