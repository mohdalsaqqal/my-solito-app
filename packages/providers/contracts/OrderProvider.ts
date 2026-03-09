import { ProviderResult } from './types'

export type OrderStatus = 'placed' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  ownerUserId?: string
  status: OrderStatus
  total: number
  currency: string
  createdAt: string
  pricing?: {
    subtotal: number
    delivery: number
    discount: number
  }
  fulfillment?: {
    mode: 'delivery' | 'pickup'
    paymentMethod: 'cod' | 'card_on_delivery' | 'online_card' | 'pay_at_branch'
    addressLine?: string
    branchName?: string
  }
  items?: Array<{
    productId: string
    brand?: string
    name: string
    quantity: number
    price: number
    currency: string
    imageUrl?: string
  }>
}

export interface OrderProvider {
  list(): Promise<ProviderResult<Order[]>>
  get(id: string): Promise<ProviderResult<Order>>
  updateStatus(id: string, status: OrderStatus): Promise<ProviderResult<Order>>
}
