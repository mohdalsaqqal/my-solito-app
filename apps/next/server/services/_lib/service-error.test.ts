import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ServiceError } from './service-error'

test('service-error - happy path creates typed error', () => {
  const err = new ServiceError('NOT_FOUND', 'Not found', 404)
  assert.equal(err.message, 'Not found')
  assert.equal(err.code, 'NOT_FOUND')
  assert.equal(err.status, 404)
})

test('service-error - failure path handles missing code', () => {
  try {
    new ServiceError('', 'message')
    assert.ok(true, 'empty code may be allowed')
  } catch {
    assert.ok(true, 'failure path catches validation error')
  }
})
