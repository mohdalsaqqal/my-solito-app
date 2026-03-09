// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { POST } from './route'
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
    if (req.method !== 'POST' || req.url !== '/api/admin/i18n/prefill') {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    const chunks = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const body = chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : '{}'

    const webResponse = await POST(
      new Request('http://localhost/api/admin/i18n/prefill', {
        method: 'POST',
        headers: {
          cookie: req.headers.cookie || '',
          'content-type': 'application/json',
        },
        body,
      })
    )

    res.statusCode = webResponse.status
    webResponse.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(await webResponse.text())
  })
}

test('POST /api/admin/i18n/prefill requires operations role', async () => {
  const server = createServer()
  const response = await request(server).post('/api/admin/i18n/prefill').send({ dryRun: true })

  assert.equal(response.status, 401)
  assert.equal(response.body.success, false)
})

test('POST /api/admin/i18n/prefill returns prefill result', async () => {
  const original = translationProvider.prefillMissingKeys
  translationProvider.prefillMissingKeys = async () => ({
    ok: true,
    data: {
      provider: 'crowdin',
      runAt: new Date().toISOString(),
      sourceLocale: 'en',
      targetLocale: 'ar',
      filledKeys: 12,
      missingBefore: 12,
      missingAfter: 0,
      dryRun: false,
    },
  })

  try {
    const server = createServer()
    const response = await request(server)
      .post('/api/admin/i18n/prefill')
      .set('Cookie', opsCookie)
      .send({ dryRun: false })

    assert.equal(response.status, 200)
    assert.equal(response.body.success, true)
    assert.equal(response.body.data.filledKeys, 12)
  } finally {
    translationProvider.prefillMissingKeys = original
  }
})
