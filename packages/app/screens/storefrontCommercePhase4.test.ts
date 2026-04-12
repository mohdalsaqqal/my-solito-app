import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SCREENS_DIR = path.join(process.cwd(), 'packages', 'app', 'screens')

async function readScreen(fileName: string) {
  return fs.readFile(path.join(SCREENS_DIR, fileName), 'utf8')
}

test('cart screen uses bordered flat cards and neutral summary values', async () => {
  const source = await readScreen('CartScreen.tsx')

  assert.match(source, /variant='flat'/)
  assert.match(source, /borderWidth: borderWidth\.thin/)
  assert.match(source, /borderColor: colors\.border/)
  assert.doesNotMatch(source, /tone=\{emphasis \? 'default' : 'danger'\}/)
})

test('checkout screen uses bordered neutral panels instead of black or blush-heavy sections', async () => {
  const source = await readScreen('CheckoutScreen.tsx')

  assert.match(source, /backgroundColor: index === 3 \? colors\.brandPrimarySubtle : colors\.surface/)
  assert.match(source, /borderColor: index === 3 \? colors\.brandPrimary : colors\.border/)
  assert.match(source, /backgroundColor: colors\.surfaceMuted/)
  assert.doesNotMatch(source, /backgroundColor: colors\.textPrimary/)
})

test('account screen uses bordered navigation and content cards', async () => {
  const source = await readScreen('AccountScreen.tsx')

  assert.match(source, /backgroundColor: activeTab === tab\.key \? colors\.brandPrimarySubtle : colors\.surface/)
  assert.match(source, /borderColor: activeTab === tab\.key \? colors\.brandPrimary : colors\.border/)
  assert.match(source, /variant='flat'/)
})

test('product screen uses bordered PDP utility surfaces', async () => {
  const source = await readScreen('ProductScreen.tsx')

  assert.match(source, /variant=\{active \? 'outline' : 'secondaryQuiet'\}/)
  assert.match(source, /variant=\{active \? 'outline' : 'ghost'\}/)
  assert.match(source, /shape='pill'/)
  assert.match(source, /overflow: 'hidden'/)
})
