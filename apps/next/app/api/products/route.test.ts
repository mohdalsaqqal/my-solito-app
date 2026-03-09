// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import request from 'supertest'
import { GET } from './route'

function createProductsServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'GET' || req.url !== '/api/products') {
      res.statusCode = 404
      res.end('Not Found')
      return
    }

    const webResponse = await GET(new Request('http://localhost/api/products'))
    res.statusCode = webResponse.status
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    res.end(await webResponse.text())
  })
}

test('GET /api/products returns success with product list', async () => {
  const server = createProductsServer()
  const response = await request(server).get('/api/products')

  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(Array.isArray(response.body.data), true)
  assert.equal(response.body.data.length > 0, true)
})
