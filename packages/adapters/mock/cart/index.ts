import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { Cart, CartProvider } from '@real/providers/contracts'

const STORAGE_DIR = path.join(process.cwd(), '.tmp')
const STORAGE_FILE = path.join(STORAGE_DIR, 'mock-cart.json')

const EMPTY_CART: Cart = {
  items: [],
  updatedAt: new Date().toISOString(),
}

function normalizeCart(input: unknown): Cart {
  if (!input || typeof input !== 'object') {
    return { ...EMPTY_CART }
  }

  const raw = input as Partial<Cart>
  const items = Array.isArray(raw.items)
    ? raw.items
        .filter((item) => item && typeof item.productId === 'string' && typeof item.quantity === 'number')
        .map((item) => ({
          productId: item.productId,
          quantity: Math.max(0, Math.floor(item.quantity)),
        }))
        .filter((item) => item.quantity > 0)
    : []

  return {
    items,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  }
}

async function readCart(): Promise<Cart> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    return normalizeCart(JSON.parse(raw))
  } catch {
    return { ...EMPTY_CART, updatedAt: new Date().toISOString() }
  }
}

async function writeCart(cart: Cart): Promise<Cart> {
  const next = normalizeCart(cart)
  next.updatedAt = new Date().toISOString()
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(next), 'utf8')
  return next
}

export const mockCartAdapter: CartProvider = {
  async get() {
    const cart = await readCart()
    return { ok: true, data: cart }
  },

  async add(productId: string, quantity: number) {
    const safeQty = Math.max(1, Math.floor(quantity))
    const cart = await readCart()

    const existing = cart.items.find((item) => item.productId === productId)
    if (existing) {
      existing.quantity += safeQty
    } else {
      cart.items.push({ productId, quantity: safeQty })
    }

    const saved = await writeCart(cart)
    return { ok: true, data: saved }
  },

  async remove(productId: string) {
    const cart = await readCart()
    const next: Cart = {
      items: cart.items.filter((item) => item.productId !== productId),
      updatedAt: new Date().toISOString(),
    }
    const saved = await writeCart(next)
    return { ok: true, data: saved }
  },
}
