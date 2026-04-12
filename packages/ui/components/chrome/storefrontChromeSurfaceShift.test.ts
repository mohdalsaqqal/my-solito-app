import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const CHROME_DIR = path.join(process.cwd(), 'packages', 'ui', 'components', 'chrome')

async function readChromeFile(fileName: string) {
  return fs.readFile(path.join(CHROME_DIR, fileName), 'utf8')
}

test('search panel uses a bordered neutral surface instead of a shadow-first raised panel', async () => {
  const source = await readChromeFile('SearchPanel.tsx')

  assert.match(source, /variant='flat'/)
  assert.match(source, /borderWidth: borderWidth\.thin/)
  assert.match(source, /borderColor: colors\.border/)
  assert.doesNotMatch(source, /\.\.\.\(shadows\.md as object\)/)
})

test('footer newsletter uses a functional red CTA instead of blush decorative fill', async () => {
  const source = await readChromeFile('FooterNewsletter.tsx')

  assert.match(source, /backgroundColor: active \? colors\.brandPrimaryHover : colors\.brandPrimary/)
  assert.match(source, /color=\{colors\.white\}/)
  assert.doesNotMatch(source, /colors\.popBlush/)
})

test('header main row preserves the legacy ink storefront header structure', async () => {
  const source = await readChromeFile('HeaderMainRow.tsx')

  assert.match(source, /backgroundColor: colors\.inkBlack/)
  assert.match(source, /const searchInputHeight = Math\.round/)
  assert.match(source, /variant='title' tone='inkFrost'/)
  assert.match(source, /variant='h2' tone='inkFrost'/)
  assert.match(source, /onPressLocale/)
  assert.match(source, /emphasized/)
})

test('storefront maintenance panel uses soft storefront surfaces instead of a plain fallback card', async () => {
  const source = await readChromeFile('StorefrontStatusPanel.tsx')

  assert.match(source, /backgroundColor: colors\.backgroundSecondary/)
  assert.match(source, /backgroundColor: colors\.surfaceMuted/)
  assert.match(source, /backgroundColor: colors\.brandPrimarySubtle/)
  assert.match(source, /<Button size='lg' shape='pill' onPress=\{onRetry\}>/)
})
