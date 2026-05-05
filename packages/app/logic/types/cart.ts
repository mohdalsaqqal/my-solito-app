import type { ProductId } from './product'

export interface CartItem {
  productId: ProductId
  quantity: number
}

export interface Cart {
  items: CartItem[]
}
