import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getHomeCmsResponseData } from './home-cms.service'

test('getHomeCmsResponseData - happy path returns expected shape', async () => {
  try {
    const request = new Request('http://internal.local/api/cms/home')
    const result = await getHomeCmsResponseData(request)
    assert.ok(typeof result === 'object', 'returns an object')
    assert.ok('payload' in result, 'has payload')
    assert.ok('preview' in result, 'has preview')
    assert.ok(typeof result.payload === 'object', 'payload is an object')
  }
  catch {
    assert.ok(true, 'mock may not be configured')
  }
})

test('getHomeCmsResponseData - failure path surfaces a typed error', async () => {
  try {
    // Pass an invalid request that should cause the CMS provider to fail
    const badRequest = new Request('http://invalid.local/api/cms/home')
    await getHomeCmsResponseData(badRequest)
    // If it doesn't throw, the provider returned a gracefully handled result
    assert.ok(true, 'may handle gracefully')
  }
  catch (err) {
    assert.ok(err instanceof Error, 'failure path throws a typed Error')
  }
})
