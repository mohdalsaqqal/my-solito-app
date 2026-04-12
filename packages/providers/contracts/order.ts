import { AdminListInput, FieldRegistryResponse, PagedResponse, ProviderResult } from './types'

export type OrderRow = {
  id: string
  orderNumber: string
  customerName?: string
  customerEmail?: string
  total?: number
  currency?: string
  paymentStatus?: string
  fulfillmentStatus?: string
  orderStatus?: string
  vendor?: string
  itemCount?: number
  createdAt?: string
  updatedAt?: string
  customFields?: Record<string, unknown>
}

export type OrderDetail = OrderRow & {
  notes?: string
  tags?: string[]
  shippingAddress?: string
  billingAddress?: string
  lineItems?: Array<{
    id: string
    sku?: string
    title: string
    quantity: number
    price: number
  }>
}

export type OrderUpdateInput = {
  paymentStatus?: string
  fulfillmentStatus?: string
  orderStatus?: string
  vendor?: string
  notes?: string
  tags?: string[]
  customFields?: Record<string, unknown>
}

export type OrderActionInput = {
  action: 'mark-review' | 'assign-tag' | 'refund' | 'exchange' | 'split-shipment'
  input?: Record<string, unknown>
}

export interface AdminOrderProvider {
  listOrders(input: AdminListInput): Promise<ProviderResult<PagedResponse<OrderRow>>>
  orderFields(): Promise<ProviderResult<FieldRegistryResponse>>
  getOrder(id: string): Promise<ProviderResult<OrderDetail>>
  updateOrder(id: string, input: Partial<OrderUpdateInput>): Promise<ProviderResult<OrderDetail>>
  runOrderAction(id: string, input: OrderActionInput): Promise<ProviderResult<OrderDetail>>
}
