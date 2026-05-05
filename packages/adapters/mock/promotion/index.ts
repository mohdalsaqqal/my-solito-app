import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { PricingQuote, Promotion, PromotionProvider } from '@real/providers/contracts'

const STORAGE_DIR = process.env.VERCEL ? path.join('/tmp', 'real-commerce') : path.join(process.cwd(), '.tmp')
const PROMOTIONS_FILE = path.join(STORAGE_DIR, 'mock-promotions.json')
const QUOTES_FILE = path.join(STORAGE_DIR, 'mock-pricing-quotes.json')

function nowIso() {
  return new Date().toISOString()
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function normalizeCouponCode(code?: string) {
  return (code ?? '').trim().toLowerCase()
}

function buildSeedPromotions(referenceIso: string): Promotion[] {
  const now = new Date(referenceIso)
  const start = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  return [
    {
      id: 'promo-auto-10',
      name: { en: 'Auto 10% off', ar: 'خصم 10% تلقائي' },
      isActive: true,
      startAt: start,
      endAt: end,
      priority: 10,
      conditions: [{ type: 'min_cart_total', amount: 50 }],
      rewards: [{ type: 'percent_off', value: 10 }],
    },
    {
      id: 'promo-fs',
      name: { en: 'Free shipping', ar: 'شحن مجاني' },
      isActive: true,
      startAt: start,
      endAt: end,
      priority: 8,
      conditions: [{ type: 'min_cart_total', amount: 30 }],
      rewards: [{ type: 'free_shipping', value: true }],
    },
    {
      id: 'promo-coupon-5',
      code: 'SAVE5',
      name: { en: 'Coupon $5 off', ar: 'كوبون خصم 5' },
      isActive: true,
      startAt: start,
      endAt: end,
      priority: 20,
      conditions: [{ type: 'coupon_required', code: 'SAVE5' }],
      rewards: [{ type: 'fixed_amount_off', value: round2(5) }],
    },
  ]
}

function normalizePromotion(input: unknown): Promotion | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as Partial<Promotion>
  if (
    typeof raw.id !== 'string' ||
    typeof raw.name?.en !== 'string' ||
    typeof raw.name?.ar !== 'string' ||
    typeof raw.isActive !== 'boolean' ||
    typeof raw.startAt !== 'string' ||
    typeof raw.endAt !== 'string' ||
    typeof raw.priority !== 'number' ||
    !Array.isArray(raw.conditions) ||
    !Array.isArray(raw.rewards)
  ) {
    return null
  }

  return {
    id: raw.id,
    code: typeof raw.code === 'string' ? raw.code : undefined,
    name: { en: raw.name.en, ar: raw.name.ar },
    isActive: raw.isActive,
    startAt: raw.startAt,
    endAt: raw.endAt,
    priority: raw.priority,
    conditions: raw.conditions,
    rewards: raw.rewards,
  }
}

function normalizeQuote(input: unknown): PricingQuote | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as Partial<PricingQuote>
  if (
    typeof raw.id !== 'string' ||
    typeof raw.cartHash !== 'string' ||
    typeof raw.quote !== 'object' ||
    !raw.quote ||
    typeof raw.quote.cartHash !== 'string' ||
    typeof raw.quote.fulfillmentMode !== 'string' ||
    typeof raw.quote.shippingBaseline !== 'number' ||
    typeof raw.expiresAt !== 'string' ||
    typeof raw.createdAt !== 'string'
  ) {
    return null
  }
  return {
    id: raw.id,
    userId: typeof raw.userId === 'string' ? raw.userId : undefined,
    cartHash: raw.cartHash,
    quote: raw.quote,
    expiresAt: raw.expiresAt,
    createdAt: raw.createdAt,
  }
}

async function readPromotions(): Promise<Promotion[]> {
  try {
    const raw = await fs.readFile(PROMOTIONS_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizePromotion).filter((item): item is Promotion => Boolean(item))
  } catch {
    const seed = buildSeedPromotions(nowIso())
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true })
      await fs.writeFile(PROMOTIONS_FILE, JSON.stringify(seed), 'utf8')
    } catch {
      return seed
    }
    return seed
  }
}

async function readQuotes(): Promise<PricingQuote[]> {
  try {
    const raw = await fs.readFile(QUOTES_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeQuote).filter((item): item is PricingQuote => Boolean(item))
  } catch {
    return []
  }
}

async function writeQuotes(quotes: PricingQuote[]) {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
    await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes), 'utf8')
  } catch {
    // Serverless preview bundles are read-only; mock quote persistence is best-effort.
  }
}

async function writePromotions(promotions: Promotion[]) {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
    await fs.writeFile(PROMOTIONS_FILE, JSON.stringify(promotions), 'utf8')
  } catch {
    // Serverless preview bundles are read-only; mock promotion mutations are best-effort.
  }
}

function isPromotionActive(promotion: Promotion, atIso: string) {
  if (!promotion.isActive) return false
  const at = new Date(atIso).getTime()
  const start = new Date(promotion.startAt).getTime()
  const end = new Date(promotion.endAt).getTime()
  return Number.isFinite(at) && Number.isFinite(start) && Number.isFinite(end) && at >= start && at <= end
}

function isExpired(expiresAt: string, atIso: string) {
  return new Date(expiresAt).getTime() <= new Date(atIso).getTime()
}

export const mockPromotionAdapter: PromotionProvider = {
  async listAll() {
    return { ok: true, data: await readPromotions() }
  },
  async listActive(atIso) {
    const now = atIso ?? nowIso()
    const all = await readPromotions()
    return { ok: true, data: all.filter((item) => isPromotionActive(item, now)) }
  },
  async create(input) {
    const promotions = await readPromotions()
    if (promotions.some((item) => item.id === input.id)) {
      return {
        ok: false,
        error: { code: 'PROMOTION_EXISTS', message: 'Promotion id already exists.' },
      }
    }
    promotions.unshift({
      ...input,
      code: normalizeCouponCode(input.code) || undefined,
      priority: round2(input.priority),
    })
    await writePromotions(promotions)
    return { ok: true, data: input }
  },
  async update(id, input) {
    const promotions = await readPromotions()
    const index = promotions.findIndex((item) => item.id === id)
    if (index < 0) {
      return {
        ok: false,
        error: { code: 'PROMOTION_NOT_FOUND', message: 'Promotion not found.' },
      }
    }
    const current = promotions[index]
    if (!current) {
      return {
        ok: false,
        error: { code: 'PROMOTION_NOT_FOUND', message: 'Promotion not found.' },
      }
    }
    const updated: Promotion = {
      ...current,
      ...input,
      id: current.id,
      code: input.code !== undefined ? normalizeCouponCode(input.code) || undefined : current.code,
      name: input.name ?? current.name,
      isActive: input.isActive ?? current.isActive,
      startAt: input.startAt ?? current.startAt,
      endAt: input.endAt ?? current.endAt,
      priority: input.priority !== undefined ? round2(input.priority) : current.priority,
      conditions: input.conditions ?? current.conditions,
      rewards: input.rewards ?? current.rewards,
    }
    promotions[index] = updated
    await writePromotions(promotions)
    return { ok: true, data: updated }
  },
  async delete(id) {
    const promotions = await readPromotions()
    const exists = promotions.some((item) => item.id === id)
    if (!exists) {
      return {
        ok: false,
        error: { code: 'PROMOTION_NOT_FOUND', message: 'Promotion not found.' },
      }
    }
    const next = promotions.filter((item) => item.id !== id)
    await writePromotions(next)
    return { ok: true, data: { id, deleted: true } }
  },

  async createQuote(input) {
    const now = nowIso()
    const quotes = await readQuotes()
    const next: PricingQuote = {
      id: `quote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: input.userId,
      cartHash: input.cartHash,
      quote: {
        ...input.quote,
        couponCode: normalizeCouponCode(input.quote.couponCode || undefined) || undefined,
      },
      expiresAt: input.expiresAt,
      createdAt: now,
    }
    quotes.unshift(next)
    await writeQuotes(quotes)
    return { ok: true, data: next }
  },

  async getQuote(id) {
    const quotes = await readQuotes()
    const match = quotes.find((quote) => quote.id === id) ?? null
    return { ok: true, data: match }
  },

  async invalidateExpiredQuotes(atIso) {
    const now = atIso ?? nowIso()
    const quotes = await readQuotes()
    const active = quotes.filter((quote) => !isExpired(quote.expiresAt, now))
    const removed = quotes.length - active.length
    if (removed > 0) {
      await writeQuotes(active)
    }
    return { ok: true, data: { removed } }
  },
}
