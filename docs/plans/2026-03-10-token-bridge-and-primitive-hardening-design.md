# Design: Token CSS Bridge + Primitive Hardening

**Date:** 2026-03-10
**Domain:** 🎨 UI / UX / Frontend
**Status:** Approved

---

## Problem Statement

The project has two disconnected styling layers:

1. `packages/tokens/*.ts` — TypeScript objects consumed via inline `style={}` props
2. `packages/ui/reusables/*.tsx` — RNR components using Tailwind `className` strings

Because no `@theme` block exists in any CSS file, Tailwind semantic utilities
(`bg-primary`, `text-foreground`, `border-border`, etc.) are undefined at the CSS
layer. Consequences:
- Dark mode cannot work (inline styles do not respond to `.dark` or `prefers-color-scheme`)
- The two layers are mismatched and produce inconsistent results
- Several existing components violate §9 (missing states), §17 (hardcoded spacing), and §1.1 (hardcoded values)
- Missing primitives required by §26 canonical patterns (PriceTag, Checkbox, Toast, etc.)

---

## Approach: Phase A → Phase C

Chosen approach: **Wire tokens to CSS first, then harden existing components, then add missing primitives.**
All work is constrained to `packages/ui/**` per §4.1 and §9.

---

## Phase A — CSS Token Bridge

### Goal
Create `packages/ui/global.css` with a Tailwind v4 `@theme` block that maps every
TypeScript token value to a CSS custom property. This becomes the single source of
truth for both the web className layer and the native inline-style layer.

### Design

**File:** `packages/ui/global.css`

```css
@import 'tailwindcss';
@import 'uniwind';

@theme {
  /* Colors */
  --color-background: hsl(30 8% 99%);
  --color-background-secondary: hsl(30 6% 97%);
  --color-foreground: hsl(20 10% 8%);
  --color-foreground-muted: hsl(20 8% 35%);
  --color-border: hsl(30 10% 88%);
  --color-primary: hsl(358 74% 50%);
  --color-primary-hover: hsl(358 74% 44%);
  --color-primary-foreground: hsl(0 0% 100%);
  --color-muted: hsl(30 6% 97%);
  --color-muted-foreground: hsl(20 8% 35%);
  --color-card: hsl(30 8% 99%);
  --color-destructive: hsl(358 100% 42%);
  --color-success: hsl(162 100% 39%);
  --color-warning: hsl(39 95% 43%);
  --color-info: hsl(210 90% 40%);

  /* Dark mode overrides via @variant dark (Tailwind v4) */

  /* Radius — §25.3: sharp by default */
  --radius-none: 0px;
  --radius-xs: 0px;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 8px;
  --radius-full: 9999px;
  --radius: 4px; /* default semantic alias */

  /* Spacing — 8px rhythm from §25.1 */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
  --spacing-32: 128px;

  /* Typography */
  --font-sans: "Inter", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-heading: "Space Grotesk", "Inter", -apple-system, system-ui, sans-serif;
  --font-mono: Menlo, monospace;

  /* Elevation (web box-shadow) */
  --shadow-xs: 0 0 0 1px hsla(355 12% 8% / 0.04), 0 2px 4px hsla(355 12% 8% / 0.06);
  --shadow-sm: 0 0 0 1px hsla(355 12% 8% / 0.05), 0 4px 10px hsla(355 12% 8% / 0.08);
  --shadow-md: 0 0 0 1px hsla(355 12% 8% / 0.06), 0 8px 18px hsla(355 12% 8% / 0.10);
  --shadow-lg: 0 0 0 1px hsla(355 12% 8% / 0.07), 0 12px 28px hsla(355 12% 8% / 0.12);
  --shadow-xl: 0 0 0 1px hsla(355 12% 8% / 0.08), 0 20px 40px hsla(355 12% 8% / 0.14);

  /* Motion — §24 tokenized */
  --duration-micro: 300ms;
  --duration-hover: 400ms;
  --duration-reveal: 600ms;
  --duration-stagger: 20ms;
  --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-exit: cubic-bezier(0.7, 0, 0.84, 0);

  /* Z-index */
  --z-base: 0;
  --z-raised: 10;
  --z-sticky: 100;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-dropdown: 700;
}

@variant dark {
  :root {
    --color-background: hsl(20 10% 7%);
    --color-background-secondary: hsl(20 8% 10%);
    --color-foreground: hsl(30 8% 95%);
    --color-foreground-muted: hsl(20 6% 60%);
    --color-border: hsl(20 8% 20%);
    --color-muted: hsl(20 8% 13%);
    --color-muted-foreground: hsl(20 6% 60%);
    --color-card: hsl(20 8% 9%);
  }
}
```

**Import chain update:**
Both app CSS entries import this file:
```css
/* apps/next/app/globals.css */
@import '../../../packages/ui/global.css'; /* add before tailwindcss */
@import 'tailwindcss';
@import 'uniwind';

/* apps/expo/global.css */
@import '../../packages/ui/global.css';
@import 'tailwindcss';
@import 'uniwind';
```

**AGENTS rules satisfied:**
- §1.1: All CSS variables map 1:1 from `packages/tokens/*.ts` — token is still source of truth
- §9: UniWind in `packages/ui` only ✓
- §20/P1: `@theme` / `@variant` for static theming ✓
- §21 guard: No hex colors (all HSL) ✓
- §17 RTL: No directional values in CSS variables ✓

---

## Phase C — Component Hardening

### Violations to fix (existing components)

| Component | Violation | Fix |
|-----------|-----------|-----|
| `Badge.tsx` | `minHeight: 24` hardcoded | → `spacing.sm * 3` or add `spacing.badgeHeight` token alias |
| `Button.tsx` | Missing `loading` and `error` states | Add `loading` prop with Skeleton/Spinner, `error` variant |
| `Badge.tsx` | No states at all | Add `disabled` state (§9) |
| `Icon.tsx` | Possibly hardcoded sizes | Audit and fix |
| Any component using `paddingLeft`/`paddingRight` | RTL violation §17 | Replace with `paddingHorizontal` or logical CSS |

### State policy (§9) — required on every component

Every component must handle:
- `loading` — Skeleton or spinner replacement
- `empty` — Empty content fallback
- `error` — Error visual fallback
- `disabled` — Reduced opacity + interaction blocked
- `out-of-stock` — Added when component involves purchasable product

---

## Phase B — Missing Primitives (per §26 canonical patterns)

Priority ordered by §26 dependency:

### B1 — Commerce primitives (§26.1 ProductCard, §26.3 PDP)
- **`PriceTag`** — sale price + compare-at price, currency, RTL-safe, `text-destructive` for sale
- **`StockBadge`** — in-stock / low-stock / out-of-stock states, maps to `status` tokens
- **`QuantityInput`** — decrement/increment with min/max, disabled at bounds

### B2 — Form primitives (§26.5 Checkout, §26.6 Account)
- **`Checkbox`** — RNR-based, accessible, `loading`/`disabled` states
- **`Switch`** — RNR-based toggle, `disabled` state
- **`Textarea`** — multi-line input, token-based sizing
- **`FormField`** — label + input + error message wrapper, RTL-safe

### B3 — Feedback primitives (§26.4 Cart, §26.2 PLP)
- **`Toast`** — moti `AnimatePresence` for mount/unmount (§20.1), `success`/`error`/`info` tones from `status` tokens
- **`Alert`** — inline feedback banner, same tones as Toast
- **`Spinner`** — moti-based, tokenized duration

---

## Constraints (all from AGENTS.md)

| Rule | Application |
|------|-------------|
| §1.1 | All values from `@real/tokens` — no hardcoded colors, spacing, radius, fonts |
| §4.1 | All new files in `packages/ui/**` only |
| §9 | UniWind className only in `packages/ui/**`, forbidden in `packages/app/**` |
| §9 state | loading + empty + error + disabled on every component; + out-of-stock on purchasables |
| §17 | Logical spacing (start/end/horizontal/vertical), no left/right |
| §20.1 | `moti` for cross-platform animation; no reanimated side-effect imports |
| §21 | `yarn guard:checks` must pass after every phase |
| §24 | Motion durations and easings from tokens (`--duration-micro`, `--ease-premium`) |
| §25.3 | Sharp radius default (2–4px); full/pill only where justified |
| §26 | Canonical composition patterns — no ad-hoc layout invention |
| §27 | Check `packages/ui` before adding — extend existing before creating new |

---

## Execution Order

```
Phase A:  packages/ui/global.css  (CSS token bridge)
          ↓ import in apps/next + apps/expo
          ↓ yarn guard:checks ✓

Phase C:  Fix hardcoded values in Badge, Button, Icon
          Add missing states to Button, Badge
          RTL audit all components
          ↓ yarn guard:checks ✓

Phase B1: PriceTag, StockBadge, QuantityInput
Phase B2: Checkbox, Switch, Textarea, FormField
Phase B3: Toast, Alert, Spinner
          ↓ yarn guard:checks ✓ after each group
```

---

## Definition of Done (§22)

- [ ] `yarn guard:checks` passes
- [ ] No hardcoded colors, spacing, radius, font values in `packages/ui`
- [ ] Every new/changed component has all required states
- [ ] All components validated in LTR and RTL
- [ ] New CSS custom properties map 1:1 from `packages/tokens/*.ts`
- [ ] Dark mode via `@variant dark` tested
