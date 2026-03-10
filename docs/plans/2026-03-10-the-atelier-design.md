# The Atelier — REAL Cosmetics Marketplace Design

**Date:** 2026-03-10
**Domain:** 🎨 UI / UX / Frontend
**Status:** Approved

---

## Brand Brief

**Brand:** REAL Cosmetics — "endless beauty"
**Logo:** Black wordmark + red swoosh, "endless beauty" tagline. White-on-ink and black-on-white both work.
**Positioning:** Premium marketplace with offers and campaigns *everywhere* — high-frequency selling without looking cheap.
**Reference:** Sephora.com × feel22.com — editorial photography, campaign intensity, curated feel.

---

## Design Philosophy

**"The Atelier"** — an ink shell (prestige anchor) housing bright white product interiors.

- Dark ink sections serve as campaign anchors — they signal importance and create section separation
- Pure white sections are product surfaces — clean, fresh, editorial
- Every section heading follows the **Offer Formula**: `[quantity/urgency word] · [separator] · [product scope]`
- Two accent colors: **Crimson** (CTA, urgency, sale) and **Gold** (exclusive, loyalty, featured)
- Typography mixes ultra-thin descriptors with ultra-heavy numbers — contrast = perceived value

---

## Section 1 — Color System

### New Token Additions (`packages/tokens/colors.ts`)

#### Ink Family (prestige backgrounds)
| Token name | HSL value | Use |
|------------|-----------|-----|
| `inkBlack` | `hsl(20 10% 8%)` | Ink section backgrounds, top-of-page hero anchors |
| `inkDeep` | `hsl(20 8% 13%)` | Card backgrounds inside ink sections |
| `inkMid` | `hsl(20 8% 20%)` | Dividers, borders inside ink sections |
| `inkFrost` | `hsl(30 8% 95%)` | Light text *on* ink (not pure white — avoids harshness) |

#### Gold Family (exclusive/loyalty accent)
| Token name | HSL value | Use |
|------------|-----------|-----|
| `goldPrimary` | `hsl(39 95% 43%)` | Gold accent text, loyalty badge fills, featured labels |
| `goldLight` | `hsl(42 100% 75%)` | Hover/active state of gold elements |
| `goldSubtle` | `hsl(42 60% 92%)` | Subtle gold tint on white backgrounds |

#### Surface Update
| Token | Old value | New value | Reason |
|-------|-----------|-----------|--------|
| `background` | `hsl(30 8% 99%)` (warm cream) | `hsl(0 0% 100%)` (pure white) | Logo is black+white — cream clashes with white logo lockup |
| `backgroundSecondary` | `hsl(30 6% 97%)` (warm gray) | `hsl(0 0% 97%)` (cool light gray) | Neutral foil for pure white |

#### Crimson (already exists as `brandPrimary`) — aliased for intent clarity
Add semantic aliases:
- `salePrice` → alias of `brandPrimary` (crimson) — explicit intent for PriceTag
- `ctaBackground` → alias of `brandPrimary` — explicit intent for cart/add buttons
- `urgencyBadge` → alias of `brandPrimary` — flash-sale / limited-time badges

---

## Section 2 — Typography Scale

### New Campaign Tiers (`packages/tokens/typography.ts`)

Three new font-size tokens for campaign/hero contexts:

| Token | Value | Use |
|-------|-------|-----|
| `fontSize.campaign` | `72px` | Full-width hero headline (home hero, campaign anchors) |
| `fontSize.headline` | `56px` | Section-level ink-anchor headings |
| `fontSize.subheadline` | `18px` | Offer descriptor line sitting above/below the big number |

### Mixed-Weight Contrast Pattern

Every campaign number or headline uses weight pairing:
```
[light/100 descriptor text]
[black/900 quantity or price number]
[regular/400 scope text]
```

Example (flash-sale section):
```
up to                    ← fontWeight 100, fontSize subheadline, color inkFrost/muted
40% OFF                  ← fontWeight 900, fontSize headline, color goldPrimary OR white
bestselling skincare      ← fontWeight 400, fontSize body, color inkFrost
```

### New Font-Weight Tokens
| Token | Value |
|-------|-------|
| `fontWeight.ultra` | `'100'` |
| `fontWeight.black` | `'900'` |

### Letter-Spacing Tokens
| Token | Value | Use |
|-------|-------|-----|
| `letterSpacing.campaign` | `'-0.03em'` | Campaign headings — tight for editorial weight |
| `letterSpacing.label` | `'0.12em'` | Section label pills, badge text — wide for prestige |
| `letterSpacing.caps` | `'0.08em'` | All-caps category nav labels |

---

## Section 3 — Home Page Rhythm

### 13-Section Architecture

```
┌────────────────────────────────────────────┐
│  1. TOP PROMO BAR          [ink bg]        │  ← crimson ticker or gold text
├────────────────────────────────────────────┤
│  2. STICKY HEADER          [ink bg]        │  ← always visible
│     CATEGORY SHELF NAV     [white bg]      │
├────────────────────────────────────────────┤
│  3. HERO CAMPAIGN BLOCK    [ink bg]        │  anchor 1 — full-width editorial image + CTA
├────────────────────────────────────────────┤
│  4. FLASH SALE BAND        [crimson bg]    │  ← Countdown + "40% OFF" + shop link
├────────────────────────────────────────────┤
│  5. FEATURED CATEGORIES    [white bg]      │  product surface — 4 category tiles
├────────────────────────────────────────────┤
│  6. CAMPAIGN ANCHOR #2     [ink bg]        │  anchor 2 — "New Arrivals" editorial
├────────────────────────────────────────────┤
│  7. BESTSELLERS RAIL       [white bg]      │  product surface — horizontal scroll
├────────────────────────────────────────────┤
│  8. CAMPAIGN ANCHOR #3     [ink bg]        │  anchor 3 — "Exclusive Brands" editorial
├────────────────────────────────────────────┤
│  9. BRAND SPOTLIGHT        [white bg]      │  product surface — brand logos + products
├────────────────────────────────────────────┤
│ 10. CAMPAIGN ANCHOR #4     [ink bg]        │  anchor 4 — Loyalty / Gold tier push
├────────────────────────────────────────────┤
│ 11. NEW ARRIVALS GRID      [white bg]      │  product surface — 2-col grid
├────────────────────────────────────────────┤
│ 12. CAMPAIGN ANCHOR #5     [ink bg]        │  anchor 5 — seasonal / newsletter
├────────────────────────────────────────────┤
│ 13. FOOTER                 [ink bg]        │  links, legal, socials
└────────────────────────────────────────────┘
```

### Section Heading Offer Formula
All white-section headings follow this pattern:
```
[LABEL PILL in crimson or gold]   ← small caps, letter-spacing.label
[QUANTITY WORD] [PRODUCT SCOPE]   ← headline size, black weight
[urgency descriptor]              ← body size, ultra weight, muted tone
```

### Product Card Anatomy (3:4 aspect ratio)
```
┌──────────────────────┐
│                      │
│    3:4 image area    │  ← SolitoImage, object-cover
│                      │
│  [SALE badge]        │  ← crimson badge, absolute top-left
│  [wishlist ♡]        │  ← absolute top-right
├──────────────────────┤
│  BRAND NAME          │  ← caption, muted, letter-spacing.label, caps
│  Product Name        │  ← body, weight 600
│  ★★★★☆ (42)         │  ← StarRating component
│  $89  ~~$120~~       │  ← price bold, compare-at muted strikethrough
├──────────────────────┤
│  [ADD TO BAG]        │  ← crimson, full-width, height 40
└──────────────────────┘
```

---

## Section 4 — Chrome

### Sticky Header (`HeaderMainRow.tsx`)
```
┌─────────────────────────────────────────────────────────────────┐
│  ink bg, h=56px, sticky z-sticky                                │
│  [LOGO - white wordmark]    [Search bar]    [Account] [♡] [🛒]  │
│                                             [───────────────]   │
│                                             Cart btn: CRIMSON   │
└─────────────────────────────────────────────────────────────────┘
```
- Background: `colors.inkBlack` (token)
- Logo: white lockup
- Icons: `colors.inkFrost` (not pure white)
- Cart button: `colors.brandPrimary` (crimson) background, white label, pill shape
- Search bar: `colors.inkDeep` background, `colors.inkFrost` placeholder

### Category Shelf Nav
- Separate row below header — `background: colors.background` (pure white)
- Horizontal scroll on mobile, full row on desktop
- All-caps labels, `letterSpacing.caps`, `fontWeight.medium`
- Active/hover: crimson underline or text
- Special "Offers" label: `colors.brandPrimary` text (not white/black)

### TopPromoBar
- Background: `colors.inkBlack` (matches header — seamless)
- Text: alternating crimson offer + gold separator `·` + inkFrost text
- Ticker animation via moti (cross-platform, §20.1 compliant)

---

## Section 5 — Component Change Summary

### Token Files to Modify
1. **`packages/tokens/colors.ts`** — Add `inkBlack`, `inkDeep`, `inkMid`, `inkFrost`, `goldPrimary`, `goldLight`, `goldSubtle`; update `background` to pure white; add `salePrice`, `ctaBackground`, `urgencyBadge` aliases
2. **`packages/tokens/typography.ts`** — Add `fontSize.campaign`, `fontSize.headline`, `fontSize.subheadline`, `fontWeight.ultra`, `fontWeight.black`, `letterSpacing.campaign`, `letterSpacing.label`, `letterSpacing.caps`
3. **`packages/ui/global.css`** — Add corresponding CSS custom properties for all new tokens to `@theme` block

### Existing Components to Update
| Component | Change |
|-----------|--------|
| `packages/ui/components/chrome/HeaderMainRow.tsx` | Ink background, white logo, inkFrost icons, crimson cart button |
| `packages/app/sections/home/HomeV2Sections.tsx` | Wire all 13 sections in order |
| `packages/ui/components/home/TopPromoBar` (or new) | Ink background + moti ticker |
| `packages/ui/components/home-v2/HeroCampaignSlider.tsx` | Ink background, mixed-weight headline, campaign typography |
| `packages/ui/components/home/types.ts` | Add campaign/anchor section types |

### New Components to Create
| Component | Location | Purpose |
|-----------|----------|---------|
| `FlashSaleBand` | `packages/ui/components/home-v2/FlashSaleBand.tsx` | Crimson band with countdown + "40% OFF" mixed-weight offer |
| `CampaignHeroBlock` | `packages/ui/components/home-v2/CampaignHeroBlock.tsx` | Ink-background editorial section (image + headline + CTA) |
| `CountdownTimer` | `packages/ui/components/home-v2/CountdownTimer.tsx` | Live HH:MM:SS countdown using moti digit flip |

---

## Constraints (AGENTS.md)

| Rule | Application |
|------|-------------|
| §1.1 | All color/spacing/radius values from `@real/tokens` — never hardcoded |
| §4.1 | All new/modified UI files in `packages/ui/**` only |
| §9 | UniWind `className` only in `packages/ui/**`; every component has loading/error/disabled states |
| §17 | RTL logical props: `paddingHorizontal`, `borderStartWidth`, `marginStart`/`marginEnd` |
| §20.1 | `moti` for all animations (ticker, digit flip, hero transitions) — no direct reanimated imports |
| §21 | `yarn guard:checks` passes after each phase — no hex colors, no `className` in `packages/app` |
| §24 | Motion durations from `--duration-micro`, `--duration-hover`, `--ease-premium` tokens |
| §25.3 | Sharp radius default (2–4px); pill only for promo badges (justified) |
| §26 | Canonical composition: ProductCard uses PriceTag, StockBadge, StarRating sub-components |

---

## Definition of Done

- [ ] `yarn guard:checks` passes after every phase
- [ ] Ink sections (`inkBlack` background) render correctly on web and native
- [ ] Gold accent (`goldPrimary`) used for loyalty/exclusive labels only — not CTA
- [ ] Crimson (`brandPrimary`) used for CTA, sale, urgency only — not decorative
- [ ] ProductCard uses 3:4 aspect ratio image area
- [ ] All new token names exported from `@real/tokens` package index
- [ ] CSS custom properties in `global.css` match TypeScript token values 1:1
- [ ] CountdownTimer uses moti — no `setInterval` without cleanup
- [ ] All new components handle loading, disabled, error states
