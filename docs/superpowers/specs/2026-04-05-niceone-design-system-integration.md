# Design System Integration — Nice One Patterns (non-color)

**Date**: 2026-04-05  
**Status**: Approved  
**Scope**: `packages/tokens/`, `packages/ui/global.css`, `apps/next/app/layout.tsx`, `apps/expo/`  
**Excluded**: Colors — our existing color system is kept unchanged.

---

## 1. Goals

Adopt the non-color design patterns from Nice One's production design system into our token layer:

- Replace Manrope with **DM Sans** (EN) + **Tajawal** (AR)
- Expand the compressed type scale (10–14px) to a full **10–20px** scale
- Replace the brutalist radius (0–4px) with a **rounded scale** (2–16px)
- Replace the 9-level elevation system with a **4-level shadow system** + semantic card shadow

Strategy: **direct token replacement** — edit existing token files in place, no parallel systems.

---

## 2. Fonts

### 2.1 Font Families

**File**: `packages/tokens/typography.ts` — `fontFamilies`

| Key | Current | New |
|-----|---------|-----|
| `sans` | Manrope | `"DM Sans"`, system stack fallback |
| `heading` | Manrope | `"DM Sans"`, system stack fallback |
| `display` | Manrope | `"DM Sans"`, system stack fallback |
| `secondary` | Manrope | `"DM Sans"`, system stack fallback |
| `logo` | Manrope | `"DM Sans"`, system stack fallback |
| `arabic` | — (new) | `"Tajawal"`, system stack fallback |
| `mono` | Menlo | Menlo (unchanged) |

```ts
fontFamilies = {
  sans:      'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  heading:   'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  display:   'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  secondary: 'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, sans-serif',
  logo:      'var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
  arabic:    '"Tajawal", -apple-system, system-ui, sans-serif',
  mono:      'Menlo, monospace',
}
```

### 2.2 Font Loading

**`apps/next/app/layout.tsx`**:
- Load `DM_Sans` (weights 300–700, subsets: latin) via `next/font/google`
- Load `Tajawal` (weights 300–700, subsets: arabic) via `next/font/google`
- Inject both as CSS variables: `--font-dm-sans`, `--font-tajawal`

**`apps/expo/`**:
- Add `DMSans-Regular.ttf`, `DMSans-Medium.ttf`, `DMSans-Bold.ttf` to `assets/fonts/`
- Add `Tajawal-Regular.ttf`, `Tajawal-Medium.ttf`, `Tajawal-Bold.ttf` to `assets/fonts/`
- Register all six in `app.json` under `expo.fonts`
- Load with `useFonts` in `App.tsx`

**`packages/ui/global.css`**:
```css
--font-sans:    var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, sans-serif;
--font-heading: var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, sans-serif;
--font-display: var(--font-dm-sans, "DM Sans"), -apple-system, system-ui, sans-serif;
--font-arabic:  var(--font-tajawal, "Tajawal"), -apple-system, system-ui, sans-serif;
--font-mono:    Menlo, monospace;
```

### 2.3 Arabic Font Application

On web, Tajawal activates automatically via:
```css
[dir="rtl"] {
  font-family: var(--font-arabic);
}
```
Added to `packages/ui/global.css` at the bottom, under a new `/* ── RTL font switching ── */` comment block.

On native, font switching is done by a `useFontFamily()` hook at `packages/ui/responsive/useFontFamily.ts` that returns `Tajawal-*` when `I18nManager.isRTL` is true, and `DMSans-*` otherwise.

---

## 3. Type Scale

**File**: `packages/tokens/typography.ts`

### 3.1 Font Sizes (replace entire `typography` object)

```ts
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
  displayTier:    20,
  headlineTier:   18,
  subHeadlineTier: 14,
  bodyTier:       14,
  captionTier:    11,

  // Numbered heading aliases
  heading6:  12,
  heading7:  14,
  heading8:  16,
  heading9:  18,
  heading10: 20,
}
```

### 3.2 Font Weights (add `light`)

```ts
export const fontWeights = {
  ultra:    '100',   // kept for compat
  light:    '300',   // new
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  black:    '900',   // kept for compat
}
```

### 3.3 Line Heights

```ts
export const lineHeights = {
  h1: 28,  h2: 26,  h3: 24,
  h4: 20,  h5: 18,  h6: 18,
  subtitle1: 20,  subtitle2: 18,
  body1: 22,  body2: 18,
  button: 20,  caption: 16,  overline: 16,
  tight: 1.15,  normal: 1.35,  relaxed: 1.55,
  body: 22,  heading: 28,  hero: 28,
}
```

### 3.4 CSS Vars (`global.css`)

```css
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
--text-price:     1rem;       /* 16px — new */

/* Legacy aliases */
--text-xs:    0.6875rem;
--text-sm:    0.75rem;
--text-base:  0.875rem;
--text-lg:    1rem;
--text-xl:    1.125rem;
--text-2xl:   1.25rem;
--text-3xl:   1.25rem;
--text-4xl:   1.25rem;
```

---

## 4. Border Radius

**File**: `packages/tokens/radius.ts`, `packages/ui/global.css`

### 4.1 Token replacement

```ts
export const radius = {
  none:  0,
  xs:    2,    // was 0
  sm:    2,    // was 0
  md:    6,    // was 4 — primary card radius
  lg:    8,    // was 4 — modals, drawers
  xl:    12,   // was 4 — large containers
  '2xl': 16,   // new — hero banners, large cards
  full:  9999, // unchanged — pills only
}
```

### 4.2 CSS Vars (`global.css`)

```css
--radius-none: 0px;
--radius-xs:   2px;
--radius-sm:   2px;
--radius-md:   6px;
--radius-lg:   8px;
--radius-xl:   12px;
--radius-2xl:  16px;
--radius-full: 9999px;
--radius:      6px;   /* shorthand default — was 4px */
```

**Compatibility**: Components using `radius.xs` or `radius.sm` as "intentionally square" will gain 2px rounding. Review after implementation — these were previously 0.

---

## 5. Shadows

**File**: `packages/tokens/shadows.ts`, `packages/ui/global.css`

### 5.1 Token replacement (9-level → 4-level + card)

**Note**: There are two shadow files. Both get simplified:
- `packages/tokens/shadows.ts` — React Native shadow objects (used in native components)
- `packages/tokens/elevation.ts` — CSS string shadows (used in web/global.css)

Both follow the same xs/sm/md/lg/xl/card semantic structure.

```ts
export const shadows = {
  none: { shadowColor: 'hsl(0 0% 0%)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },

  xs:   { shadowColor: 'hsl(0 0% 0%)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,  elevation: 1 },
  sm:   { shadowColor: 'hsl(0 0% 0%)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,  elevation: 2 },
  md:   { shadowColor: 'hsl(0 0% 0%)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8,  elevation: 4 },
  lg:   { shadowColor: 'hsl(0 0% 0%)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 8 },
  xl:   { shadowColor: 'hsl(0 0% 0%)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 12 },

  // Nice One card shadow — omnidirectional soft glow
  card: { shadowColor: 'hsl(0 0% 0%)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.14, shadowRadius: 5, elevation: 2 },
}

// Web-only — unchanged
export const headerScrollShadow = '0 6px 20px rgba(20,18,15,0.06)'
```

### 5.2 e01–e24 migration map

All existing usages of numbered elevation keys must be remapped:

| Old | New |
|-----|-----|
| `e01` | `xs` |
| `e02` | `sm` |
| `e03`, `e04`, `e05` | `md` |
| `e06`, `e08` | `lg` |
| `e12`, `e16`, `e24` | `xl` |

Run `grep -r "shadows\.e" packages/ apps/` to find all usages before implementation.

### 5.3 CSS Vars (`global.css`)

```css
/* Replace all e01–e24 vars with: */
--shadow-xs:   0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:   0 2px 4px rgba(0,0,0,0.06);
--shadow-md:   0 4px 8px rgba(0,0,0,0.08);
--shadow-lg:   0 8px 16px rgba(0,0,0,0.10);
--shadow-xl:   0 12px 24px rgba(0,0,0,0.12);
--shadow-card: 0 0 5px rgba(0,0,6,0.14);   /* new */
```

---

## 6. Files Changed Summary

| File | Change |
|------|--------|
| `packages/tokens/typography.ts` | Replace `fontFamilies`, expand `typography`, add `light` weight, update `lineHeights` |
| `packages/tokens/radius.ts` | Full replacement — new 8-step scale |
| `packages/tokens/shadows.ts` | Full replacement — 4-level + card (RN objects) |
| `packages/tokens/elevation.ts` | Full replacement — 4-level + card (CSS strings) |
| `packages/ui/global.css` | Update `--font-*`, `--text-*`, `--radius-*`, `--shadow-*` vars; add RTL font rule |
| `apps/next/app/layout.tsx` | Load DM Sans + Tajawal via `next/font/google` |
| `apps/expo/assets/fonts/` | Add 6 TTF files (DM Sans × 3, Tajawal × 3) |
| `apps/expo/app.json` | Register fonts under `expo.fonts` |
| `apps/expo/App.tsx` | Load fonts with `useFonts` |

---

## 7. Verification

After implementation, run in order:

```bash
yarn guard:checks
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false
```

Also grep for stale references before starting:
```bash
grep -r "shadows\.e[0-9]\|elevation\.e[0-9]" packages/ apps/
grep -r "font-manrope\|Manrope\|--font-manrope" packages/ apps/
grep -r "radius\.xs\|radius\.sm" packages/ apps/   # review any 'intentionally square' usages
```

---

## 8. Out of Scope

- Colors — zero changes to `packages/tokens/colors.ts` or color CSS vars
- Spacing — our 4px base scale already matches Nice One's
- Motion/animation tokens — unchanged
- Component-level styling — token changes propagate automatically; no component edits needed unless guard:checks flags violations
