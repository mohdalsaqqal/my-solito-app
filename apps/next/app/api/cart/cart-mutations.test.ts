// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import { auth } from '../../../lib/auth'
import { POST as cartAdd } from './add/route'
import { POST as cartRemove } from './remove/route'
import { POST as cartSetQuantity } from './set-quantity/route'

function makeRequest(url: string, options?: RequestInit) {
  return new Request(`http://localhost${url}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin',
      ...(options?.headers as Record<string, string> ?? {}),
    },
    ...options,
  })
}

function withAuth(email = 'user@realcosmetics.local') {
  const original = auth.api.getSession
  auth.api.getSession = (async () => ({
    user: { id: 'u-1', email, name: 'Test', emailVerified: true },
    session: { id: 's-1' },
  }))
  return () => { auth.api.getSession = original }
}

function withNoAuth() {
  const original = auth.api.getSession
  auth.api.getSession = (async () => null)
  return () => { auth.api.getSession = original }
}

// ── Add ──

test('POST /api/cart/add — allows guest cart and sets cart cookie', async () => {
  const restore = withNoAuth()
  try {
    const res = await cartAdd(makeRequest('/api/cart/add', {
      body: JSON.stringify({ productId: 'prod_1', quantity: 1 }),
    }))
    assert.equal(res.status, 200)
    assert.match(res.headers.get('set-cookie') ?? '', /rc_cart_id=/)
  } finally { restore() }
})

test('POST /api/cart/add — 400 when missing productId', async () => {
  const restore = withAuth()
  try {
    const res = await cartAdd(makeRequest('/api/cart/add', {
      body: JSON.stringify({}),
    }))
    assert.equal(res.status, 400)
  } finally { restore() }
})

test('POST /api/cart/add — adds item when authenticated', async () => {
  const restore = withAuth()
  try {
    const res = await cartAdd(makeRequest('/api/cart/add', {
      body: JSON.stringify({ productId: 'prod_1', quantity: 2 }),
    }))
    assert.equal(res.status, 200)
  } finally { restore() }
})

// ── Remove ──

test('POST /api/cart/remove — allows guest cart', async () => {
  const restore = withNoAuth()
  try {
    const res = await cartRemove(makeRequest('/api/cart/remove', {
      body: JSON.stringify({ productId: 'prod_1' }),
    }))
    assert.equal(res.status, 200)
  } finally { restore() }
})

test('POST /api/cart/remove — 400 when missing productId', async () => {
  const restore = withAuth()
  try {
    const res = await cartRemove(makeRequest('/api/cart/remove', {
      body: JSON.stringify({}),
    }))
    assert.equal(res.status, 400)
  } finally { restore() }
})

// ── Set Quantity ──

test('POST /api/cart/set-quantity — allows guest cart', async () => {
  const restore = withNoAuth()
  try {
    const res = await cartSetQuantity(makeRequest('/api/cart/set-quantity', {
      body: JSON.stringify({ productId: 'prod_1', quantity: 2 }),
    }))
    assert.equal(res.status, 200)
  } finally { restore() }
})

test('POST /api/cart/set-quantity — 400 when missing productId', async () => {
  const restore = withAuth()
  try {
    const res = await cartSetQuantity(makeRequest('/api/cart/set-quantity', {
      body: JSON.stringify({}),
    }))
    assert.equal(res.status, 400)
  } finally { restore() }
})
