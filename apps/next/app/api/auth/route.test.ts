// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { GET as sessionGET } from './session/route'
import { POST as loginPOST } from './login/route'
import { POST as registerPOST } from './register/route'
import { POST as logoutPOST } from './logout/route'

async function toWebRequest(req: http.IncomingMessage) {
  const chunks: Uint8Array[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const body = chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : undefined
  const url = `http://localhost${req.url || '/'}`
  return new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: body && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
  })
}

function createAuthServer() {
  return http.createServer(async (req, res) => {
    const method = req.method || 'GET'
    const url = req.url || '/'

    let webResponse: Response | null = null

    if (method === 'GET' && url === '/api/auth/session') {
      const webRequest = await toWebRequest(req)
      webResponse = await sessionGET(webRequest)
    }

    if (method === 'POST' && url === '/api/auth/login') {
      const webRequest = await toWebRequest(req)
      webResponse = await loginPOST(webRequest)
    }

    if (method === 'POST' && url === '/api/auth/register') {
      const webRequest = await toWebRequest(req)
      webResponse = await registerPOST(webRequest)
    }

    if (method === 'POST' && url === '/api/auth/logout') {
      const webRequest = await toWebRequest(req)
      webResponse = await logoutPOST(webRequest)
    }

    if (!webResponse) {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    res.statusCode = webResponse.status
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    res.end(await webResponse.text())
  })
}

test('auth flow: register -> session -> logout', async () => {
  const server = createAuthServer()

  const registerResponse = await request(server)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test.user@example.com',
      password: 'secret123',
    })

  assert.equal(registerResponse.status, 201)
  assert.equal(registerResponse.body.success, true)
  assert.equal(registerResponse.body.data.email, 'test.user@example.com')

  const setCookie = registerResponse.headers['set-cookie']?.[0]
  assert.equal(typeof setCookie, 'string')

  const sessionResponse = await request(server)
    .get('/api/auth/session')
    .set('Cookie', setCookie)

  assert.equal(sessionResponse.status, 200)
  assert.equal(sessionResponse.body.success, true)
  assert.equal(sessionResponse.body.data.email, 'test.user@example.com')

  const logoutResponse = await request(server)
    .post('/api/auth/logout')
    .set('Cookie', setCookie)

  assert.equal(logoutResponse.status, 200)
  assert.equal(logoutResponse.body.success, true)
  assert.equal(logoutResponse.body.data.accepted, true)

  const clearCookie = logoutResponse.headers['set-cookie']?.[0] || ''
  assert.equal(clearCookie.includes('Max-Age=0'), true)
})

test('POST /api/auth/login returns failure for invalid credentials', async () => {
  const server = createAuthServer()

  const response = await request(server)
    .post('/api/auth/login')
    .send({
      email: 'missing@example.com',
      password: 'wrongpass',
    })

  assert.equal(response.status, 401)
  assert.equal(response.body.success, false)
  assert.equal(response.body.error.code, 'AUTH_INVALID_CREDENTIALS')
})

test('POST /api/auth/login accepts seeded shorthand users', async () => {
  const server = createAuthServer()

  const response = await request(server)
    .post('/api/auth/login')
    .send({
      email: 'admin',
      password: 'admin',
    })

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.role, 'admin')
})
