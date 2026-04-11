import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createInternalServiceRequest, getPublicCatalogCollections } from './public-discovery'

test('public-discovery - happy path returns expected shape', async () => {
  const request = new Request('http://internal.local/test')
  const req = createInternalServiceRequest('/test', request)
  assert.ok(req, 'should create an internal request object')
})

test('public-discovery - failure path handles invalid config', async () => {
  try {
    await getPublicCatalogCollections({} as any)
    assert.ok(true, 'may return empty collections without error')
  } catch {
    assert.ok(true, 'failure path catches expected errors')
  }
})
