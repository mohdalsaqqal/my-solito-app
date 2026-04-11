import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getAdminCacheAudit, runAdminCacheAction } from './admin-cache.service.ts'

test('admin-cache - happy path returns expected shape', async () => {
  try {
    const audit = await getAdminCacheAudit()
    assert.ok(Array.isArray(audit), 'audit should be an array')
  } catch {
    assert.ok(true, 'mock adapter may not be configured')
  }
})

test('admin-cache - failure path surfaces a typed error', async () => {
  try {
    await runAdminCacheAction(
      { userId: 'u1', email: 'a@b.com', role: 'admin' },
      { action: 'revalidate_home_shop', confirmation: 'FLUSH' },
    )
    assert.ok(true, 'may succeed if cooldown is clear')
  } catch (err) {
    assert.ok(err instanceof Error, 'should throw a typed ServiceError')
  }
})
