// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'

import { GET as listProfiles, POST as createProfile } from './route'
import { PATCH as updateProfile } from './[id]/route'
import { POST as regenerateProfile } from './[id]/regenerate/route'
import { buildAuthSessionCookieHeader } from '../../../_lib/auth-session'

const DATA_DIR = path.join(process.cwd(), '.data')
const PROFILE_FILE = path.join(DATA_DIR, 'referral-profile-store.json')
const adminCookie = buildAuthSessionCookieHeader({
  userId: 'admin-1',
  email: 'marketing@realcosmetics.local',
  name: 'Marketing Admin',
  role: 'marketing',
})

async function cleanup() {
  await fs.rm(PROFILE_FILE, { force: true })
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = req.url ?? ''
    const chunks: Uint8Array[] = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const body = chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : undefined

    let webResponse: Response
    if (req.method === 'GET' && url === '/api/admin/referral/profiles') {
      webResponse = await listProfiles(
        new Request(`http://localhost${url}`, {
          method: 'GET',
          headers: {
            cookie: req.headers.cookie || '',
            origin: 'http://localhost',
            'sec-fetch-site': 'same-origin',
          },
        })
      )
    } else if (req.method === 'POST' && url === '/api/admin/referral/profiles') {
      webResponse = await createProfile(
        new Request(`http://localhost${url}`, {
          method: 'POST',
          headers: {
            cookie: req.headers.cookie || '',
            'content-type': req.headers['content-type'] || 'application/json',
            origin: 'http://localhost',
            'sec-fetch-site': 'same-origin',
          },
          body,
        }),
      )
    } else if (req.method === 'POST' && url === '/api/admin/referral/profiles/ref-prof-u-1/regenerate') {
      webResponse = await regenerateProfile(
        new Request(`http://localhost${url}`, {
          method: 'POST',
          headers: {
            cookie: req.headers.cookie || '',
            'content-type': req.headers['content-type'] || 'application/json',
            origin: 'http://localhost',
            'sec-fetch-site': 'same-origin',
          },
          body,
        }),
        { params: Promise.resolve({ id: 'ref-prof-u-1' }) }
      )
    } else if (req.method === 'PATCH' && url === '/api/admin/referral/profiles/ref-prof-u-2') {
      webResponse = await updateProfile(
        new Request(`http://localhost${url}`, {
          method: 'PATCH',
          headers: {
            cookie: req.headers.cookie || '',
            'content-type': req.headers['content-type'] || 'application/json',
            origin: 'http://localhost',
            'sec-fetch-site': 'same-origin',
          },
          body,
        }),
        { params: Promise.resolve({ id: 'ref-prof-u-2' }) }
      )
    } else {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    res.statusCode = webResponse.status
    webResponse.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(await webResponse.text())
  })
}

test('GET /api/admin/referral/profiles returns referral profiles', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()
  const response = await request(server)
    .get('/api/admin/referral/profiles')
    .set('Cookie', adminCookie)

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.ok(Array.isArray(response.body.data))
  assert.equal(response.body.data[0].id, 'ref-prof-u-1')
})

test('PATCH /api/admin/referral/profiles/[id] updates approval and actor type', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()
  const response = await request(server)
    .patch('/api/admin/referral/profiles/ref-prof-u-2')
    .set('Cookie', adminCookie)
    .send({
      approved: true,
      actorType: 'influencer',
      displayName: 'Creator Two',
    })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.approved, true)
  assert.equal(response.body.data.actorType, 'influencer')
  assert.equal(response.body.data.displayName, 'Creator Two')
})

test('POST /api/admin/referral/profiles creates a referral profile for a selected user', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()
  const response = await request(server)
    .post('/api/admin/referral/profiles')
    .set('Cookie', adminCookie)
    .send({
      userId: 'role-customer',
      displayName: 'Customer User',
      actorType: 'influencer',
      approved: true,
      audienceCount: 3200,
    })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.displayName, 'Customer User')
  assert.equal(response.body.data.actorType, 'influencer')
  assert.equal(response.body.data.approved, true)
  assert.match(response.body.data.shareLink, /\/r\//)
})

test('POST /api/admin/referral/profiles/[id]/regenerate rotates the code and share link', { concurrency: false }, async () => {
  await cleanup()
  const server = createServer()
  const response = await request(server)
    .post('/api/admin/referral/profiles/ref-prof-u-1/regenerate')
    .set('Cookie', adminCookie)

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.notEqual(response.body.data.code, 'GLOWWITHU1')
  assert.match(response.body.data.shareLink, /\/r\//)
})
