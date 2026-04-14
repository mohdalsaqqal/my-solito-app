# Design System — Real Cosmetics Commerce

> **Direction:** Monochrome Canvas — black, white, gray, one red stroke
> **Reference:** niceonesa.com restraint + REAL Cosmetics logo identity
> **Source of Truth:** All values implemented in `@real/tokens`. Never hardcode design values in shared UI.
> **Full spec:** `docs/plans/2026-04-13-monochrome-commerce-redesign-design.md`

---

## Brand Identity

**Logo DNA:** Black text, white background, one red brush stroke underline. The UI mirrors this exactly.

**Philosophy:** Restraint is the signature. Product photography carries all visual weight. The interface never competes with what's being sold.

**Anti-references:** No luxury-editorial (Aesop, Glossier). No warm tones (rose, coral, amber, beige). No decorative color.

**Target:** Women 18-40 shopping a cosmetics marketplace (~15,000 products). Dense, efficient, conversion-oriented.

---

## 1. Semantic Color System

**Rule:** No raw hex values in shared UI. Every color is named by purpose.

### Surfaces

| Token | Value | Usage |
|---|---|---|
| `colors.surface` | `#FFFFFF` | All cards, modals, inputs, elevated objects |
| `colors.background` | `#FAFAFA` | Page background, section separators |
| `colors.surfaceHover` | `#F5F5F5` | Card hover states, subtle fills |

### Black Scale (Text Hierarchy)

Pure black dilution. Nine steps from near-black to structural light.

| Token | Hex | Usage |
|---|---|---|
| `colors.ink.900` | `#0A0A0A` | Hero headline, logo text |
| `colors.ink.800` | `#171717` | Page headings, primary CTA text |
| `colors.ink.700` | `#262626` | Section titles, product price |
| `colors.ink.600` | `#404040` | Body text — default reading |
| `colors.ink.500` | `#525252` | Secondary body, brand names |
| `colors.ink.400` | `#737373` | Meta text, timestamps |
| `colors.ink.300` | `#A3A3A3` | Placeholder, disabled text |
| `colors.ink.200` | `#D4D4D4` | Disabled borders, subtle dividers |
| `colors.ink.100` | `#E5E5E5` | Card borders, input borders |

**Hierarchy bands:**
- `ink.900`–`ink.700` — Headlines, commands attention
- `ink.600` — Body text, the workhorse
- `ink.500`–`ink.400` — Secondary, supportive
- `ink.300` and lighter — Inactive, structural, recedes

### Red Accent (Single Source — Used Sparingly)

| Token | Hex | Usage |
|---|---|---|
| `colors.brand` | `#D31018` | Logo red — the underline stroke |
| `colors.brandHover` | `#B80D14` | Hover on brand elements |
| `colors.brandSubtle` | `#FDECEC` | Subtle tint for sale badges |

**Red usage limit: maximum 3 places per page.** Sale badges, brand underline, CTA hover. Nowhere else.

### Semantic Colors (Functional Only)

| Token | Hex | Usage |
|---|---|---|
| `colors.success` | `#16A34A` | Order confirmed, in stock |
| `colors.warning` | `#CA8A04` | Low stock, expiring offers |
| `colors.error` | `#DC2626` | Form errors, destructive |
| `colors.info` | `#2563EB` | Help text, status |
| `colors.focusRing` | `#2563EB` | Focus indicator |

### Borders

| Token | Value | Usage |
|---|---|---|
| `colors.border` | `#E5E5E5` (`ink.100`) | Default card/input borders |
| `colors.borderStrong` | `#D4D4D4` (`ink.200`) | Hover/active borders |

---

## 2. Type Scale

**One font: Manrope (sans-serif).** Tajawal for Arabic. No serif, no secondary family.

### Scale (7 Steps — Dense Commerce)

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `typo.display` | 36px | 800 | 40px | -1.5px | Hero headline (desktop) |
| `typo.h1` | 24px | 700 | 30px | -0.5px | Page titles, section headers |
| `typo.h2` | 18px | 700 | 24px | -0.3px | Card titles, rail headers |
| `typo.h3` | 16px | 600 | 22px | -0.2px | Sub-section titles |
| `typo.body` | 14px | 400 | 20px | 0 | Default body text |
| `typo.small` | 12px | 400 | 16px | 0 | Meta, captions, labels |
| `typo.tiny` | 11px | 500 | 14px | +0.5px | Overline, eyebrow, timestamps |

### Rules

- 14px body for high-density marketplace. Information density matters.
- 800 weight on display matches the bold "REAL" in the logo.
- No sizes between steps — use the right token.
- Tight tracking on large text feels editorial.

---

## 3. Consistent Spacing

**Rule:** 4px base unit. Every margin, padding, and gap is a multiple.

### Scale

| Token | Value | Usage |
|---|---|---|
| `space.0` | 0 | Reset |
| `space.1` | 4px | Tight internal gaps |
| `space.2` | 8px | Related items |
| `space.3` | 12px | Card internal padding |
| `space.4` | 16px | Standard gap |
| `space.5` | 20px | Medium separation |
| `space.6` | 24px | Card-to-card gap |
| `space.8` | 32px | Section-to-section |
| `space.10` | 40px | Major separation |
| `space.12` | 48px | Page-level gaps |
| `space.16` | 64px | Hero padding |
| `space.20` | 80px | Full section padding |
| `space.24` | 96px | Page margins (wide) |

### Rhythm

**Tight groups, generous gaps.** Related items at `space.1`–`space.3`. Unrelated at `space.8`–`space.20`.

### Layout Grid

| Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|
| Mobile (<640px) | 2 | 8px | 16px |
| Tablet (640–1024px) | 3 | 16px | 24px |
| Desktop (>1024px) | 4 | 16px | 32px |

### Containers

| Token | Value | Usage |
|---|---|---|
| `container.narrow` | 960px | Forms, account, cart |
| `container.default` | 1200px | General content, grids |
| `container.wide` | 1440px | Hero, full-width |

---

## 4. Component States

**Rule:** Every component defines all five states. Sharp edges (radius 0). No decorative shadows.

### Global

| Property | Value |
|---|---|
| Radius | 0 (zero — sharp edges) |
| Min touch target | 44×44px (WCAG AA) |
| Card hover | Border color change only, no shadow lift |

### Button

| Property | Value |
|---|---|
| Height | 44px |
| Padding | 24px horizontal |
| Font | `typo.small` / 12px / 500 |

**Primary CTA:**
- Default: white bg + ink.900 border + ink.900 text
- Hover: ink.900 bg + white text
- Active: ink.800 bg + white text
- Focus: 2px focusRing outline
- Disabled: ink.200 border + ink.300 text

**Secondary:**
- Default: ink.200 border + ink.700 text
- Hover: ink.900 border + ink.900 text
- Active: ink.50 bg + ink.900 border
- Disabled: ink.100 border + ink.300 text

**Ghost:**
- Default: ink.600 text
- Hover: ink.900 text
- Disabled: ink.300 text

### Input

| Property | Value |
|---|---|
| Height | 44px |
| Padding | 12px horizontal |
| Font | `typo.body` / 14px |

- Default: ink.200 border + white bg
- Hover: ink.300 border
- Focus: ink.900 border
- Error: brand border + error message
- Disabled: ink.50 bg + ink.100 border + ink.300 text
- Placeholder: ink.300 text

### Card

| Property | Value |
|---|---|
| Radius | 0 |
| Background | white |
| Border | 1px ink.100 |

- Default: white + ink.100 border
- Hover: ink.300 border
- Active: ink.900 border
- Focus: 2px focusRing

### Badge

| Property | Value |
|---|---|
| Height | 20px |
| Padding | 6px horizontal |
| Radius | 0 |
| Font | `typo.tiny` / 11px / 500 |

- **Sale:** brand bg + white text
- **New:** ink.900 bg + white text
- **Out of stock:** ink.100 bg + ink.400 text
- **Default:** ink.50 bg + ink.600 text

---

## 5. Purposeful Motion

**Rule:** Fast, purposeful, never decorative. 300ms max for interactions.

### Duration Scale

| Token | Duration | Usage |
|---|---|---|
| `motion.instant` | 0ms | Immediate feedback |
| `motion.fast` | 150ms | Hover states, icon transitions |
| `motion.normal` | 250ms | Dropdowns, small transitions |
| `motion.slow` | 400ms | Page transitions, large reveals |
| `motion.stagger` | 40ms | Staggered elements |

### Easing

| Token | Easing | Usage |
|---|---|---|
| `motion.easeOut` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Enter — decelerate into place |
| `motion.easeIn` | `cubic-bezier(0.4, 0.0, 1.0, 1)` | Exit — accelerate away |
| `motion.standard` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Default |

### Rules

1. 300ms max for any interaction.
2. Enter slower than exit.
3. No bounce, no elastic, no spring.
4. Transform and opacity only.
5. Respect reduced motion preference.

### What Gets Animated

- Button hover (150ms)
- Dropdown open/close (250ms, opacity + translateY)
- Section reveal on scroll (400ms, opacity + subtle translateY)
- Cart add confirmation (250ms, scale pulse)
- Product image hover (250ms, scale 1.02)

### What Does NOT Get Animated

- Layout shifts
- Color transitions (except button hover)
- Decorative particles, sparkles
- Page load splash screens

---

## 6. Accessibility

### WCAG AA Compliance

| Requirement | Standard | Implementation |
|---|---|---|
| Contrast (normal text) | 4.5:1 | ink.600 on white = 7.5:1 |
| Contrast (large text) | 3:1 | ink.800 on white = 14:1 |
| Touch targets | 44×44px | All interactive elements |
| Focus indicators | Visible, 2px | focusRing blue outline |
| Reduced motion | Respected | Disabled per preference |

Color is never the sole indicator of state.

---

## 7. File Locations

| Token Type | File |
|---|---|
| Colors | `packages/tokens/colors.ts` |
| Typography | `packages/tokens/typography.ts` |
| Spacing | `packages/tokens/spacing.ts` |
| Radius | `packages/tokens/radius.ts` |
| Shadows | `packages/tokens/shadows.ts` |
| Motion | `packages/tokens/motion.ts` |
| Components | `packages/tokens/components.ts` |
| Main Export | `packages/tokens/index.ts` |

---

## 8. Verification

After any design system change:

```bash
yarn guard:checks
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false
```

No hex literals in shared packages. No className in `packages/app`. No `process.env` outside `apps/next`.

---

*Last updated: 2026-04-13*
