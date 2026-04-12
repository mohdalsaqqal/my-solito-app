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
        imageUrl: product.image,
        brand: product.brand,
      } as CartLine
    })
    .filter((item): item is CartLine => item !== null)
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function cartSubtotal(lines: CartLine[]): number {
  return passThroughPricingService.getCartTotals(lines).subtotal
}
