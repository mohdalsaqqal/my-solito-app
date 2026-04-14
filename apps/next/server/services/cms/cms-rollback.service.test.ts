import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { rollbackRelease } from './cms-rollback.service'

describe('cms-rollback.service', () => {
  it('rejects empty release ids before reaching providers', async () => {
    const result = await rollbackRelease('   ')
    assert.equal(result.ok, false)
    assert.equal(result.error, 'RELEASE_ID_REQUIRED')
  })
})
