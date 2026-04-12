import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROUTE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'route.ts')

test('logo upload policy blocks SVG and limits accepted types to raster formats', async () => {
  const source = await fs.readFile(ROUTE_PATH, 'utf8')

  assert.doesNotMatch(source, /svg/i)
  assert.match(source, /Only JPEG, PNG and WebP images are accepted\./)
  assert.match(source, /MAX_SIZE_BYTES = 4 \* 1024 \* 1024/)
})
