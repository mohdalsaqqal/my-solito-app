import { Cart, Product } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import { passThroughPricingService } from '@real/app/lib/pricing'

export function toCartLines(cart: Cart | null, products: Product[]): CartLine[] {
  if (!cart) {
    return []
  }

  return cart.items
    .map((line) => {
      const product = products.find((item) => item.id === line.productId)
      if (!product) {
        return null
      }
      const resolved = passThroughPricingService.getProductPrice(product)
      return {
        id: line.productId,
        name: product.name,
        quantity: line.quantity,
        price: resolved.unitPrice,
        currency: resolved.currency,
      }
    })
    .filter((item): item is CartLine => Boolean(item))
}

export function cartCount(cart: Cart | null): number {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

export function cartSubtotal(lines: CartLine[]): number {
  return passThroughPricingService.getCartTotals(lines).subtotal
}
