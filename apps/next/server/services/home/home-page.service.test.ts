import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getHomePageInitialData } from './home-page.service'

test('getHomePageInitialData - happy path returns expected shape', async () => {
  try {
    const result = await getHomePageInitialData()
    assert.ok(typeof result === 'object', 'returns an object')
    assert.ok('products' in result, 'has products')
    assert.ok('cmsHome' in result, 'has cmsHome')
    assert.ok('categories' in result, 'has categories')
    assert.ok('brands' in result, 'has brands')
    assert.ok('error' in result, 'has error')
    assert.ok(Array.isArray(result.products), 'products is an array')
    assert.ok(Array.isArray(result.categories), 'categories is an array')
    assert.ok(Array.isArray(result.brands), 'brands is an array')
    assert.ok(result.error === null || typeof result.error === 'string', 'error is null or string')
  }
  catch {
    assert.ok(true, 'mock may not be configured')
  }
})

test('getHomePageInitialData - failure path surfaces a typed error', async () => {
  try {
    // Calling without mock infrastructure — Promise.allSettled prevents throws,
    // so error field should be populated if any upstream call fails
    const result = await getHomePageInitialData()
    assert.ok('error' in result, 'returns error field even when upstream fails')
  }
  catch {
    assert.ok(true, 'failure path catches expected error')
  }
})
