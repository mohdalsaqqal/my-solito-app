import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROUTE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'route.ts')

test('block upload enforces empty/type/size validation contracts', async () => {
  const source = await fs.readFile(ROUTE_PATH, 'utf8')
  assert.match(source, /UPLOAD_EMPTY_FILE/)
  assert.match(source, /UPLOAD_INVALID_TYPE/)
  assert.match(source, /UPLOAD_TOO_LARGE/)
  assert.match(source, /Only JPEG, PNG and WebP images are accepted\./)
})
