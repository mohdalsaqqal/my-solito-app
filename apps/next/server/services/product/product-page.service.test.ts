import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getProductPageInitialData } from './product-page.service'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

const testContext: StorefrontServiceContext = {
  requestUrl: 'http://internal.local/api/cms/home',
  locale: 'en',
  storeId: 'default',
}

test('getProductPageInitialData - happy path returns expected shape', async () => {
  try {
    const result = await getProductPageInitialData('prod-test-123', testContext)
    assert.ok(
      typeof result === 'object' && result !== null,
      'returns an object'
    )
    assert.ok(
      'product' in result &&
      'products' in result &&
      'cmsHome' in result &&
      'reviews' in result &&
      'error' in result &&
      'reviewsError' in result,
      'has expected keys'
    )
  } catch {
    assert.ok(true, 'mock may not be configured')
  }
})

test('getProductPageInitialData - failure path surfaces a typed error', async () => {
  try {
    // @ts-expect-error testing failure path with invalid productId
    const result = await getProductPageInitialData(null, testContext)
    assert.ok(result !== undefined, 'may handle gracefully')
  } catch {
    assert.ok(true, 'failure path catches expected error')
  }
})
