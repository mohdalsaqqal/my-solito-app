import test from 'node:test'
import assert from 'node:assert/strict'
import { providerEnvironment, providerReadiness } from './registry'

test('provider readiness map exposes explicit tiers for release-sensitive domains', () => {
  assert.equal(providerReadiness.product.tier, 'release-ready')
  assert.equal(providerReadiness.category.tier, 'release-ready')
  assert.equal(providerReadiness.brand.tier, 'release-ready')
  assert.equal(providerReadiness.order.tier, 'release-ready')
})

test('provider environment exposes runtime selection flags', () => {
  assert.equal(typeof providerEnvironment.useMock, 'boolean')
  assert.equal(typeof providerEnvironment.useNetworksMock, 'boolean')
  assert.equal(typeof providerEnvironment.isReleaseLikeEnvironment, 'boolean')
  assert.equal(typeof providerEnvironment.appEnv, 'string')
})

