import test from 'node:test'
import assert from 'node:assert/strict'
import { getOperationsHealth } from './health.service'

test('getOperationsHealth returns runtime, provider, search, and notification status', async () => {
  const health = await getOperationsHealth()

  assert.ok(['healthy', 'degraded', 'unhealthy'].includes(health.status))
  assert.ok(health.checkedAt)
  assert.equal(health.components.runtime.status, 'healthy')
  assert.ok(health.components.providers.meta?.readiness)
  assert.ok(health.components.search.message)
  assert.ok(health.components.notifications.message)
})
