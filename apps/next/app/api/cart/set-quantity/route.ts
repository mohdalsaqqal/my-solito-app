import { cartProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'
import { CartSetQuantityBodySchema } from '../../_lib/validation-schemas'

export async function POST(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) return session
    const body = await request.json()
    const parsed = CartSetQuantityBodySchema.safeParse(body)
    if (!parsed.success) {
      return fail('CART_SET_QUANTITY_INVALID', parsed.error.issues[0].message, 400)
    }

    const { productId, quantity } = parsed.data

    const current = await cartProvider.get()
    if (!current.ok) {
      return fail(current.error.code, current.error.message, 500)
    }

    const existing = current.data.items.find((item) => item.productId === productId)
    if (existing) {
      const removed = await cartProvider.remove(productId)
      if (!removed.ok) {
        return fail(removed.error.code, removed.error.message, 500)
      }
      if (quantity === 0) {
        return ok(removed.data)
      }
      // Atomic: if add fails, restore the item at its previous quantity
      const added = await cartProvider.add(productId, quantity)
      if (!added.ok) {
        await cartProvider.add(productId, existing.quantity).catch(() => {})
        return fail(added.error.code, added.error.message, 500)
      }
      return ok(added.data)
    } else if (quantity === 0) {
      return ok(current.data)
    }

    const added = await cartProvider.add(productId, quantity)
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
