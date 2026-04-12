import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const filePath = path.join(
  process.cwd(),
  'packages',
  'ui',
  '_reference',
  'SephoraReferenceHome.tsx',
)

test('SephoraReferenceHome phase 3 shifts live homepage controls toward neutral storefront surfaces', async () => {
  const source = await fs.readFile(filePath, 'utf8')

  assert.match(source, /backgroundColor: active \? colors\.brandPrimarySubtle : colors\.surface/)
  assert.match(source, /borderColor: active \? colors\.brandPrimary : colors\.border/)
  assert.match(source, /backgroundColor: colors\.surfaceMuted,\n\s+borderWidth: borderWidth\.thin,\n\s+borderColor: colors\.border/)
  assert.doesNotMatch(source, /backgroundColor: active \? colors\.inkBlack : 'rgba\(15, 15, 17, 0\.52\)'/)
})
