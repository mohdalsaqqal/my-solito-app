// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { GET } from './route'
import { buildAuthSessionCookieHeader } from '../../../_lib/auth-session'
import { translationProvider } from '@real/providers'

const opsCookie = buildAuthSessionCookieHeader({
  userId: 'ops-1',
  email: 'ops@realcosmetics.local',
  name: 'Ops User',
  role: 'ops',
})

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'GET' || req.url !== '/api/admin/i18n/status') {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    const webResponse = await GET(
      new Request('http://localhost/api/admin/i18n/status', {
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

test('GET /api/admin/i18n/status requires operations role', async () => {
  const server = createServer()
  const response = await request(server).get('/api/admin/i18n/status')

  assert.equal(response.status, 401)
  assert.equal(response.body.success, false)
})

test('GET /api/admin/i18n/status returns status payload', async () => {
  const original = translationProvider.getStatus
  translationProvider.getStatus = async () => ({
    ok: true,
    data: {
      provider: 'crowdin',
      connected: true,
      checkedAt: new Date().toISOString(),
      locales: [
        { locale: 'en', totalKeys: 10, missingKeys: 0, namespaces: [] },
        { locale: 'ar', totalKeys: 10, missingKeys: 3, namespaces: [] },
      ],
    },
  })

  try {
    const server = createServer()
    const response = await request(server)
      .get('/api/admin/i18n/status')
      .set('Cookie', opsCookie)

    assert.equal(response.status, 200)
    assert.equal(response.body.success, true)
    assert.equal(response.body.data.provider, 'crowdin')
  } finally {
    translationProvider.getStatus = original
  }
})
