// packages/tokens/designSystemTokens.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

import { radius } from './radius'
import { shadows } from './shadows'
import { elevation } from './elevation'
import { typography, fontFamilies, fontWeights, lineHeights } from './typography'

// ── Radius ────────────────────────────────────────────────────────────────────

test('radius scale matches NiceOne rounded system', () => {
  assert.equal(radius.none, 0)
  assert.equal(radius.xs, 2)
  assert.equal(radius.sm, 2)
  assert.equal(radius.md, 6)
  assert.equal(radius.lg, 8)
  assert.equal(radius.xl, 12)
  assert.equal(radius['2xl'], 16)
  assert.equal(radius.full, 9999)
})

// ── Shadows ───────────────────────────────────────────────────────────────────

test('shadows are simplified to 4-level + card system', () => {
  assert.ok('xs' in shadows, 'xs missing')
  assert.ok('sm' in shadows, 'sm missing')
  assert.ok('md' in shadows, 'md missing')
  assert.ok('lg' in shadows, 'lg missing')
  assert.ok('xl' in shadows, 'xl missing')
  assert.ok('card' in shadows, 'card missing')
  assert.ok(!('e01' in shadows), 'e01 should be removed')
  assert.ok(!('e12' in shadows), 'e12 should be removed')
})

test('card shadow is omnidirectional (offset 0,0)', () => {
  assert.equal(shadows.card.shadowOffset.width, 0)
  assert.equal(shadows.card.shadowOffset.height, 0)
  assert.equal(shadows.card.shadowOpacity, 0.14)
  assert.equal(shadows.card.shadowRadius, 5)
})

// ── Elevation (CSS strings) ───────────────────────────────────────────────────

test('elevation simplified to 4-level + card + drawer tokens', () => {
  assert.ok('xs' in elevation, 'xs missing')
  assert.ok('sm' in elevation, 'sm missing')
  assert.ok('md' in elevation, 'md missing')
  assert.ok('lg' in elevation, 'lg missing')
  assert.ok('xl' in elevation, 'xl missing')
  assert.ok('card' in elevation, 'card missing')
  assert.ok('drawerPanel' in elevation, 'drawerPanel missing')
  assert.ok(!('e01' in elevation), 'e01 should be removed')
  assert.ok(!('e12' in elevation), 'e12 should be removed')
})

test('elevation card is the NiceOne diffuse glow string', () => {
  assert.equal(elevation.card, '0 0 5px rgba(0,0,6,0.14)')
})

// ── Type Scale ────────────────────────────────────────────────────────────────

test('type scale is expanded to 10–20px', () => {
  assert.equal(typography.h1, 20)
  assert.equal(typography.h2, 18)
  assert.equal(typography.h3, 16)
  assert.equal(typography.h4, 14)
  assert.equal(typography.body1, 14)
  assert.equal(typography.price, 16)
  assert.equal(typography.display, 20)
  assert.equal(typography.overline, 10)
})

test('font weights include light (300)', () => {
  assert.equal(fontWeights.light, '300')
  assert.equal(fontWeights.regular, '400')
  assert.equal(fontWeights.medium, '500')
  assert.equal(fontWeights.bold, '700')
})

test('line heights match expanded scale', () => {
  assert.equal(lineHeights.h1, 28)
  assert.equal(lineHeights.h2, 26)
  assert.equal(lineHeights.body1, 22)
})

// ── Font Families ─────────────────────────────────────────────────────────────

test('sans font family uses DM Sans', () => {
  assert.ok(fontFamilies.sans.includes('DM Sans'), `Expected "DM Sans" in: ${fontFamilies.sans}`)
  assert.ok(!fontFamilies.sans.includes('Manrope'), `Manrope should be removed from sans`)
})

test('arabic font family is defined and uses Tajawal', () => {
  assert.ok('arabic' in fontFamilies, 'arabic key missing from fontFamilies')
  assert.ok(fontFamilies.arabic.includes('Tajawal'), `Expected "Tajawal" in: ${fontFamilies.arabic}`)
})

// ── CSS Token Bridge ──────────────────────────────────────────────────────────

test('global.css reflects new radius and shadow tokens', async () => {
  const cssPath = path.join(process.cwd(), 'packages', 'ui', 'global.css')
  const css = await fs.readFile(cssPath, 'utf8')

  const expected = [
    '--radius-md:   6px;',
    '--radius-lg:   8px;',
    '--radius-xl:   12px;',
    '--radius-2xl:  16px;',
    '--shadow-card: 0 0 5px rgba(0,0,6,0.14);',
    '--text-h1:        1.25rem;',
    '--text-price:     1rem;',
    '--font-arabic:',
  ]

  for (const snippet of expected) {
    assert.ok(css.includes(snippet), `global.css missing: ${snippet}`)
  }
})
