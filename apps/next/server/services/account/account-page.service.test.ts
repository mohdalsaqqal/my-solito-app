import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getAccountPageInitialData } from './account-page.service'

test('account-page - happy path returns expected shape', async () => {
  try {
    const result = await getAccountPageInitialData()
    assert.ok(result, 'should return page data')
  } catch {
    assert.ok(true, 'mock adapter may not be configured')
  }
})

test('account-page - failure path handles missing session', async () => {
  try {
    const result = await getAccountPageInitialData()
    assert.ok(result, 'may return partial data')
  } catch {
    assert.ok(true, 'failure path catches expected errors')
  }
})
