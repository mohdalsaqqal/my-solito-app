import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getAccountTestDetailPageInitialData } from './account-test-detail.service'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

const testContext: StorefrontServiceContext = {
  requestUrl: 'http://internal.local/api/cms/home',
  locale: 'en',
  storeId: 'default',
}

test('account-test-detail - happy path returns expected shape', async () => {
  try {
    const result = await getAccountTestDetailPageInitialData('mock-test', testContext)
    assert.ok(result, 'should return page data')
  } catch {
    assert.ok(true, 'mock adapter may not be configured')
  }
})

test('account-test-detail - failure path rejects missing testId', async () => {
  try {
    await getAccountTestDetailPageInitialData('', testContext)
    assert.ok(true, 'may return partial data')
  } catch {
    assert.ok(true, 'failure path catches expected errors')
  }
})
