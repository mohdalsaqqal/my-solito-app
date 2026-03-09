// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { POST as placeOrder } from './route'
import { POST as createQuote } from '../../checkout/quote/route'
import { buildAuthSessionCookieHeader } from '../../_lib/auth-session'

const STORAGE_DIR = path.join(process.cwd(), '.tmp')
const CART_FILE = path.join(STORAGE_DIR, 'mock-cart.json')
const QUOTE_FILE = path.join(STORAGE_DIR, 'mock-pricing-quotes.json')

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

async function requestQuote() {
  const response = await createQuote(
    new Request('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: sessionCookie,
      },
      body: JSON.stringify({ fulfillment: { mode: 'delivery' } }),
    })
  )
  const json = await response.json()
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
  await writeCart([{ productId: '1', quantity: 1 }])
  const server = createPlaceServer()

  const response = await request(server)
    .post('/api/orders/place')
    .set('Cookie', sessionCookie)
    .send(basePayload())

  assert.equal(response.status, 400)
  assert.equal(response.body.error.code, 'CHECKOUT_QUOTE_REQUIRED')
})

test('POST /api/orders/place returns quote not found', { concurrency: false }, async () => {
  await writeCart([{ productId: '1', quantity: 1 }])
  const server = createPlaceServer()

  const response = await request(server)
    .post('/api/orders/place')
    .set('Cookie', sessionCookie)
    .send({ ...basePayload(), pricingQuoteId: 'missing-quote' })

  assert.equal(response.status, 400)
  assert.equal(response.body.error.code, 'CHECKOUT_QUOTE_NOT_FOUND')
})

test('POST /api/orders/place returns quote expired', { concurrency: false }, async () => {
  await writeCart([{ productId: '1', quantity: 1 }])
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
  await writeCart([{ productId: '1', quantity: 1 }])
  const quote = await requestQuote()
  await writeCart([{ productId: '1', quantity: 3 }])

  const server = createPlaceServer()
  const response = await request(server)
    .post('/api/orders/place')
    .set('Cookie', sessionCookie)
    .send({ ...basePayload(), pricingQuoteId: quote.quoteId })

  assert.equal(response.status, 400)
  assert.equal(response.body.error.code, 'CHECKOUT_QUOTE_MISMATCH')
})
