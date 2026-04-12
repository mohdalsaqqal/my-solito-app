// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { POST } from './route'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const APPS_NEXT_ROOT = path.resolve(TEST_DIR, '../../../..')
const DATA_DIR = path.join(APPS_NEXT_ROOT, '.data')
const PROGRAM_FILE = path.join(DATA_DIR, 'referral-program-store.json')
const PROFILE_FILE = path.join(DATA_DIR, 'referral-profile-store.json')

async function cleanup() {
  await fs.rm(PROGRAM_FILE, { force: true })
  await fs.rm(PROFILE_FILE, { force: true })
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/api/referral/validate') {
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
      new Request('http://localhost/api/referral/validate', {
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

test('POST /api/referral/validate returns reward preview for eligible referral code', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()

  const response = await request(server)
    .post('/api/referral/validate')
    .send({
      code: 'GLOWWITHU1',
      cartSubtotal: 100,
      currency: 'USD',
    })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.eligible, true)
  assert.equal(response.body.data.code, 'GLOWWITHU1')
  assert.equal(response.body.data.rewardPreview.type, 'percentage_discount')
})

test('POST /api/referral/validate rejects disabled program', { concurrency: false }, async () => {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(
    PROGRAM_FILE,
    JSON.stringify({
      default: {
        storeId: 'default',
        mode: 'off',
        accessMode: 'link_and_code',
        policy: {
          followerReward: { type: 'percentage_discount', value: 10 },
          influencerReward: { type: 'commission_percentage', value: 12 },
          attributionWindowDays: 30,
          firstOrderOnly: true,
          allowStackingWithPromotions: false,
          minimumOrderAmount: 25,
        },
        updatedAt: new Date().toISOString(),
      },
    }),
    'utf8'
  )

  const server = createServer()
  const response = await request(server)
    .post('/api/referral/validate')
    .send({
      code: 'GLOWWITHU1',
      cartSubtotal: 100,
      currency: 'USD',
    })

  assert.equal(response.status, 400)
  assert.equal(response.body.success, false)
  assert.equal(response.body.error.code, 'PROGRAM_DISABLED')
})

test('POST /api/referral/validate rejects unapproved profile in influencers_only mode', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()

  const response = await request(server)
    .post('/api/referral/validate')
    .send({
      code: 'SHAREU2',
      cartSubtotal: 100,
      currency: 'USD',
    })

  assert.equal(response.status, 400)
  assert.equal(response.body.success, false)
  assert.equal(response.body.error.code, 'REFERRAL_PROFILE_NOT_APPROVED')
})
