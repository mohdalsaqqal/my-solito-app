import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { loadPreviewBlocks, resolvePreviewContext } from './cms-preview.service'

describe('cms-preview.service', () => {
  it('marks requests without a preview token as invalid preview context', () => {
    const context = resolvePreviewContext('https://example.com/en')
    assert.equal(context.valid, false)
    assert.equal(context.releaseId, null)
    assert.equal(context.versionId, null)
  })

  it('returns null preview blocks for invalid preview context', async () => {
    const blocks = await loadPreviewBlocks({ valid: false, releaseId: null, versionId: null }, 'default')
    assert.equal(blocks, null)
  })
})
