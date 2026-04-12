import {
  AdminListInput,
  AdminOrderProvider,
  OrderActionInput,
  OrderDetail,
  OrderRow,
  OrderUpdateInput,
  PagedResponse,
  ProviderResult,
} from '@real/providers/contracts'
import { orderFields } from './fields'
import { paginate, projectRow, sortRows } from './_shared'
import { readAdminMockState, updateAdminMockState } from './store'

function applySearch(rows: OrderRow[], search?: string) {
  if (!search) return rows
  const needle = search.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter((row) =>
    `${row.orderNumber} ${row.customerName ?? ''} ${row.customerEmail ?? ''} ${row.vendor ?? ''}`
      .toLowerCase()
      .includes(needle)
  )
}

function applyFilters(rows: OrderRow[], filters?: Record<string, unknown>) {
  if (!filters) return rows
  let next = rows

  for (const key of ['paymentStatus', 'fulfillmentStatus', 'orderStatus', 'vendor'] as const) {
    const value = filters[key]
    if (typeof value === 'string' && value.trim()) {
      next = next.filter((row) => row[key] === value)
    }
  }

  const minTotal = filters.minTotal
  if (typeof minTotal === 'number') {
    next = next.filter((row) => (row.total ?? 0) >= minTotal)
  }

  const maxTotal = filters.maxTotal
  if (typeof maxTotal === 'number') {
    next = next.filter((row) => (row.total ?? 0) <= maxTotal)
  }

  const dateFrom = filters.dateFrom
  if (typeof dateFrom === 'string' && dateFrom.trim()) {
    const fromMs = Date.parse(dateFrom)
    if (!Number.isNaN(fromMs)) {
      next = next.filter((row) => {
        if (!row.createdAt) return false
        return Date.parse(row.createdAt) >= fromMs
      })
    }
  }

  const dateTo = filters.dateTo
  if (typeof dateTo === 'string' && dateTo.trim()) {
    const toMs = Date.parse(dateTo)
    if (!Number.isNaN(toMs)) {
      next = next.filter((row) => {
        if (!row.createdAt) return false
        return Date.parse(row.createdAt) <= toMs
      })
    }
  }

  return next
}

function toRow(order: OrderDetail): OrderRow {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: order.total,
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    orderStatus: order.orderStatus,
    vendor: order.vendor,
    itemCount: order.itemCount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customFields: order.customFields,
  }
}

function findOrder(state: { orders: OrderDetail[] }, id: string) {
  return state.orders.find((order) => order.id === id)
}

export const mockAdminOrderAdapter: AdminOrderProvider = {
  async listOrders(input: AdminListInput): Promise<ProviderResult<PagedResponse<OrderRow>>> {
    const state = await readAdminMockState()
    const searched = applySearch(state.orders.map(toRow), input.search)
    const filtered = applyFilters(searched, input.filters)
    const sorted = sortRows(filtered, input.sort)
    const projected = sorted.map((row) => projectRow(row, input.fields))
    return { ok: true, data: paginate(projected, input) }
  },
  async orderFields() {
    return { ok: true, data: orderFields }
  },
  async getOrder(id) {
    const state = await readAdminMockState()
    const order = findOrder(state, id)
    if (!order) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_ORDER_NOT_FOUND',
          message: 'Order was not found.',
        },
      }
    }
    return { ok: true, data: order }
  },
  async updateOrder(id, input: Partial<OrderUpdateInput>) {
    const nextState = await updateAdminMockState((state) => {
      const order = findOrder(state, id)
      if (!order) return
      Object.assign(order, input, { updatedAt: new Date().toISOString() })
    })
    const order = findOrder(nextState, id)
    if (!order) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_ORDER_NOT_FOUND',
          message: 'Order was not found.',
        },
      }
    }
    return { ok: true, data: order }
  },
  async runOrderAction(id: string, actionInput: OrderActionInput) {
    const nextState = await updateAdminMockState((state) => {
      const order = findOrder(state, id)
      if (!order) return
      if (actionInput.action === 'mark-review') {
        order.orderStatus = 'on_hold'
      }
      if (actionInput.action === 'assign-tag' && typeof actionInput.input?.tag === 'string') {
        order.tags = Array.from(new Set([...(order.tags ?? []), actionInput.input.tag]))
      }
      if (actionInput.action === 'refund') {
        order.paymentStatus = 'failed'
      }
      if (actionInput.action === 'exchange') {
        order.fulfillmentStatus = 'partially_fulfilled'
      }
      if (actionInput.action === 'split-shipment') {
        order.fulfillmentStatus = 'partially_fulfilled'
      }
      order.updatedAt = new Date().toISOString()
    })
    const order = findOrder(nextState, id)
    if (!order) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_ORDER_NOT_FOUND',
          message: 'Order was not found.',
        },
      }
    }
    return { ok: true, data: order }
  },
}
