import { ProviderResult } from './types'

export type OrderStatus = 'placed' | 'shipped' | 'delivered' | 'cancelled'

export type OrderPaymentMethod = 'cod' | 'card_on_delivery' | 'online_card' | 'pay_at_branch'

export type PaymentSettlementStatus =
  | 'not_started'
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'

export type PaymentInitiationInput = {
  orderId: string
  amount: number
  currency: string
  returnUrl?: string
  cancelUrl?: string
}

export type PaymentInitiationResult = {
  sessionId: string
  provider: 'mock' | 'payment_gateway'
  status: 'pending' | 'requires_action' | 'ready'
  paymentUrl?: string
  clientToken?: string
  expiresAt?: string
}

export type PaymentSettlementRecord = {
  settlementId: string
  provider: 'mock' | 'payment_gateway'
  status: PaymentSettlementStatus
  amount: number
  currency: string
  capturedAt?: string
  rawReference?: string
}

export type PlaceOrderInput = {
  pricingQuoteId: string
  customerUserId?: string
  order?: Order
  fulfillment: {
    mode: 'delivery' | 'pickup'
    paymentMethod: OrderPaymentMethod
    addressLine?: string
    branchName?: string
  }
  referralCode?: string
  referralToken?: string
}

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
    paymentMethod: OrderPaymentMethod
    addressLine?: string
    branchName?: string
  }
  paymentSettlement?: PaymentSettlementRecord
  paymentAction?: {
    status: 'not_required' | 'pending' | 'requires_action' | 'authorized' | 'captured' | 'failed' | 'cancelled'
    paymentUrl?: string
    clientToken?: string
    expiresAt?: string
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
  place?(input: PlaceOrderInput): Promise<ProviderResult<Order>>
  initiatePayment?(input: PaymentInitiationInput): Promise<ProviderResult<PaymentInitiationResult>>
  confirmPaymentSettlement?(
    orderId: string,
    settlement: PaymentSettlementRecord
  ): Promise<ProviderResult<Order>>
}
