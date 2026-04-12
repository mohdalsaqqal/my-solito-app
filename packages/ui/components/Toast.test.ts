import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SAFE_COMPONENTS = [
  'Toast.tsx',
  'Skeleton.tsx',
  'Sheet.tsx',
  'Switch.tsx',
  path.join('home-v2', 'CountdownTimer.tsx'),
]

test('home-safe shared UI components do not import moti so Next SSR avoids worklets at provider load time', async () => {
  const componentDir = path.join(process.cwd(), '..', '..', 'packages', 'ui', 'components')

  for (const fileName of SAFE_COMPONENTS) {
    const filePath = path.join(componentDir, fileName)
    const source = await fs.readFile(filePath, 'utf8')

    assert.equal(source.includes("from 'moti'"), false, `${fileName} should not import moti`)
    assert.equal(source.includes('from "moti"'), false, `${fileName} should not import moti`)
  }
})
