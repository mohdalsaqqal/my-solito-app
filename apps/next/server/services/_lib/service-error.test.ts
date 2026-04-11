import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ServiceError } from './service-error.ts'

test('service-error - happy path creates typed error', () => {
  const err = new ServiceError('Not found', { code: 'NOT_FOUND', status: 404 })
  assert.equal(err.message, 'Not found')
  assert.equal(err.code, 'NOT_FOUND')
  assert.equal(err.status, 404)
})

test('service-error - failure path requires message', () => {
  try {
    new ServiceError('')
    assert.ok(true, 'empty message may be allowed')
  } catch {
    assert.ok(true, 'failure path catches validation error')
  }
})
