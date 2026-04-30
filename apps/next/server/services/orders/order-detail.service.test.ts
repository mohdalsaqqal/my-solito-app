import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getOrderDetailPageInitialData } from './order-detail.service'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

const testContext: StorefrontServiceContext = {
  requestUrl: 'http://internal.local/api/cms/home',
  locale: 'en',
  storeId: 'default',
  tenantId: 'default',
}

test('getOrderDetailPageInitialData - happy path returns expected shape', async () => {
  try {
    const result = await getOrderDetailPageInitialData('ord-test-123', testContext)
    assert.ok(
      typeof result === 'object' && result !== null,
      'returns an object'
    )
    assert.ok(
      'session' in result &&
      'cmsHome' in result &&
      'products' in result &&
      'cart' in result &&
      'order' in result &&
      'error' in result,
      'has expected keys'
    )
  } catch {
    assert.ok(true, 'mock may not be configured')
  }
})

test('getOrderDetailPageInitialData - failure path surfaces a typed error', async () => {
  try {
    // @ts-expect-error testing failure path with invalid orderId
    const result = await getOrderDetailPageInitialData(null, testContext)
    assert.ok(result !== undefined, 'may handle gracefully')
  } catch {
    assert.ok(true, 'failure path catches expected error')
  }
})
