// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { GET } from './route'
import { cmsProvider } from '@real/providers'

function createCmsServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'GET' || req.url !== '/api/cms/home') {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    const webResponse = await GET(new Request('http://localhost/api/cms/home'))
    res.statusCode = webResponse.status
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    res.end(await webResponse.text())
  })
}

test('GET /api/cms/home returns success payload', { concurrency: false }, async () => {
  const server = createCmsServer()
  const response = await request(server).get('/api/cms/home')

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(Array.isArray(response.body.data.heroSlides), true)
  assert.equal(typeof response.body.data.shell, 'object')
  assert.equal(typeof response.body.data.quoteId, 'undefined')
})

test('GET /api/cms/home returns normalized failure payload', { concurrency: false }, async () => {
  const originalGetHome = cmsProvider.getHome

  cmsProvider.getHome = async () => ({
    ok: false,
    error: {
      code: 'CMS_DOWN',
      message: 'CMS unavailable',
    },
  })

  try {
    const server = createCmsServer()
    const response = await request(server).get('/api/cms/home')

    assert.equal(response.status, 500)
    assert.equal(response.body.success, false)
    assert.equal(response.body.error.code, 'CMS_DOWN')
    assert.equal(response.body.error.message, 'CMS unavailable')
  } finally {
    cmsProvider.getHome = originalGetHome
  }
})
