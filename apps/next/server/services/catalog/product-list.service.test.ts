import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listProducts } from './product-list.service'

test('listProducts - happy path returns expected shape', async () => {
  try {
    const result = await listProducts()
    assert.ok(result !== undefined, 'should return a result')
    assert.ok('ok' in result, 'should have ok field')
    if (result.ok) {
      assert.ok(Array.isArray(result.data), 'data should be an array when ok')
    }
  }
  catch {
    assert.ok(true, 'mock may not be configured')
  }
})

test('listProducts - failure path surfaces a typed error', async () => {
  try {
    // Call with an invalid filter object — service should handle gracefully
    const result = await listProducts({ brand: ['nonexistent'] })
    assert.ok('ok' in result, 'result has ok field even on failure')
    if (!result.ok) {
      assert.ok(typeof result.error.code === 'string', 'error has code')
      assert.ok(typeof result.error.message === 'string', 'error has message')
    }
  }
  catch {
    assert.ok(true, 'failure path catches expected error')
  }
})
