// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'

import { POST } from './route'
import { buildAuthSessionCookieHeader } from '../../_lib/auth-session'

const DATA_DIR = path.join(process.cwd(), '.data')
const PROFILE_FILE = path.join(DATA_DIR, 'referral-profile-store.json')
const LEDGER_FILE = path.join(DATA_DIR, 'referral-ledger-store.json')

const sessionCookie = buildAuthSessionCookieHeader({
  userId: 'u-9',
  email: 'shopper@realcosmetics.local',
  name: 'Referral Shopper',
  role: 'customer',
})

async function cleanup() {
  await fs.rm(PROFILE_FILE, { force: true })
  await fs.rm(LEDGER_FILE, { force: true })
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/api/referral/apply') {
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
      new Request('http://localhost/api/referral/apply', {
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

test('POST /api/referral/apply creates pending referral attribution for authenticated user', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()

  const response = await request(server)
    .post('/api/referral/apply')
    .set('Cookie', sessionCookie)
    .send({
      code: 'GLOWWITHU1',
      cartSubtotal: 110,
      currency: 'USD',
    })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.applied, true)
  assert.equal(response.body.data.code, 'GLOWWITHU1')
  assert.equal(response.body.data.status, 'pending')
  assert.equal(typeof response.body.data.ledgerEntryId, 'string')
})
