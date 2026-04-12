// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { POST as placeOrder } from './route.ts'
import { POST as createQuote } from '../../checkout/quote/route.ts'
import { buildAuthSessionCookieHeader } from '../../_lib/auth-session.ts'
import { promotionProvider } from '@real/providers'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const APPS_NEXT_ROOT = path.resolve(TEST_DIR, '../../../..')
const STORAGE_DIR = path.join(APPS_NEXT_ROOT, '.tmp')
const CART_FILE = path.join(STORAGE_DIR, 'mock-cart.json')
const QUOTE_FILE = path.join(STORAGE_DIR, 'mock-pricing-quotes.json')
const DATA_DIR = path.join(APPS_NEXT_ROOT, '.data')
const PROGRAM_FILE = path.join(DATA_DIR, 'referral-program-store.json')
const PROFILE_FILE = path.join(DATA_DIR, 'referral-profile-store.json')
const TEST_PRODUCT_ID = '76959'

const sessionCookie = buildAuthSessionCookieHeader({
  userId: 'u-1',
  email: 'user@realcosmetics.local',
  name: 'Customer User',
  role: 'customer',
})

async function writeCart(items) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(CART_FILE, JSON.stringify({ items, updatedAt: new Date().toISOString() }), 'utf8')
}

async function cleanupReferralState() {
  await fs.rm(PROGRAM_FILE, { force: true })
  await fs.rm(PROFILE_FILE, { force: true })
  await fs.rm(QUOTE_FILE, { force: true })
}

async function requestQuote() {
  const response = await createQuote(
    new Request('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: sessionCookie,
        origin: 'http://localhost',
        'sec-fetch-site': 'same-origin',
      },
      body: JSON.stringify({ fulfillment: { mode: 'delivery' } }),
    })
  )
  const json = await response.json()
  const storedQuote = await promotionProvider.getQuote(json.data.quoteId)
  if (!storedQuote.ok || !storedQuote.data) {
    throw new Error('Failed to read stored checkout quote')
  }
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(QUOTE_FILE, JSON.stringify([storedQuote.data]), 'utf8')
  return json.data
}

async function requestReferralQuote() {
  const response = await createQuote(
    new Request('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: sessionCookie,
        origin: 'http://localhost',
        'sec-fetch-site': 'same-origin',
      },
      body: JSON.stringify({
        fulfillment: { mode: 'delivery' },
        referralCode: 'GLOWWITHU1',
        items: [{ productId: TEST_PRODUCT_ID, quantity: 3 }],
      }),
    })
  )
  const json = await response.json()
  const storedQuote = await promotionProvider.getQuote(json.data.quoteId)
  if (!storedQuote.ok || !storedQuote.data) {
    throw new Error('Failed to read stored checkout quote')
  }
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(QUOTE_FILE, JSON.stringify([storedQuote.data]), 'utf8')
  return json.data
}

function createPlaceServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/api/orders/place') {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    const chunks: Uint8Array[] = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const body = chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : '{}'

    const webResponse = await placeOrder(
      new Request('http://localhost/api/orders/place', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: req.headers.cookie || '',
          origin: 'http://localhost',
          'sec-fetch-site': 'same-origin',
        },
        body,
      })
    )

    res.statusCode = webResponse.status
    webResponse.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(await webResponse.text())
  })
}

function basePayload() {
  return {
    contact: { fullName: 'Test User', phone: '0790000000' },
    fulfillment: { mode: 'delivery' },
    payment: { method: 'cod' },
    address: { city: 'Amman', area: 'Dabouq', building: '12' },
  }
}

test('POST /api/orders/place requires pricingQuoteId', { concurrency: false }, async () => {
  await cleanupReferralState()
  await writeCart([{ productId: TEST_PRODUCT_ID, quantity: 1 }])
  const server = createPlaceServer()

  const response = await request(server)
    .post('/api/orders/place')
    .set('Cookie', sessionCookie)
    .send(basePayload())

  assert.equal(response.status, 400)
  assert.equal(response.body.error.code, 'CHECKOUT_QUOTE_REQUIRED')
})

test('POST /api/orders/place returns quote not found', { concurrency: false }, async () => {
  await cleanupReferralState()
  await writeCart([{ productId: TEST_PRODUCT_ID, quantity: 1 }])
  const server = createPlaceServer()

  const response = await request(server)
    .post('/api/orders/place')
    .set('Cookie', sessionCookie)
    .send({ ...basePayload(), pricingQuoteId: 'missing-quote' })

  assert.equal(response.status, 400)
  assert.equal(response.body.error.code, 'CHECKOUT_QUOTE_NOT_FOUND')
})

test('POST /api/orders/place returns quote expired', { concurrency: false }, async () => {
  await cleanupReferralState()
  await writeCart([{ productId: TEST_PRODUCT_ID, quantity: 1 }])
  const quote = await requestQuote()
  const raw = JSON.parse(await fs.readFile(QUOTE_FILE, 'utf8'))
  raw[0].expiresAt = new Date(Date.now() - 60000).toISOString()
  await fs.writeFile(QUOTE_FILE, JSON.stringify(raw), 'utf8')

  const server = createPlaceServer()
  const response = await request(server)
    .post('/api/orders/place')
    .set('Cookie', sessionCookie)
    .send({ ...basePayload(), pricingQuoteId: quote.quoteId })

  assert.equal(response.status, 400)
  assert.equal(response.body.error.code, 'CHECKOUT_QUOTE_EXPIRED')
})

test('POST /api/orders/place returns quote mismatch', { concurrency: false }, async () => {
  await cleanupReferralState()
  await writeCart([{ productId: TEST_PRODUCT_ID, quantity: 1 }])
  const quote = await requestQuote()
  await writeCart([{ productId: TEST_PRODUCT_ID, quantity: 3 }])

  const server = createPlaceServer()
  const response = await request(server)
    .post('/api/orders/place')
    .set('Cookie', sessionCookie)
    .send({ ...basePayload(), pricingQuoteId: quote.quoteId })

  assert.equal(response.status, 400)
  assert.equal(response.body.error.code, 'CHECKOUT_QUOTE_MISMATCH')
})

test('POST /api/orders/place preserves referral-backed quote discount and succeeds', { concurrency: false }, async () => {
  await cleanupReferralState()
  await writeCart([{ productId: TEST_PRODUCT_ID, quantity: 3 }])
  const quote = await requestReferralQuote()
  const server = createPlaceServer()

  const response = await request(server)
    .post('/api/orders/place')
    .set('Cookie', sessionCookie)
    .send({ ...basePayload(), pricingQuoteId: quote.quoteId })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(typeof response.body.data.id, 'string')
  assert.equal(typeof response.body.data.pricing.discount, 'number')
  assert.equal(response.body.data.pricing.discount > 0, true)
})
