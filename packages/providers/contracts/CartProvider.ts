import { ProviderResult } from './types'

export type CartItem = {
  productId: string
  quantity: number
}

export type Cart = {
  items: CartItem[]
  updatedAt: string
}

export interface CartProvider {
  get(): Promise<ProviderResult<Cart>>
  add(productId: string, quantity: number): Promise<ProviderResult<Cart>>
  remove(productId: string): Promise<ProviderResult<Cart>>
}
