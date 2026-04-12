import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const FILE_PATH = path.join(
  process.cwd(),
  'apps',
  'expo',
  'app',
  'index.tsx',
)

test('expo home view swaps to the storefront maintenance panel when critical home data fails', async () => {
  const source = await fs.readFile(FILE_PATH, 'utf8')

  assert.match(source, /const homeUnavailable = Boolean\(error\) && \(!cmsHome \|\| products\.length === 0\)/)
  assert.match(source, /if \(view === 'home' && homeUnavailable\) \{[\s\S]{0,400}<StorefrontStatusPanel/)
  assert.match(source, /onRetry=\{\(\) => \{[\s\S]{0,120}loadProducts\(\)/)
})
