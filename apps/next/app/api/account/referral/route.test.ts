// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'

import { GET } from './route'
import { buildAuthSessionCookieHeader } from '../../_lib/auth-session'

const DATA_DIR = path.join(process.cwd(), '.data')
const PROGRAM_FILE = path.join(DATA_DIR, 'referral-program-store.json')
const PROFILE_FILE = path.join(DATA_DIR, 'referral-profile-store.json')

const sessionCookie = buildAuthSessionCookieHeader({
  userId: 'u-1',
  email: 'user@realcosmetics.local',
  name: 'Customer User',
  role: 'customer',
})

const SEED_PROFILES = [
  {
    id: 'ref-prof-u-1',
    storeId: 'default',
    userId: 'u-1',
    userEmail: 'user@realcosmetics.local',
    actorType: 'influencer',
    code: 'GLOWWITHU1',
    shareLink: 'https://realcosmetics.local/r/GLOWWITHU1',
    approved: true,
    displayName: 'Customer User',
    audienceCount: 18200,
    createdAt: '2026-03-29T08:40:51.217Z',
  },
  {
    id: 'ref-prof-u-2',
    storeId: 'default',
    userId: 'u-2',
    userEmail: 'admin@realcosmetics.local',
    actorType: 'customer',
    code: 'SHAREU2',
    shareLink: 'https://realcosmetics.local/r/SHAREU2',
    approved: false,
    displayName: 'Customer Two',
    audienceCount: 120,
    createdAt: '2026-03-29T08:40:51.217Z',
  },
]

async function cleanup() {
  await fs.rm(PROGRAM_FILE, { force: true })
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(PROFILE_FILE, JSON.stringify(SEED_PROFILES, null, 2), 'utf8')
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'GET' || req.url !== '/api/account/referral') {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    const webResponse = await GET(
      new Request('http://localhost/api/account/referral', {
        method: 'GET',
        headers: {
          cookie: req.headers.cookie || '',
        },
      })
    )

    res.statusCode = webResponse.status
    webResponse.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(await webResponse.text())
  })
}

test('GET /api/account/referral returns normalized referral summary for eligible user', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()

  const response = await request(server)
    .get('/api/account/referral')
    .set('Cookie', sessionCookie)

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.visible, true)
  assert.equal(response.body.data.programMode, 'influencers_only')
  assert.equal(response.body.data.code, 'GLOWWITHU1')
  assert.equal(typeof response.body.data.analytics.attributedOrders, 'number')
  assert.ok(Array.isArray(response.body.data.recentActivity))
})

test('GET /api/account/referral hides referral summary when program is disabled', { concurrency: false }, async () => {
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
    .get('/api/account/referral')
    .set('Cookie', sessionCookie)

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.visible, false)
  assert.equal(response.body.data.programMode, 'off')
  assert.equal(response.body.data.code, undefined)
})
