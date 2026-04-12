// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GET, PUT } from './route'
import { buildAuthSessionCookieHeader } from '../../../_lib/auth-session'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const APPS_NEXT_ROOT = path.resolve(TEST_DIR, '../../../../..')
const DATA_DIR = path.join(APPS_NEXT_ROOT, '.data')
const PROGRAM_FILE = path.join(DATA_DIR, 'referral-program-store.json')
const adminCookie = buildAuthSessionCookieHeader({
  userId: 'admin-1',
  email: 'marketing@realcosmetics.local',
  name: 'Marketing Admin',
  role: 'marketing',
})

async function cleanup() {
  await fs.rm(PROGRAM_FILE, { force: true })
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = req.url ?? ''
    if (url !== '/api/admin/referral/settings') {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    const chunks: Uint8Array[] = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const body = chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : undefined
    const handler = req.method === 'PUT' ? PUT : GET
    const webResponse = await handler(
      new Request(`http://localhost${url}`, {
        method: req.method,
        headers: {
          cookie: req.headers.cookie || '',
          'content-type': req.headers['content-type'] || 'application/json',
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

test('GET /api/admin/referral/settings returns current referral program settings', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()

  const response = await request(server)
    .get('/api/admin/referral/settings')
    .set('Cookie', adminCookie)

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.mode, 'influencers_only')
})

test('PUT /api/admin/referral/settings updates reward policy fields', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()

  const response = await request(server)
    .put('/api/admin/referral/settings')
    .set('Cookie', adminCookie)
    .send({
      mode: 'all_users',
      policy: {
        followerReward: { type: 'fixed_discount', value: 15 },
        minimumOrderAmount: 40,
      },
    })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.mode, 'all_users')
  assert.equal(response.body.data.policy.followerReward.type, 'fixed_discount')
  assert.equal(response.body.data.policy.minimumOrderAmount, 40)
})
