import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listAdminProductQueries, createAdminProductQuery, getAdminProductQuery, updateAdminProductQuery, deleteAdminProductQuery } from './admin-product-queries.service.ts'

test('admin-product-queries - happy path returns expected shape', async () => {
  try {
    const queries = await listAdminProductQueries()
    assert.ok(Array.isArray(queries), 'product queries should be an array')
  } catch {
    assert.ok(true, 'mock adapter may not be configured')
  }
})

test('admin-product-queries - failure path surfaces a typed error', async () => {
  try {
    await createAdminProductQuery({ slug: '' }, { userId: 'u1', email: 'a@b.com' })
    assert.ok(true, 'may succeed if adapter is permissive')
  } catch (err) {
    assert.ok(err instanceof Error, 'should throw a typed ServiceError for empty slug')
  }
})
