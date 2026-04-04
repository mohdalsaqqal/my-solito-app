# NiceOne Design System Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace our compressed token system (Manrope font, 10–14px scale, brutalist radius, 9-level shadows) with NiceOne-derived patterns: DM Sans + Tajawal fonts, 10–20px type scale, rounded radius (2–16px), and simplified 4-level shadows.

**Architecture:** Direct token replacement in `packages/tokens/` and `packages/ui/global.css`. No new abstractions — existing components pick up changes automatically via token references. Font loading handled separately per platform (Next.js via `next/font/google`, Expo via `@expo-google-fonts`).

**Tech Stack:** TypeScript token files, Tailwind v4 CSS vars (`global.css`), Next.js `next/font/google`, `@expo-google-fonts`, React Native `useFonts`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `packages/tokens/typography.ts` | Modify | Font families, sizes, weights, line heights |
| `packages/tokens/radius.ts` | Modify | Border radius scale |
| `packages/tokens/shadows.ts` | Modify | React Native shadow objects |
| `packages/tokens/elevation.ts` | Modify | CSS box-shadow strings |
| `packages/ui/global.css` | Modify | All CSS custom properties + RTL font rule |
| `apps/next/app/layout.tsx` | Modify | Replace Manrope with DM Sans, clean Cairo/Almarai |
| `packages/ui/responsive/useFontFamily.ts` | Create | Native RTL font switching hook |
| `apps/expo/App.tsx` | Modify | Load DM Sans + Tajawal fonts |
| `packages/tokens/designSystemTokens.test.ts` | Create | Token value regression tests |

---

## Task 1: Pre-flight Audit

**Files:** No changes — audit only.

- [ ] **Step 1: Check for numbered elevation references**

```bash
grep -rn "shadows\.e[0-9]\|elevation\.e[0-9]" packages/ apps/ --include="*.ts" --include="*.tsx"
```

Expected: zero results (if any appear, note the files — they'll need manual updates after Task 4).

- [ ] **Step 2: Check for Manrope references**

```bash
grep -rn "Manrope\|font-manrope\|manrope" packages/ apps/ --include="*.ts" --include="*.tsx" --include="*.css"
```

Expected: results in `packages/tokens/typography.ts`, `packages/ui/global.css`, `apps/next/app/layout.tsx` only. Any other files need attention.

- [ ] **Step 3: Check for radius.xs / radius.sm used as "intentionally zero"**

```bash
grep -rn "radius\.xs\|radius\.sm" packages/ apps/ --include="*.ts" --include="*.tsx"
```

Expected: review any results — these will gain 2px rounding. Decide if any need `radius.none` instead.

---

## Task 2: Write Token Tests (TDD — these will fail until Tasks 3–6)

**Files:**
- Create: `packages/tokens/designSystemTokens.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
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
```

- [ ] **Step 2: Run to confirm all tests fail**

```bash
node --test packages/tokens/designSystemTokens.test.ts 2>&1 | tail -20
```

Expected: multiple `AssertionError` failures — this confirms the tests are correctly checking the new values.

---

## Task 3: Radius Tokens

**Files:**
- Modify: `packages/tokens/radius.ts`
- Modify: `packages/ui/global.css` (radius section only)

- [ ] **Step 1: Replace radius.ts**

```typescript
// packages/tokens/radius.ts
// NiceOne-derived rounded scale.
// md (6px) is the primary card radius. xl/2xl for containers and hero banners.
export const radius = {
  none:  0,
  xs:    2,    // hairline rounding for tags/chips
  sm:    2,
  md:    6,    // primary card radius
  lg:    8,    // modals, drawers
  xl:    12,   // large containers, bottom sheets
  '2xl': 16,   // hero banners, large cards
  full:  9999, // pills and avatar crops only
} as const
```

- [ ] **Step 2: Update radius CSS vars in global.css**

Find this block in `packages/ui/global.css`:
```css
  /* ── Radius — DESIGN.md §4 "Roundedness Scale of 0px" — Brutalist-Luxe ── */
  --radius-none: 0px;
  --radius-xs:   0px;
  --radius-sm:   0px;
  --radius-md:   4px;
  --radius-lg:   4px;
  --radius-xl:   4px;
  --radius-full: 9999px;  /* pill badges / avatar crops only */
  --radius:      4px;
```

Replace with:
```css
  /* ── Radius — NiceOne rounded scale ── */
  --radius-none: 0px;
  --radius-xs:   2px;
  --radius-sm:   2px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-xl:   12px;
  --radius-2xl:  16px;
  --radius-full: 9999px;
  --radius:      6px;
```

- [ ] **Step 3: Run radius tests**

```bash
node --test packages/tokens/designSystemTokens.test.ts --test-name-pattern="radius" 2>&1
```

Expected: `radius scale matches NiceOne rounded system` → PASS

- [ ] **Step 4: Run guard checks**

```bash
yarn guard:checks 2>&1 | tail -20
```

Expected: pass (radius changes don't affect token violation rules).

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/radius.ts packages/ui/global.css packages/tokens/designSystemTokens.test.ts
git commit -m "feat(tokens): adopt NiceOne rounded radius scale (2–16px)"
```

---

## Task 4: Shadow Tokens

**Files:**
- Modify: `packages/tokens/shadows.ts`
- Modify: `packages/tokens/elevation.ts`
- Modify: `packages/ui/global.css` (shadow section only)

- [ ] **Step 1: Replace shadows.ts (React Native objects)**

```typescript
// packages/tokens/shadows.ts
// Simplified 4-level system matching NiceOne's shadow language.
// 'card' is the NiceOne omnidirectional product card glow.
export const shadows = {
  none: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  // NiceOne card shadow — omnidirectional soft glow, no directionality
  card: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 2,
  },
} as const

// Web-only sticky header shadow — unchanged
export const headerScrollShadow = '0 6px 20px rgba(20,18,15,0.06)'
```

- [ ] **Step 2: Replace elevation.ts (CSS strings)**

```typescript
// packages/tokens/elevation.ts
// CSS box-shadow strings — simplified to match shadows.ts semantic levels.
// 'card' matches NiceOne's product card glow: 0 0 5px rgba(0,0,6,0.14)
export const elevation = {
  none: 'none',

  xs:  '0 1px 2px rgba(0,0,0,0.05)',
  sm:  '0 2px 4px rgba(0,0,0,0.06)',
  md:  '0 4px 8px rgba(0,0,0,0.08)',
  lg:  '0 8px 16px rgba(0,0,0,0.10)',
  xl:  '0 12px 24px rgba(0,0,0,0.12)',

  // NiceOne card shadow
  card: '0 0 5px rgba(0,0,6,0.14)',

  // Semantic component tokens — kept unchanged
  drawerPanel:  '-8px 0 48px rgba(15,15,17,0.15)',
  drawerFooter: '0 -4px 24px rgba(15,15,17,0.04)',
} as const
```

- [ ] **Step 3: Update shadow CSS vars in global.css**

Find the elevation block in `packages/ui/global.css` (starts with `--shadow-e01`):
```css
  /* ── Elevation — Figma 3-layer shadow system ── */
  --shadow-e01: 0 1px 2px rgba(15,15,17,0.04), 0 1px 4px rgba(15,15,17,0.06);
  --shadow-e02: 0 2px 4px rgba(15,15,17,0.05), 0 4px 10px rgba(15,15,17,0.06);
  --shadow-e03: 0 3px 6px rgba(15,15,17,0.06), 0 6px 14px rgba(15,15,17,0.07);
  --shadow-e04: 0 4px 8px rgba(15,15,17,0.06), 0 8px 18px rgba(15,15,17,0.08);
  --shadow-e05: 0 5px 10px rgba(15,15,17,0.07), 0 10px 20px rgba(15,15,17,0.08);
  --shadow-e06: 0 6px 12px rgba(15,15,17,0.07), 0 12px 24px rgba(15,15,17,0.09);
  --shadow-e08: 0 8px 16px rgba(15,15,17,0.08), 0 16px 32px rgba(15,15,17,0.10);
  --shadow-e12: 0 12px 24px rgba(15,15,17,0.09), 0 20px 40px rgba(15,15,17,0.11);
  --shadow-e16: 0 16px 30px rgba(15,15,17,0.10), 0 26px 52px rgba(15,15,17,0.12);
  --shadow-e24: 0 20px 40px rgba(15,15,17,0.11), 0 36px 64px rgba(15,15,17,0.14);
  --shadow-xs: 0 1px 2px rgba(15,15,17,0.04), 0 1px 4px rgba(15,15,17,0.06);
  --shadow-sm: 0 2px 4px rgba(15,15,17,0.05), 0 4px 10px rgba(15,15,17,0.06);
  --shadow-md: 0 4px 8px rgba(15,15,17,0.06), 0 8px 18px rgba(15,15,17,0.08);
  --shadow-lg: 0 8px 24px rgba(15,15,17,0.08), 0 16px 40px rgba(15,15,17,0.10);
  --shadow-xl: 0 16px 36px rgba(15,15,17,0.10), 0 28px 56px rgba(15,15,17,0.12);
```

Replace with:
```css
  /* ── Elevation — 4-level + card system ── */
  --shadow-xs:   0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm:   0 2px 4px rgba(0,0,0,0.06);
  --shadow-md:   0 4px 8px rgba(0,0,0,0.08);
  --shadow-lg:   0 8px 16px rgba(0,0,0,0.10);
  --shadow-xl:   0 12px 24px rgba(0,0,0,0.12);
  --shadow-card: 0 0 5px rgba(0,0,6,0.14);
```

- [ ] **Step 4: Run shadow tests**

```bash
node --test packages/tokens/designSystemTokens.test.ts --test-name-pattern="shadow|elevation" 2>&1
```

Expected: all shadow and elevation tests → PASS

- [ ] **Step 5: Run guard checks + tsc**

```bash
yarn guard:checks 2>&1 | tail -10
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false 2>&1 | tail -20
```

Expected: both pass clean.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/shadows.ts packages/tokens/elevation.ts packages/ui/global.css
git commit -m "feat(tokens): simplify shadows to 4-level + NiceOne card glow"
```

---

## Task 5: Type Scale Tokens

**Files:**
- Modify: `packages/tokens/typography.ts`
- Modify: `packages/ui/global.css` (text/font section only)

- [ ] **Step 1: Replace typography sizes, weights, and line heights in typography.ts**

Replace the entire contents of `packages/tokens/typography.ts` with:

```typescript
export const typography = {
  // Display / Hero
  display:   20,
  hero:      20,
  campaign:  18,

  // Headings
  h1:        20,
  h2:        18,
  h3:        16,
  h4:        14,
  h5:        13,
  h6:        12,

  // Subheadings
  headline:     18,
  subheadline:  14,
  subtitle1:    14,
  subtitle2:    12,

  // Body
  body1:     14,
  body2:     12,
  bodySm:    12,
  bodyMd:    14,
  bodyLg:    16,
  body:      14,

  // UI elements
  button:    14,
  label:     12,
  caption:   11,
  overline:  10,
  meta:      11,
  nav:       13,
  price:     16,
  footer:    12,

  // Legacy aliases (kept for backward compat)
  xs:    11,
  sm:    12,
  md:    14,
  lg:    16,
  xl:    18,
  xxl:   20,
  base:  14,
  '2xl': 18,
  '3xl': 20,
  '4xl': 20,

  // Tier aliases
  displayTier:     20,
  headlineTier:    18,
  subHeadlineTier: 14,
  bodyTier:        14,
  captionTier:     11,

  // Numbered heading aliases
  heading6:  12,
  heading7:  14,
  heading8:  16,
  heading9:  18,
  heading10: 20,
} as const

export const fontFamilies = {
  sans:      'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  heading:   'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  display:   'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  secondary: 'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, sans-serif',
  logo:      'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  logoSecondary: 'var(--font-dm-sans, "DM Sans"), sans-serif',
  arabic:    '"Tajawal", -apple-system, system-ui, sans-serif',
  mono:      'Menlo, monospace',
} as const

export const fontWeights = {
  ultra:    '100',
  light:    '300',
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  black:    '900',
} as const

export const lineHeights = {
  h1: 28,  h2: 26,  h3: 24,
  h4: 20,  h5: 18,  h6: 18,
  subtitle1: 20,  subtitle2: 18,
  body1: 22,  body2: 18,
  button: 20,  caption: 16,  overline: 16,
  tight: 1.15,  normal: 1.35,  relaxed: 1.55,
  body: 22,  heading: 28,  hero: 28,
} as const

export const letterSpacing = {
  h1: -1.92,
  h2: -1.2,
  h3: 0,
  h4: 0.085,
  h5: 0,
  h6: 0.03,
  subtitle1: 0.2,
  subtitle2: 0.14,
  body1: 0.08,
  body2: 0.035,
  caption: 0.06,
  button: 0,
  displayWide: 2.8,
  labelSmallCaps: 1.6,
  tight: -0.6,
  normal: 0,
  wide: 0.3,
  caps: 1,
  capsWide: 2,
  headlineTier: -0.8,
  subHeaderCaps: 1.2,
  campaignHeading: -1.6,
  labelPill: 1.92,
  overline: 1.6,
} as const
```

- [ ] **Step 2: Update CSS text vars in global.css**

Find the typography block in `packages/ui/global.css` (starts with `/* ── Typography`):

Replace the `--text-*` and `--leading-*` variables with:

```css
  /* ── Typography — NiceOne expanded 10–20px scale ── */
  --text-h1:        1.25rem;    /* 20px */
  --text-h2:        1.125rem;   /* 18px */
  --text-h3:        1rem;       /* 16px */
  --text-h4:        0.875rem;   /* 14px */
  --text-h5:        0.8125rem;  /* 13px */
  --text-h6:        0.75rem;    /* 12px */
  --text-body1:     0.875rem;   /* 14px */
  --text-body2:     0.75rem;    /* 12px */
  --text-caption:   0.6875rem;  /* 11px */
  --text-overline:  0.625rem;   /* 10px */
  --text-button:    0.875rem;   /* 14px */
  --text-price:     1rem;       /* 16px */

  /* Legacy aliases */
  --text-xs:    0.6875rem;
  --text-sm:    0.75rem;
  --text-base:  0.875rem;
  --text-lg:    1rem;
  --text-xl:    1.125rem;
  --text-2xl:   1.25rem;
  --text-3xl:   1.25rem;
  --text-4xl:   1.25rem;

  /* Campaign typography */
  --text-campaign:    1.125rem;
  --text-headline:    1.125rem;
  --text-subheadline: 0.875rem;

  /* Line heights */
  --leading-h1:      1.75rem;
  --leading-h2:      1.625rem;
  --leading-h3:      1.5rem;
  --leading-h4:      1.25rem;
  --leading-h5:      1.125rem;
  --leading-h6:      1.125rem;
  --leading-body1:   1.375rem;
  --leading-body2:   1.125rem;
  --leading-caption: 1rem;

  /* Letter spacing — unchanged */
  --tracking-h1:       -0.03em;
  --tracking-h2:       -0.02em;
  --tracking-campaign: -0.025em;
  --tracking-label:     0.12em;
  --tracking-overline:  0.16em;
```

- [ ] **Step 3: Run type scale tests**

```bash
node --test packages/tokens/designSystemTokens.test.ts --test-name-pattern="type|font weight|line height|DM Sans|arabic|Tajawal" 2>&1
```

Expected: all typography tests → PASS

- [ ] **Step 4: Run guard + tsc**

```bash
yarn guard:checks 2>&1 | tail -10
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false 2>&1 | tail -20
```

Expected: both pass clean.

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/typography.ts packages/ui/global.css
git commit -m "feat(tokens): expand type scale 10-20px, add DM Sans + Tajawal families, add light weight"
```

---

## Task 6: Global CSS — Font Vars + RTL Rule

**Files:**
- Modify: `packages/ui/global.css`

- [ ] **Step 1: Replace font-family CSS vars**

Find this block in `packages/ui/global.css`:
```css
  --font-sans:      var(--font-manrope, "Manrope"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-heading:   var(--font-manrope, "Manrope"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display:   var(--font-manrope, "Manrope"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-secondary: var(--font-manrope, "Manrope"), -apple-system, system-ui, sans-serif;
  --font-logo:      var(--font-manrope, "Manrope"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono:      Menlo, monospace;
```

Replace with:
```css
  --font-sans:      var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-heading:   var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display:   var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-secondary: var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, sans-serif;
  --font-logo:      var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-arabic:    var(--font-tajawal, "Tajawal"), -apple-system, system-ui, sans-serif;
  --font-mono:      Menlo, monospace;
```

- [ ] **Step 2: Add RTL font rule at bottom of global.css**

Append to the end of `packages/ui/global.css`, after the last closing brace:

```css

/* ── RTL font switching ── */
[dir="rtl"] {
  font-family: var(--font-arabic);
}
```

- [ ] **Step 3: Run CSS bridge test**

```bash
node --test packages/tokens/designSystemTokens.test.ts --test-name-pattern="global.css" 2>&1
```

Expected: `global.css reflects new radius and shadow tokens` → PASS

- [ ] **Step 4: Run full test suite**

```bash
node --test packages/tokens/designSystemTokens.test.ts 2>&1
```

Expected: all tests PASS.

- [ ] **Step 5: Run guard + tsc**

```bash
yarn guard:checks 2>&1 | tail -10
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false 2>&1 | tail -20
```

Expected: both pass clean.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/global.css
git commit -m "feat(tokens): update CSS font vars to DM Sans + Tajawal, add RTL rule"
```

---

## Task 7: Next.js Font Loading

**Files:**
- Modify: `apps/next/app/layout.tsx`

The current layout loads Manrope, Cairo, Tajawal, and Almarai. We keep Tajawal (already correct), replace Manrope with DM Sans, and remove Cairo and Almarai.

- [ ] **Step 1: Update layout.tsx**

Replace the font import block and `className` in `apps/next/app/layout.tsx`:

```typescript
import { StylesProvider } from './styles-provider'
import './globals.css'
import { DM_Sans, Tajawal } from 'next/font/google'
import { colors } from '@real/tokens'
import { ChunkErrorRecovery } from './_components/ChunkErrorRecovery'
import { Providers } from './_components/Providers'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  display: 'swap',
  variable: '--font-tajawal',
  weight: ['300', '400', '500', '700'],
})

export const metadata = {
  title: 'REAL Cosmetics | Endless Beauty Marketplace',
  description:
    'Discover premium skincare, makeup, haircare, and fragrance from trusted brands across a 15,000-product beauty marketplace.',
  applicationName: 'REAL Cosmetics',
}

export const viewport = {
  themeColor: colors.surface,
  colorScheme: 'light',
}

const DEFAULT_LOCALE = 'en'
const DEFAULT_DIRECTION = 'ltr'
const ROOT_LOCALE_SCRIPT = `
  (function () {
    function readCookie(name) {
      var prefix = name + '='
      var cookies = document.cookie ? document.cookie.split('; ') : []
      for (var index = 0; index < cookies.length; index += 1) {
        var entry = cookies[index]
        if (entry.indexOf(prefix) === 0) {
          return decodeURIComponent(entry.slice(prefix.length))
        }
      }
      return ''
    }

    var pathSegment = window.location.pathname.split('/').filter(Boolean)[0] || ''
    var cookieLocale = readCookie('rc_locale').toLowerCase()
    var locale = pathSegment === 'ar' || pathSegment === 'en' ? pathSegment : cookieLocale === 'ar' ? 'ar' : 'en'
    var direction = locale === 'ar' ? 'rtl' : 'ltr'
    var root = document.documentElement

    root.lang = locale
    root.dir = direction
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={DEFAULT_DIRECTION}
      suppressHydrationWarning
      className={`${dmSans.variable} ${tajawal.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ROOT_LOCALE_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <a className='skip-link' href='#main-content'>
          Skip to main content
        </a>
        <ChunkErrorRecovery />
        <Providers>
          <StylesProvider>{children}</StylesProvider>
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Run tsc to confirm no import errors**

```bash
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false 2>&1 | tail -20
```

Expected: no errors. If `DM_Sans` is not found, it means the next/font/google package needs updating — run `yarn add next@latest` in `apps/next/`.

- [ ] **Step 3: Commit**

```bash
git add apps/next/app/layout.tsx
git commit -m "feat(next): replace Manrope with DM Sans, trim unused Arabic fonts"
```

---

## Task 8: useFontFamily Hook (Native)

**Files:**
- Create: `packages/ui/responsive/useFontFamily.ts`
- Modify: `packages/ui/responsive/index.ts`

- [ ] **Step 1: Create useFontFamily.ts**

```typescript
// packages/ui/responsive/useFontFamily.ts
// Returns the correct font family name for the current locale direction.
// DM Sans for LTR (English), Tajawal for RTL (Arabic).
// Use this hook anywhere a native Text or TextInput needs an explicit fontFamily prop.
import { I18nManager } from 'react-native'

export type FontWeight = 'light' | 'regular' | 'medium' | 'bold'

const DM_SANS: Record<FontWeight, string> = {
  light:   'DMSans_300Light',
  regular: 'DMSans_400Regular',
  medium:  'DMSans_500Medium',
  bold:    'DMSans_700Bold',
}

const TAJAWAL: Record<FontWeight, string> = {
  light:   'Tajawal_300Light',
  regular: 'Tajawal_400Regular',
  medium:  'Tajawal_500Medium',
  bold:    'Tajawal_700Bold',
}

export function useFontFamily(weight: FontWeight = 'regular'): string {
  return I18nManager.isRTL ? TAJAWAL[weight] : DM_SANS[weight]
}
```

- [ ] **Step 2: Export from responsive/index.ts**

Add to `packages/ui/responsive/index.ts`:

```typescript
export { useFontFamily } from './useFontFamily'
export type { FontWeight } from './useFontFamily'
```

- [ ] **Step 3: Run tsc**

```bash
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false 2>&1 | tail -10
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/responsive/useFontFamily.ts packages/ui/responsive/index.ts
git commit -m "feat(ui): add useFontFamily hook for RTL/LTR font switching on native"
```

---

## Task 9: Expo Font Loading

**Files:**
- Modify: `apps/expo/package.json` (add deps)
- Modify: `apps/expo/App.tsx`

- [ ] **Step 1: Install expo-google-fonts packages**

```bash
cd apps/expo && yarn add @expo-google-fonts/dm-sans @expo-google-fonts/tajawal
```

Wait for install to complete.

- [ ] **Step 2: Update App.tsx to load fonts**

Replace `apps/expo/App.tsx` with:

```typescript
import { Fragment, useEffect } from 'react'
import { PortalHost } from '@rn-primitives/portal'
import { Platform } from 'react-native'
import { FullWindowOverlay } from 'react-native-screens'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ToastProvider } from '@real/ui'
import {
  useFonts,
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import {
  Tajawal_300Light,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal'
import * as SplashScreen from 'expo-splash-screen'
import HomeRoute from './app/index'

SplashScreen.preventAutoHideAsync()

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Tajawal_300Light,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  const Overlay = Platform.OS === 'ios' ? FullWindowOverlay : Fragment

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <HomeRoute />
        <Overlay>
          <PortalHost />
        </Overlay>
      </ToastProvider>
    </SafeAreaProvider>
  )
}
```

- [ ] **Step 3: Verify expo-splash-screen is already installed**

```bash
grep "expo-splash-screen" apps/expo/package.json
```

Expected: a version entry. If missing, run:
```bash
yarn workspace @my/app add expo-splash-screen
```

- [ ] **Step 4: Run tsc on expo**

```bash
yarn tsc -p apps/expo/tsconfig.json --noEmit --incremental false 2>&1 | tail -20
```

Expected: clean. If missing types for the font packages, they ship their own — no `@types` needed.

- [ ] **Step 5: Commit**

```bash
git add apps/expo/App.tsx apps/expo/package.json
git commit -m "feat(expo): load DM Sans + Tajawal fonts, add splash screen gate"
```

---

## Task 10: Final Verification

- [ ] **Step 1: Run full token test suite**

```bash
node --test packages/tokens/designSystemTokens.test.ts 2>&1
```

Expected: all tests PASS, zero failures.

- [ ] **Step 2: Run guard checks**

```bash
yarn guard:checks 2>&1
```

Expected: clean exit, no violations.

- [ ] **Step 3: Run TypeScript check**

```bash
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false 2>&1
```

Expected: zero errors.

- [ ] **Step 4: Confirm no Manrope references remain**

```bash
grep -rn "Manrope\|font-manrope\|--font-manrope" packages/ apps/ --include="*.ts" --include="*.tsx" --include="*.css"
```

Expected: zero results.

- [ ] **Step 5: Confirm no numbered shadow keys remain**

```bash
grep -rn "shadows\.e[0-9]\|elevation\.e[0-9]\|shadow-e[0-9]" packages/ apps/ --include="*.ts" --include="*.tsx" --include="*.css"
```

Expected: zero results.

- [ ] **Step 6: Final commit**

```bash
git add packages/tokens/designSystemTokens.test.ts
git commit -m "test(tokens): add regression tests for NiceOne design system integration"
```
