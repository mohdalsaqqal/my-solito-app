import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractHomeBlocks, hasPublishedBlocks } from './normalize-home-blocks'

test('extractHomeBlocks / hasPublishedBlocks - happy path returns expected shape', async () => {
  const cmsHome = {
    page: {
      blocks: [
        { position: 2, props: { type: 'hero', id: 'b1', position: 2 } as any },
        { position: 1, props: { type: 'promo_strip', id: 'b2', position: 1 } as any },
      ],
    },
  }

  const blocks = extractHomeBlocks(cmsHome)
  assert.ok(Array.isArray(blocks), 'extractHomeBlocks returns an array')
  assert.equal(blocks.length, 2, 'returns both blocks')
  assert.equal(blocks[0].type, 'promo_strip', 'sorted by position ascending')
  assert.equal(blocks[1].type, 'hero', 'second block is hero')

  const hasBlocks = hasPublishedBlocks(cmsHome)
  assert.equal(hasBlocks, true, 'hasPublishedBlocks returns true when blocks exist')
})

test('extractHomeBlocks / hasPublishedBlocks - failure path handles null and empty inputs', async () => {
  const emptyBlocks = extractHomeBlocks(null)
  assert.ok(Array.isArray(emptyBlocks), 'returns array for null input')
  assert.equal(emptyBlocks.length, 0, 'empty array for null')

  const undefinedBlocks = extractHomeBlocks(undefined)
  assert.ok(Array.isArray(undefinedBlocks), 'returns array for undefined input')
  assert.equal(undefinedBlocks.length, 0, 'empty array for undefined')

  const emptyPageBlocks = extractHomeBlocks({ page: { blocks: [] } })
  assert.equal(emptyPageBlocks.length, 0, 'empty array for empty blocks array')

  const noPublishedEmpty = hasPublishedBlocks(null)
  assert.equal(noPublishedEmpty, false, 'hasPublishedBlocks returns false for null')

  const noPublishedUndefined = hasPublishedBlocks(undefined)
  assert.equal(noPublishedUndefined, false, 'hasPublishedBlocks returns false for undefined')

  const noPublishedEmptyPage = hasPublishedBlocks({ page: { blocks: [] } })
  assert.equal(noPublishedEmptyPage, false, 'hasPublishedBlocks returns false for empty blocks')
})
