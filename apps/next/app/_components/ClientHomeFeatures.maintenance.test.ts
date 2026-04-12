import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const FILE_PATH = path.join(
  process.cwd(),
  'apps',
  'next',
  'app',
  '_components',
  'ClientHomeFeatures.tsx',
)

test('web home shell shows a storefront maintenance panel when critical home data is unavailable', async () => {
  const source = await fs.readFile(FILE_PATH, 'utf8')

  assert.match(source, /const homeUnavailable = Boolean\(error\) && \(!cmsHome \|\| products\.length === 0\)/)
  assert.match(source, /<StorefrontStatusPanel[\s\S]{0,400}onRetry=\{\(\) => \{[\s\S]{0,120}loadCmsData\(\)/)
})
