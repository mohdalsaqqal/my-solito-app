// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { POST } from './route.ts'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const APPS_NEXT_ROOT = path.resolve(TEST_DIR, '../../../..')
const STORAGE_DIR = path.join(APPS_NEXT_ROOT, '.tmp')
const CART_FILE = path.join(STORAGE_DIR, 'mock-cart.json')
const QUOTE_FILE = path.join(STORAGE_DIR, 'mock-pricing-quotes.json')
const PROMOTIONS_FILE = path.join(STORAGE_DIR, 'mock-promotions.json')
const DATA_DIR = path.join(APPS_NEXT_ROOT, '.data')
const PROGRAM_FILE = path.join(DATA_DIR, 'referral-program-store.json')
const PROFILE_FILE = path.join(DATA_DIR, 'referral-profile-store.json')
const TEST_PRODUCT_ID = '76959'

async function setCart(items) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(CART_FILE, JSON.stringify({ items, updatedAt: new Date().toISOString() }), 'utf8')
}

async function cleanup() {
  await fs.rm(QUOTE_FILE, { force: true })
  await fs.rm(PROMOTIONS_FILE, { force: true })
  await fs.rm(PROGRAM_FILE, { force: true })
  await fs.rm(PROFILE_FILE, { force: true })
}

async function seedPromotions() {
  const now = Date.now()
  const startAt = new Date(now - 60 * 60 * 1000).toISOString()
  const endAt = new Date(now + 24 * 60 * 60 * 1000).toISOString()
  const promotions = [
    {
      id: 'promo-auto-10',
      name: { en: 'Auto 10% off', ar: 'خصم 10% تلقائي' },
      isActive: true,
      startAt,
      endAt,
      priority: 10,
      conditions: [{ type: 'min_cart_total', amount: 50 }],
      rewards: [{ type: 'percent_off', value: 10 }],
    },
    {
      id: 'promo-coupon-5',
      code: 'SAVE5',
      name: { en: 'Coupon $5 off', ar: 'كوبون خصم 5' },
      isActive: true,
      startAt,
      endAt,
      priority: 20,
      conditions: [{ type: 'coupon_required', code: 'SAVE5' }],
      rewards: [{ type: 'fixed_amount_off', value: 5 }],
    },
  ]

  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(PROMOTIONS_FILE, JSON.stringify(promotions), 'utf8')
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/api/checkout/quote') {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    const chunks: Uint8Array[] = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }

    const body = chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : '{}'
    const webResponse = await POST(
      new Request('http://localhost/api/checkout/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      })
    )
    res.statusCode = webResponse.status
    webResponse.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(await webResponse.text())
  })
}

test('POST /api/checkout/quote returns quote and totals', { concurrency: false }, async () => {
  await cleanup()
  await seedPromotions()
  await setCart([{ productId: TEST_PRODUCT_ID, quantity: 2 }])
  const server = createServer()

  const response = await request(server)
    .post('/api/checkout/quote')
    .send({ fulfillment: { mode: 'delivery' }, items: [{ productId: TEST_PRODUCT_ID, quantity: 2 }] })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(typeof response.body.data.quoteId, 'string')
  assert.equal(typeof response.body.data.expiresAt, 'string')
  assert.equal(typeof response.body.data.totals.finalTotal, 'number')
})

test('POST /api/checkout/quote applies coupon required promo', { concurrency: false }, async () => {
  await cleanup()
  await seedPromotions()
  await setCart([{ productId: TEST_PRODUCT_ID, quantity: 2 }])
  const server = createServer()

  const withoutCoupon = await request(server)
    .post('/api/checkout/quote')
    .send({ fulfillment: { mode: 'delivery' }, items: [{ productId: TEST_PRODUCT_ID, quantity: 2 }] })

  const withCoupon = await request(server)
    .post('/api/checkout/quote')
    .send({ fulfillment: { mode: 'delivery' }, couponCode: 'SAVE5', items: [{ productId: TEST_PRODUCT_ID, quantity: 2 }] })

  assert.equal(withoutCoupon.status, 200)
  assert.equal(withCoupon.status, 200)
  assert.equal(withCoupon.body.data.totals.appliedPromotion?.code, 'SAVE5')
})

test('POST /api/checkout/quote applies eligible referral code discount', { concurrency: false }, async () => {
  await cleanup()
  await seedPromotions()
  await setCart([{ productId: TEST_PRODUCT_ID, quantity: 3 }])
  const server = createServer()

  const response = await request(server)
    .post('/api/checkout/quote')
    .send({
      fulfillment: { mode: 'delivery' },
      referralCode: 'GLOWWITHU1',
      items: [{ productId: TEST_PRODUCT_ID, quantity: 3 }],
    })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.referral.code, 'GLOWWITHU1')
  assert.equal(response.body.data.referral.followerRewardType, 'percentage_discount')
  assert.equal(typeof response.body.data.referral.followerDiscountAmount, 'number')
  assert.equal(response.body.data.totals.finalTotal < response.body.data.totals.baseSubtotal + response.body.data.totals.shipping, true)
})

test('POST /api/checkout/quote rejects unapproved influencer-only referral code', { concurrency: false }, async () => {
  await cleanup()
  await seedPromotions()
  await setCart([{ productId: TEST_PRODUCT_ID, quantity: 3 }])
  const server = createServer()

  const response = await request(server)
    .post('/api/checkout/quote')
    .send({
      fulfillment: { mode: 'delivery' },
      referralCode: 'SHAREU2',
      items: [{ productId: TEST_PRODUCT_ID, quantity: 3 }],
    })

  assert.equal(response.status, 400)
  assert.equal(response.body.success, false)
  assert.equal(response.body.error.code, 'REFERRAL_PROFILE_NOT_APPROVED')
})
