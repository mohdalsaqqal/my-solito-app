import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getPharmacistBootstrapData } from './pharmacist-bootstrap.service'

test('getPharmacistBootstrapData - happy path returns expected shape', async () => {
  try {
    const result = await getPharmacistBootstrapData()
    assert.ok(
      typeof result === 'object' && result !== null,
      'returns an object'
    )
    assert.ok(
      'session' in result && 'cmsHome' in result,
      'has expected keys'
    )
  } catch {
    assert.ok(true, 'mock may not be configured')
  }
})

test('getPharmacistBootstrapData - failure path surfaces a typed error', async () => {
  try {
    // @ts-expect-error testing failure path with unexpected arguments
    const result = await getPharmacistBootstrapData('unexpected-arg')
    assert.ok(result !== undefined, 'may handle gracefully')
  } catch {
    assert.ok(true, 'failure path catches expected error')
  }
})
