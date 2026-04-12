import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

import { colors } from './colors'

test('storefront phase 1 surface tokens use the approved neutral marketplace palette', async () => {
  assert.equal(colors.background, 'hsl(0 0% 100%)')
  assert.equal(colors.backgroundSecondary, 'hsl(0 0% 96%)')
  assert.equal(colors.surface, 'hsl(0 0% 100%)')
  assert.equal(colors.surfaceMuted, 'hsl(210 20% 98%)')
  assert.equal(colors.border, 'hsla(0 0% 0% / 0.10)')
  assert.equal(colors.brandPrimarySubtle, 'hsl(0 100% 98%)')
  assert.equal(colors.popBlush, 'hsl(0 100% 98%)')
})

test('CSS token bridge mirrors the phase 1 storefront surface values', async () => {
  const cssPath = path.join(process.cwd(), 'packages', 'ui', 'global.css')
  const css = await fs.readFile(cssPath, 'utf8')

  for (const snippet of [
    '--color-background:           hsl(0 0% 100%);',
    '--color-background-secondary: hsl(0 0% 96%);',
    '--color-border:               hsla(0 0% 0% / 0.10);',
    '--color-muted:                hsl(210 20% 98%);',
    '--color-primary-subtle:       hsl(0 100% 98%);',
  ]) {
    assert.match(css, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})
