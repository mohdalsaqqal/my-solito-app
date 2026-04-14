# Design System — Monochrome Commerce

> **Date:** 2026-04-13
> **Status:** Approved for implementation
> **Direction:** Monochrome Canvas — black, white, gray, one red stroke
> **Reference:** niceonesa.com restraint + REAL Cosmetics logo identity

---

## Brand Identity

**Logo DNA:** Black text, white background, one red brush stroke underline. That's the entire brand palette. The UI must mirror this exactly.

**Philosophy:** Restraint is the signature. Product photography carries all visual weight. The interface never competes with what's being sold.

**Anti-references:** No luxury-editorial (Aesop, Glossier). No warm tones (rose, coral, amber, beige). No decorative color.

---

## 1. Color System

### Rule

Black for text. Gray for surfaces and borders. White for backgrounds. Red for exactly three things per page.

### Surfaces

| Token | Value | Usage |
|---|---|---|
| `colors.surface` | `#FFFFFF` | All cards, modals, inputs, elevated objects |
| `colors.background` | `#FAFAFA` | Page background, section separators |
| `colors.surfaceHover` | `#F5F5F5` | Card hover states, subtle container fills |

**Three values. Nothing else.**

### Black Scale (Text Hierarchy)

Pure black dilution — no gray tint. Every text element in the platform maps to one of these nine steps.

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `colors.ink.900` | `#0A0A0A` | `hsl(0 0% 4%)` | Hero headline, logo text |
| `colors.ink.800` | `#171717` | `hsl(0 0% 9%)` | Page headings, primary CTA text |
| `colors.ink.700` | `#262626` | `hsl(0 0% 15%)` | Section titles, strong text, product price |
| `colors.ink.600` | `#404040` | `hsl(0 0% 25%)` | Body text — default reading |
| `colors.ink.500` | `#525252` | `hsl(0 0% 32%)` | Secondary body, descriptions, brand names |
| `colors.ink.400` | `#737373` | `hsl(0 0% 45%)` | Meta text, timestamps, captions |
| `colors.ink.300` | `#A3A3A3` | `hsl(0 0% 64%)` | Placeholder text, disabled text |
| `colors.ink.200` | `#D4D4D4` | `hsl(0 0% 83%)` | Disabled borders, subtle dividers |
| `colors.ink.100` | `#E5E5E5` | `hsl(0 0% 89%)` | Card borders, input borders |

**Hierarchy bands:**
- `ink.900`–`ink.700` — Headlines, commands attention
- `ink.600` — Body text, the workhorse
- `ink.500`–`ink.400` — Secondary, supportive
- `ink.300` and lighter — Inactive, structural, recedes

### Red Accent (Single Source)

| Token | Hex | Usage |
|---|---|---|
| `colors.brand` | `#D31018` | Logo red — the underline stroke |
| `colors.brandHover` | `#B80D14` | Hover on brand elements |
| `colors.brandSubtle` | `#FDECEC` | Subtle tint for sale badges |

**Red usage limit: maximum 3 places per page.**
1. Brand underline element (matching logo)
2. Sale badges / sale prices
3. CTA hover state

Nowhere else. Never four.

### Semantic Colors (Functional Only)

| Token | Hex | Usage |
|---|---|---|
| `colors.success` | `#16A34A` | Order confirmed, in stock, completed |
| `colors.warning` | `#CA8A04` | Low stock, expiring offers |
| `colors.error` | `#DC2626` | Form errors, destructive actions |
| `colors.info` | `#2563EB` | Help text, status indicators |
| `colors.focusRing` | `#2563EB` | Focus indicator |

These appear only in their functional context. Never as decoration.

### Borders

| Token | Value | Usage |
|---|---|---|
| `colors.border` | `#E5E5E5` (`ink.100`) | Default card borders, input borders |
| `colors.borderStrong` | `#D4D4D4` (`ink.200`) | Hover borders, active borders |

---

## 2. Type Scale

### Font

**Manrope** for all Latin text. **Tajawal** for all Arabic text. No serif, no secondary family, no script fonts.

### Scale (7 Steps — Dense Commerce)

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `typo.display` | 36px | 800 | 40px | -1.5px | Hero headline (desktop only) |
| `typo.h1` | 24px | 700 | 30px | -0.5px | Page titles, section headers |
| `typo.h2` | 18px | 700 | 24px | -0.3px | Card titles, rail headers |
| `typo.h3` | 16px | 600 | 22px | -0.2px | Sub-section titles |
| `typo.body` | 14px | 400 | 20px | 0 | Default body text, descriptions |
| `typo.small` | 12px | 400 | 16px | 0 | Meta, captions, labels |
| `typo.tiny` | 11px | 500 | 14px | +0.5px | Overline, eyebrow, timestamps |

### Rules

- **Dense, not spacious** — 14px body for a 15,000-product marketplace. Information density matters.
- **800 weight on display** — matches the bold "REAL" in the logo. Heavy, confident.
- **No sizes between steps** — if it doesn't fit one of these seven, you're using the wrong element.
- **Tight tracking on large text** — feels editorial and intentional.
- **500 weight on tiny text** — small text needs weight to remain legible.

### Hierarchy Example

```
REAL Cosmetics          ← display (36px/800)
Skincare                ← h1 (24px/700)
  Vitamin C Serum        ← h2 (18px/700)
    Brightening serum    ← body (14px/400)
    $29.99  ★★★★☆ (128)  ← small (12px/400)
    NEW                 ← tiny (11px/500)
```

---

## 3. Spacing & Layout

### Rule

4px base unit. Every margin, padding, and gap is a multiple. No exceptions.

### Scale

| Token | Value | Multiple | Usage |
|---|---|---|---|
| `space.0` | 0 | — | Reset |
| `space.1` | 4px | 1× | Tight internal gaps (icon+text) |
| `space.2` | 8px | 2× | Related items (price+rating) |
| `space.3` | 12px | 3× | Card internal padding |
| `space.4` | 16px | 4× | Standard gap between elements |
| `space.5` | 20px | 5× | Medium separation |
| `space.6` | 24px | 6× | Card-to-card gap, section padding |
| `space.8` | 32px | 8× | Section-to-section gap |
| `space.10` | 40px | 10× | Major content separation |
| `space.12` | 48px | 12× | Page-level gaps |
| `space.16` | 64px | 16× | Hero area padding |
| `space.20` | 80px | 20× | Full section padding |
| `space.24` | 96px | 24× | Page margins on wide screens |

### Rhythm Principle

**Tight groups, generous gaps.** Related items cluster at `space.1`–`space.3`. Unrelated sections separate at `space.8`–`space.20`. Nothing in between gets random spacing.

### Layout Grid

| Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|
| Mobile (<640px) | 2 | 8px | 16px |
| Tablet (640–1024px) | 3 | 16px | 24px |
| Desktop (>1024px) | 4 | 16px | 32px |

### Product Cards

- Always same height within a row
- Image area is square (1:1 ratio)
- No hover shadow lift — restraint over decoration

### Container Widths

| Token | Value | Usage |
|---|---|---|
| `container.narrow` | 960px | Forms, account pages, cart |
| `container.default` | 1200px | General content, product grids |
| `container.wide` | 1440px | Hero banners, full-width sections |

---

## 4. Components & States

Every component defines all five states: default, hover, active, focus, disabled.

### Global Rules

- **Radius: 0 (zero).** Sharp edges everywhere. Editorial, not playful.
- **No decorative shadows on cards.** The border IS the elevation indicator.
- **Min touch target: 44×44px** (WCAG AA compliance).

### Button

| Property | Value |
|---|---|
| Height | 44px |
| Horizontal padding | 24px |
| Radius | 0 |
| Font | `typo.small` / 12px / 500 weight |

**Primary CTA** (Add to Cart, Buy Now):
- Default: `bg-white` + `border ink.900` + `text ink.900`
- Hover: `bg-ink.900` + `text white`
- Active: `bg-ink.800` + `text white`
- Focus: `outline 2px focusRing offset 2px`
- Disabled: `border ink.200` + `text ink.300`

**Secondary** (Wishlist, Compare):
- Default: `border ink.200` + `text ink.700`
- Hover: `border ink.900` + `text ink.900`
- Active: `bg-ink.50` + `border ink.900`
- Disabled: `border ink.100` + `text ink.300`

**Ghost** (text-only links):
- Default: `text ink.600`
- Hover: `text ink.900`
- Active: `text ink.900`
- Disabled: `text ink.300`

### Input / Form Field

| Property | Value |
|---|---|
| Height | 44px |
| Horizontal padding | 12px |
| Radius | 0 |
| Font | `typo.body` / 14px |

- Default: `border ink.200` + `bg-white`
- Hover: `border ink.300`
- Focus: `border ink.900` (border IS the focus indicator, no extra ring)
- Error: `border brand` + error message below in `ink.900`
- Disabled: `bg-ink.50` + `border ink.100` + `text ink.300`
- Placeholder: `text ink.300`

### Card

| Property | Value |
|---|---|
| Radius | 0 |
| Background | `white` |
| Border | `1px ink.100` |

- Default: `bg-white` + `border ink.100`
- Hover: `border ink.300` (no shadow — restraint)
- Active: `border ink.900`
- Focus: `outline 2px focusRing`

### Badge / Tag

| Property | Value |
|---|---|
| Height | 20px |
| Horizontal padding | 6px |
| Radius | 0 |
| Font | `typo.tiny` / 11px / 500 |

- **Sale:** `bg-brand` + `text white`
- **New:** `bg-ink.900` + `text white`
- **Out of stock:** `bg-ink.100` + `text ink.400`
- **Default tag:** `bg-ink.50` + `text ink.600`

---

## 5. Motion

### Rule

Fast, purposeful, never decorative. Every animation serves state change, spatial orientation, or progressive disclosure.

### Duration Scale

| Token | Duration | Usage |
|---|---|---|
| `motion.instant` | 0ms | Immediate feedback (toggle, checkbox) |
| `motion.fast` | 150ms | Hover states, icon transitions |
| `motion.normal` | 250ms | Dropdown open/close, small transitions |
| `motion.slow` | 400ms | Page transitions, large reveals |
| `motion.stagger` | 40ms | Delay between staggered elements |

### Easing

| Token | Easing | Usage |
|---|---|---|
| `motion.easeOut` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Enter animations — decelerate into place |
| `motion.easeIn` | `cubic-bezier(0.4, 0.0, 1.0, 1)` | Exit animations — accelerate away |
| `motion.standard` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Default for everything else |

### Rules

1. **300ms max** for any interaction the user is waiting on.
2. **Enter is slower than exit.** Arriving things feel weighted. Leaving things get out of the way.
3. **No bounce, no elastic, no spring.** This brand is confident, not playful.
4. **Transform and opacity only.** Never animate width, height, padding, or margin.
5. **Respect reduced motion.** Disable non-essential animations when user prefers it.

### What Gets Animated

- Button hover (150ms, background/opacity shift)
- Dropdown open/close (250ms, opacity + translateY)
- Page section reveal on scroll (400ms, opacity + subtle translateY)
- Cart add confirmation (250ms, scale pulse on cart icon)
- Product card image hover (250ms, scale 1.02)

### What Does NOT Get Animated

- Layout shifts
- Color transitions (except button hover)
- Decorative particles, sparkles, floating elements
- Page load "splash" screens

---

## 6. Accessibility

### WCAG AA Compliance

| Requirement | Standard | Implementation |
|---|---|---|
| Contrast (normal text) | 4.5:1 | `ink.600` on `white` = 7.5:1 ✓ |
| Contrast (large text) | 3:1 | `ink.800` on `white` = 14:1 ✓ |
| Touch targets | 44×44px | All interactive elements |
| Focus indicators | Visible, 2px minimum | `focusRing` blue outline |
| Reduced motion | Respected | Motion disabled per preference |

### Color Independence

Color is never the sole indicator of state. All states have visual indicators beyond color (icons, text, borders).

---

## 7. File Locations

| Token Type | Source File |
|---|---|
| Colors (black scale + gray scale) | `packages/tokens/colors.ts` |
| Typography | `packages/tokens/typography.ts` |
| Spacing | `packages/tokens/spacing.ts` |
| Radius | `packages/tokens/radius.ts` |
| Shadows | `packages/tokens/shadows.ts` |
| Motion | `packages/tokens/motion.ts` |
| Components | `packages/tokens/components.ts` |

---

## 8. Migration Notes

### What Changes from Current System

| Current | New | Reason |
|---|---|---|
| Warm gray scale (`hsl(12 8% ...)`) | True black scale (`hsl(0 0% ...)`) | Match logo identity |
| Warm off-white surfaces | Pure white `#FFFFFF` | Clean canvas |
| Rose, coral, amber families | Removed entirely | Restraint is the signature |
| 9-step red scale | 3 red tokens (brand, hover, subtle) | Use red sparingly |
| `radius.md` (6px) cards | `radius.none` (0px) cards | Editorial sharp edges |
| Card hover shadow lift | Border color change only | No decorative shadows |
| Playfair Display serif | Removed, Manrope only | Brand coherence |
| 14+ typography aliases | 7 clean tokens | Intentional hierarchy |
| Warm beige borders | True gray borders | Structural, not decorative |

### What Stays

- Manrope font family (confirmed)
- Tajawal for Arabic (confirmed)
- 4px spacing grid (confirmed)
- WCAG AA compliance (confirmed)
- Token-first architecture (confirmed)
- Server-first data flow (confirmed)

---

## 9. Verification

After every design system change:

```bash
yarn guard:checks
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false
```

No hex literals in shared packages. No className in `packages/app`. No `process.env` outside `apps/next`.

---

*Approved: 2026-04-13*
