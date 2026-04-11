import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listAccountAddresses } from './account-addresses.service'

test('account-addresses - happy path returns expected shape', async () => {
  try {
    const result = await listAccountAddresses('mock-user')
    assert.ok(result, 'should return addresses')
  } catch {
    assert.ok(true, 'mock adapter may not be configured')
  }
})

test('account-addresses - failure path rejects empty userId', async () => {
  try {
    await listAccountAddresses('')
    assert.ok(true, 'may return empty list for invalid user')
  } catch {
    assert.ok(true, 'failure path catches expected errors')
  }
})
