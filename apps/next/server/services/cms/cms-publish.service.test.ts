import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { publishRelease } from './cms-publish.service'

describe('cms-publish.service', () => {
  it('rejects empty release ids before reaching providers', async () => {
    const result = await publishRelease('   ')
    assert.equal(result.ok, false)
    assert.equal(result.error, 'RELEASE_ID_REQUIRED')
  })
})
