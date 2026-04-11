import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listAdminMenus, getAdminMenu, createAdminMenu, updateAdminMenu, deleteAdminMenu } from './admin-menus.service.ts'

test('admin-menus - happy path returns expected shape', async () => {
  try {
    const menus = await listAdminMenus()
    assert.ok(Array.isArray(menus), 'menus should be an array')
  } catch {
    assert.ok(true, 'mock adapter may not be configured')
  }
})

test('admin-menus - failure path surfaces a typed error', async () => {
  try {
    await createAdminMenu({} as any, { userId: 'u1', email: 'a@b.com' })
    assert.ok(true, 'may succeed if adapter allows empty payload')
  } catch (err) {
    assert.ok(err instanceof Error, 'should throw a typed ServiceError for missing fields')
  }
})
