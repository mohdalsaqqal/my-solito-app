import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { Order, OrderProvider, OrderStatus } from '@real/providers/contracts'

const STORAGE_DIR = path.join(process.cwd(), '.tmp')
const STORAGE_FILE = path.join(STORAGE_DIR, 'mock-orders.json')

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-u-1-seed-1',
    ownerUserId: 'u-1',
    status: 'placed',
    total: 68,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    items: [
      {
        productId: '1',
        brand: 'Yves Saint Laurent',
        name: 'Libre Berry Crush Eau De Parfum',
        quantity: 1,
        price: 42,
        currency: 'USD',
        imageUrl:
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        productId: '3',
        brand: 'Fenty Beauty',
        name: 'Gloss Bomb Stix High-Shine Gloss Stick',
        quantity: 1,
        price: 26,
        currency: 'USD',
        imageUrl:
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=80&h=80&q=80',
      },
    ],
  },
]

const validStatuses: OrderStatus[] = ['placed', 'shipped', 'delivered', 'cancelled']

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  placed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

function normalizeOrder(input: unknown): Order | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const raw = input as Partial<Order>
  if (
    typeof raw.id !== 'string' ||
    !validStatuses.includes(raw.status as OrderStatus) ||
    typeof raw.total !== 'number' ||
    typeof raw.currency !== 'string' ||
    typeof raw.createdAt !== 'string'
  ) {
    return null
  }

  const items = Array.isArray(raw.items)
    ? raw.items
        .filter(
          (item) =>
            item &&
            typeof item.productId === 'string' &&
            typeof item.name === 'string' &&
            typeof item.quantity === 'number' &&
            typeof item.price === 'number' &&
            typeof item.currency === 'string'
        )
        .map((item) => ({
          productId: item.productId,
          brand: typeof item.brand === 'string' ? item.brand : undefined,
          name: item.name,
          quantity: Math.max(1, Math.floor(item.quantity)),
          price: item.price,
          currency: item.currency,
          imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : undefined,
        }))
    : undefined

  return {
    id: raw.id,
    ownerUserId: typeof raw.ownerUserId === 'string' ? raw.ownerUserId : undefined,
    status: raw.status as OrderStatus,
    total: raw.total,
    currency: raw.currency,
    createdAt: raw.createdAt,
    pricing:
      raw.pricing &&
      typeof raw.pricing.subtotal === 'number' &&
      typeof raw.pricing.delivery === 'number' &&
      typeof raw.pricing.discount === 'number'
        ? {
            subtotal: raw.pricing.subtotal,
            delivery: raw.pricing.delivery,
            discount: raw.pricing.discount,
          }
        : undefined,
    fulfillment:
      raw.fulfillment &&
      (raw.fulfillment.mode === 'delivery' || raw.fulfillment.mode === 'pickup') &&
      typeof raw.fulfillment.paymentMethod === 'string'
        ? {
            mode: raw.fulfillment.mode,
            paymentMethod: raw.fulfillment.paymentMethod as
              | 'cod'
              | 'card_on_delivery'
              | 'online_card'
              | 'pay_at_branch',
            addressLine:
              typeof raw.fulfillment.addressLine === 'string' ? raw.fulfillment.addressLine : undefined,
            branchName:
              typeof raw.fulfillment.branchName === 'string' ? raw.fulfillment.branchName : undefined,
          }
        : undefined,
    items,
  }
}

async function readOrders(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return [...SEED_ORDERS]
    }
    const normalized = parsed
      .map((item) => normalizeOrder(item))
      .filter((item): item is Order => Boolean(item))
    return normalized.length > 0 ? normalized : [...SEED_ORDERS]
  } catch {
    return [...SEED_ORDERS]
  }
}

async function writeOrders(orders: Order[]) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(orders), 'utf8')
}

export const mockOrderAdapter: OrderProvider = {
  async list() {
    const orders = await readOrders()
    return { ok: true, data: orders }
  },

  async get(id: string) {
    const orders = await readOrders()
    const order = orders.find((item) => item.id === id)
    if (!order) {
      return {
        ok: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found.',
        },
      }
    }

    return { ok: true, data: order }
  },

  async updateStatus(id: string, status: OrderStatus) {
    const orders = await readOrders()
    const orderIndex = orders.findIndex((item) => item.id === id)
    if (orderIndex < 0) {
      return {
        ok: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found.',
        },
      }
    }

    const current = orders[orderIndex]
    if (!current) {
      return {
        ok: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found.',
        },
      }
    }
    if (current.status === status) {
      return { ok: true, data: current }
    }

    const allowed = allowedTransitions[current.status] ?? []
    const canTransition = allowed.includes(status)
    if (!canTransition) {
      return {
        ok: false,
        error: {
          code: 'ORDER_STATUS_INVALID_TRANSITION',
          message: `Cannot change order from ${current.status} to ${status}.`,
        },
      }
    }

    const updated: Order = {
      ...current,
      status,
    }
    orders[orderIndex] = updated
    await writeOrders(orders)

    return { ok: true, data: updated }
  },
}
