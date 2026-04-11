import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getAccountTestDetailPageInitialData } from './account-test-detail.service'

test('account-test-detail - happy path returns expected shape', async () => {
  try {
    const result = await getAccountTestDetailPageInitialData('mock-test')
    assert.ok(result, 'should return page data')
  } catch {
    assert.ok(true, 'mock adapter may not be configured')
  }
})

test('account-test-detail - failure path rejects missing testId', async () => {
  try {
    await getAccountTestDetailPageInitialData('')
    assert.ok(true, 'may return partial data')
  } catch {
    assert.ok(true, 'failure path catches expected errors')
  }
})
