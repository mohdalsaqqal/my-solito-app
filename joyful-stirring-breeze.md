# Homepage UI/UX Redesign — "Souk Energy"

## Context

The homepage currently renders CMS blocks with functional but unstyled components — ghost buttons for categories, plain text headers, uniform spacing. The goal is to transform it into a bold, energetic, dense beauty commerce homepage targeting the Arab/GCC market. Direction: **NiceOne/Noon energy** — promotional-heavy, deal-forward, warm color palette, dense product grids.

Products already have images. Categories will use icons (not images).

---

## Visual Hierarchy Audit Findings

These findings drive every phase below. Fixes are ranked by impact.

### Current Eye Path (broken)
1. **TopPromoBar** — black background (`hsl(0 0% 0%)`) is highest contrast on page, steals first-look from hero
2. **Flash Sale Band** — deep rose band with 22px/900-weight countdown digits in coral
3. **Hero Badge** — brand red pill on hero image pops before the CTA button

### Correct Eye Path (target)
1. **Hero Carousel** — campaign storytelling, highest-value real estate
2. **Flash Deals / First Product Rail** — conversion driver with pricing urgency
3. **Category Navigation** — fast wayfinding for intent-driven users

### Problems Identified

| # | Element | Problem | Fix | Impact |
|---|---------|---------|-----|--------|
| P1 | TopPromoBar | Black bg dominates hero; utility msg gets hero-level attention | Change bg to `c.roseBlush`, text weight 700→600, tone inverse→default | **HIGHEST** |
| P2 | Section headers | All identical 18px/700 serif — no hierarchy between sections | Add `size` prop: `lg`(28px/800) for deals, `md`(18px/700) default, `sm`(16px/600 sans) for utility | HIGH |
| P3 | Product rails | All same card width (240px), visually indistinguishable strips | Reduce to 180px for 5-6 cards, vary by section importance | HIGH |
| P4 | Category strip | Ghost buttons look like form elements, has unnecessary header | Remove header, use 56px circles with icons, self-explanatory nav | HIGH |
| P5 | Brand rail | 56px logos in 144px cards look like category items | Enlarge logos to 72px, narrow cards to 120px, add section header | MEDIUM |
| P6 | Hero CTA | White `secondary` button has less weight than the badge above it | Change to `primaryCommerce` (burgundy), increase gradient overlay | MEDIUM |
| P7 | rootGap | Uniform 16px between ALL sections — flat list feeling | Vary: 16px tight, 32px standard, 40px around colored bands, 64px before CTAs | MEDIUM |
| P8 | Eyebrow pills | Red `danger` tone feels alarming, not promotional | Change bg to `c.coralSubtle`, text to `c.coralPrimary` — warm, not urgent | LOW |

---

## Quality Diagnosis Findings

### 3 Root Problems
1. **Dead interactivity** — no hover states on cards, categories, brands. Button scale 1.005 is invisible. Page feels like a screenshot.
2. **Radius chaos** — 7 different values (0, 2, 4, 6, 8, 16, 9999px) on the same page. Product cards at 2px look like a different design system from hero cards at 16px.
3. **Product images use `contain`** — white letterboxing around every product. Looks like database thumbnails, not curated beauty photography.

### 10X Treatment (3 changes)
| # | Change | Files | Why Premium |
|---|--------|-------|-------------|
| Q1 | **Unified hover system** — every interactive surface: lift 2px, shadow, easing `cubic-bezier(0,0,0.2,1)` | `ProductCard.tsx`, `HomeCategoryStrip.tsx`, `HomeBrandRail.tsx`, `OfferBannersGrid.tsx`, `Button.tsx` | Desktop micro-interactions signal crafted product |
| Q2 | **3-tier radius** — kill 0/2/4px, normalize to 6px(cards) / 12px(hero) / 9999px(pills) | `ProductCard.tsx`, `HomeCategoryStrip.tsx`, `HomeBrandRail.tsx`, `OfferBannersGrid.tsx`, offer CTA, cart badge | Geometric consistency = "system" not "patches" |
| Q3 | **Product image `contain`→`cover`** + hover zoom scale(1.03) | `ProductCard.tsx` | Product photography is the hero of beauty commerce |

### What to Keep
The warm-tinted neutral system (`hsl(12 8% ...)` grays). Genuinely well-done — warm without being pink, beauty-appropriate, not an AI default.

---

## Color & Contrast Audit Findings

### WCAG Failures
| Pair | Ratio | Required | Fix |
|------|-------|----------|-----|
| Star `amberWarm` on white | **2.16:1** | 3:1 | C1: Darken to `hsl(35 85% 35%)` → 4.66:1 |
| [Plan] Eyebrow `coralPrimary` on `coralSubtle` | **2.87:1** | 4.5:1 | C2: Use `roseDeep` on `roseBlush` → 6.00:1 |
| Countdown coral on flash bg | **3.22:1** | 3:1 (borderline) | C3: Change to white → 10.17:1 |

### Accent Overuse
9 token aliases point to the same brand red `hsl(357 86% 44%)`. Brand identity, sale prices, urgency badges, and links all share one color — no semantic differentiation.

### Color Fixes (ranked by impact)
| # | Fix | File | Change |
|---|-----|------|--------|
| C4 | **Sale price: brandPrimary→commercePrimary** | `colors.ts` | `salePrice: hsl(350 75% 35%)` — separates brand from commerce |
| C1 | **Star rating: darken amber** | `colors.ts` | `amberWarm: hsl(35 85% 35%)` — WCAG fix |
| C2 | **Eyebrow pill: roseDeep on roseBlush** (corrects Phase 6 plan) | Phase 6 | `color: c.roseDeep, bg: c.roseBlush` |
| C3 | **Countdown digits: coral→white** | `CountdownTimer.tsx` | `color: colors.white` |
| C6 | **Flash sale bg: hardcoded→token** | `FlashSaleBand.tsx` | `backgroundColor: colors.roseDark` |
| C5 | **Card surface: pure white→warm white** | `colors.ts` | `surface: hsl(12 4% 99.5%)` |

---

## Typography Audit Findings

### Font Pairing
Playfair Display is used at 14px in section headers — far below its 22px+ design floor. At 14px, hairlines disappear and ball terminals blur. Meanwhile, hero overlays (where Playfair should shine) don't use it at all. Everything else is Manrope with weight 700 everywhere.

### Scale Collapse
Section header title resolves to **14px** (variant `h2` = `typography.subHeadlineTier` = `typography.bodyMd`). This is **smaller than card prices** (15px) and **equal to body text**. The structural labels that organize content are visually outranked by the content itself.

### Weight Monoculture
Weight 700 is used for 10+ roles: section titles, promo bar, card brands, card titles, card prices, offer CTAs, flash sale text. When everything is 700, nothing has contrast.

### Typography Fixes (ranked by impact)

| # | Fix | Files | Change |
|---|-----|-------|--------|
| T6 | **Weight redistribution** — brand 700→500, promo 700→500, section 700→800 | `ProductCard.tsx`, `TopPromoBar.tsx`, `MarketplaceSectionHeader.tsx` | Creates 3 visible hierarchy tiers (800/700/500) |
| T2 | **Section title scale** — 14px→18px, variant `h2`→`banner` | `MarketplaceSectionHeader.tsx` | `variant='banner'`, `weight='800'` |
| T1 | **Playfair minimum size** — remove serif from ≤18px, reserve for 22px+ display | `MarketplaceSectionHeader.tsx` | Remove `fontFamily: serif` from default `md` size; only use in `lg` size at 28px |
| T4 | **Caption line-height** — `relaxed`(1.55)→`normal`(1.35) for UI labels | `Text.tsx` | Caption 17px→15px, Label 19px→16px |
| T5 | **Section tracking** — remove -0.3px at 18px (only negative-track at 22px+) | `MarketplaceSectionHeader.tsx` | `letterSpacing: 0` for `md`, `-0.8` for `lg` |
| T3 | **Minimum brand font** — 9px→10px in minimal density | `components.ts` | `brandFontSize: 10, brandLineHeight: 13` |

---

## Phase 0: TopPromoBar Demotion (Audit Fix P1 — HIGHEST IMPACT)

**File:** `packages/ui/components/chrome/TopPromoBar.tsx`

**Current:** Full-width black background (`c.inkBlack`), white uppercase text (12px/700), brand-red dot indicator. This is the single highest-contrast element on the page — it dominates the hero below it.

**Target:** Warm, soft utility strip that provides context without stealing attention from the hero.

**Changes:**
- `backgroundColor`: `c.inkBlack` → `c.roseBlush` (hsl(357 60% 95%)) — warm blush tone
- Text `tone`: `'inverse'` → `'default'` (dark text on light bg)
- Text `fontWeight`: `700` → `500` (Typography Fix T6 — demote utility text from heading weight)
- Mobile dot indicator `backgroundColor`: `c.brandPrimary` → `c.roseMid` (softer rose)
- Desktop divider opacity: `0.5` → `0.3`
- Keep `textTransform: 'uppercase'` and `letterSpacing` — still reads as utility, just quieter

**Result:** Hero carousel becomes the undisputed first-look element. PromoBar becomes ambient context.

---

## Phase 1: Category Strip Redesign

**File:** `packages/ui/components/home/HomeCategoryStrip.tsx`

**Current:** Ghost buttons with text label + item count in a horizontal ScrollView.

**Target:** Circular icon containers with label below — similar to Instagram stories / Noon category bubbles. Dense horizontal strip with 8-10 visible on desktop.

**Changes:**
- Replace `ReusableButton` with `Pressable` + `Box` layout
- Each category item: circular container (56px diameter) with icon/emoji inside, label below (caption size, 1 line)
- Circular container: `backgroundColor: c.roseBlush` (hsl 357 60% 95%), `borderRadius: radius.full`
- On press: scale feedback via opacity
- Remove `MarketplaceSectionHeader` — this section doesn't need a header, it's self-explanatory navigation
- Scroll container: `gap: spacing['12']` between items, `paddingHorizontal: spacing.pageX`
- Add subtle `borderWidth: borderWidth.thin`, `borderColor: c.border` on circles for definition

**Icon approach:** Accept an optional `icon` field on `HomeCategoryItem`. Render as emoji text or a small Image if URL provided. Fallback: first letter of label in bold.

**Type change needed in:** `packages/ui/components/home/types.ts`
- Add `icon?: string` to `HomeCategoryItem` (emoji string or icon name)

---

## Phase 2: Flash Deals Section with Colored Band

**File:** `packages/ui/components/home-v2/FlashSaleBand.tsx` (already exists)
**File:** `packages/app/features/home/renderers/renderFlashSaleBlock.tsx`
**New File:** `packages/ui/components/home/HomeFlashDealsSection.tsx`

**Current:** `FlashSaleBand` exists with dark red background + countdown timer but it's a standalone banner, not a product rail.

**Target:** Full-width warm gradient band containing:
1. Section header row: "Flash Deals" title (Playfair Display serif) + countdown timer (right-aligned)
2. Product rail inside the band (compact cards on colored background)
3. Background: linear gradient from `colors.roseDark` to `colors.roseDeep` (warm, not cold)

**Changes:**
- Create `HomeFlashDealsSection` component that composes:
  - Outer `Box` with warm gradient background
  - Custom header row (not MarketplaceSectionHeader) with:
    - Left: "Flash Deals" in serif font (`fontFamilies.serif`), weight 700, `displayLg` size, inverse tone
    - Right: `CountdownTimer` component (already exists at `packages/ui/components/home-v2/CountdownTimer.tsx`)
  - Inner: `HorizontalRailState` with compact `ProductCard` items
  - Cards get `width: spacing['48'] * 3.5` (~168px) for denser display (currently `spacing.xxl * 5` = 240px)
  - Card background stays white/surface for contrast against colored band

- Update `renderFlashSaleBlock.tsx` to render `HomeFlashDealsSection` instead of `FlashSaleBand` when product items are available, falling back to `FlashSaleBand` for banner-only mode

**Existing components to reuse:**
- `CountdownTimer` from `packages/ui/components/home-v2/CountdownTimer.tsx`
- `HorizontalRailState` from `packages/ui/components/HorizontalRailState.tsx`
- `ProductCard` from `packages/ui/components/ProductCard.tsx` (variant `'compact'`)

---

## Phase 3: Product Rail Density

**File:** `packages/ui/components/home/HomeProductRail.tsx`

**Current:** Card width = `spacing.xxl * 5` (240px). Shows ~4-5 cards on desktop.

**Target:** Denser rail showing 5-6 cards on desktop. Card width ~180px.

**Changes:**
- Change `cardWidth` from `spacing.xxl * 5` to `spacing['48'] * 3.75` (~180px)
- Keep variant `'compact'` (uses `minimal` density tokens which already have tighter spacing)
- No changes to ProductCard itself — the density system already handles compact sizing

---

## Phase 4: Hero Carousel Polish

**File:** `packages/ui/components/HeroSlideCard.tsx`
**File:** `packages/ui/components/home/HomeHeroRail.tsx`

**Current:** 16:9 cards with 30% black gradient overlay, secondary CTA button at bottom, badge top-left.

**Target:** More dramatic hero with:
1. Stronger gradient overlay (40% opacity, taller — 70% height)
2. Headline text overlaid using Playfair Display serif
3. Subtitle text below headline (Manrope, lighter weight)
4. CTA button styled as `primaryCommerce` variant (burgundy) instead of secondary/surface

**Changes to HeroSlideCard.tsx:**
- Increase gradient opacity: `rgba(0, 0, 0, 0.30)` → `rgba(0, 0, 0, 0.40)`
- Increase gradient height: `'60%'` → `'70%'`
- Add title text overlay (position absolute, above CTA):
  - `fontFamily: fontFamilies.serif`
  - `fontSize: typography.displayLg` (28px)
  - `weight: '700'`
  - `tone: 'inverse'` (white)
  - `letterSpacing: typography.letterSpacing.displayLg` (-0.8px)
- Add subtitle text (below title, above CTA):
  - `fontFamily: fontFamilies.sans`
  - `fontSize: typography.bodyMd` (14px)
  - `weight: '500'`
  - `tone: 'inverse'`
  - `opacity: 0.85`
- CTA button: change `variant='secondary'` to `variant='primaryCommerce'`
- CTA text: keep uppercase, adjust `tone='inverse'`

**Changes to HomeHeroRail.tsx:**
- Adjust `cardsInViewport` on desktop from `2.8` to `2.2` — slightly larger cards for more impact
- This makes each hero card bigger, more dramatic

**Props change for HeroSlideCard:**
- The `HomeHeroItem` type already has `title`, `subtitle`, `ctaLabel` — they're just not being rendered as text overlays yet. Wire them in.

---

## Phase 5: Section Spacing Rhythm

**File:** `packages/app/features/home/HomeBlocksRenderer.tsx`

**Current:** Uniform `layoutTokens.rootGap` between all sections.

**Target:** Varied spacing to create visual rhythm:
- After hero: tighter gap (category strip feels connected)
- Before/after flash deals: generous gap (the colored band creates its own separation)
- Between product rails: standard gap
- Before editorial/newsletter: extra generous (breathing room before CTA)

**Changes:**
- Create a `sectionGap(blockType, nextBlockType)` helper function that returns spacing based on block type pairs
- Map specific transitions:
  - `hero_carousel → category_shortcuts`: `spacing.space4` (16px) — tight connection
  - `category_shortcuts → *`: `spacing.space8` (32px)
  - `* → flash_sale`: `spacing.space10` (40px)
  - `flash_sale → *`: `spacing.space10` (40px)
  - `* → newsletter_cta`: `spacing.space16` (64px)
  - `* → editorial_hotspot`: `spacing.space12` (48px)
  - Default: `spacing.space8` (32px)

---

## Phase 6: Section Headers Enhancement (Audit Fix P2 + P8 + Typography T1/T2/T5/T6)

**File:** `packages/ui/components/MarketplaceSectionHeader.tsx`

**Current:** All section headers render identically — variant `h2` which resolves to **14px/600** (not 18px as it appears). Playfair Display serif at 14px is below its design floor. Weight 700 override matches card text, destroying hierarchy. Tracking -0.3px at 14px hurts readability.

**Target:** Tiered header system with 3 visual weights. Correct font pairing. Warm eyebrow colors.

**Changes:**
- **Fix the base title** (Typography T2): Change `variant='h2'` to `variant='banner'` which resolves to 18px/700. Then override `weight='800'` for structural prominence.
- **Remove Playfair from default size** (Typography T1): Remove `fontFamily: fontFamilies.serif` from the default (md) size. At 18px Playfair still struggles. Use Manrope 800 instead — it has enough personality at this size.
- **Fix tracking** (Typography T5): Remove `letterSpacing: -0.3`. At 18px, use `letterSpacing: 0`. Negative tracking only helps at 22px+.
- Add `size?: 'lg' | 'md' | 'sm'` prop (default `'md'`):
  - `'lg'`: fontSize `typography.displayLg` (28px), weight `'800'`, `fontFamily: fontFamilies.serif`, `letterSpacing: -0.8` — Playfair's comfort zone. For Flash Deals, primary conversion sections.
  - `'md'`: variant `'banner'` (18px), weight `'800'`, Manrope (default), `letterSpacing: 0` — for product rails
  - `'sm'`: fontSize `typography.headingSm` (16px), weight `'600'`, Manrope — for utility sections (brands, categories)
- **Demote meta weight** (Typography T6): `weight='600'` → `weight='500'` on meta text
- Eyebrow pill (Color Fix C2 — corrected from original plan): change `backgroundColor` from `c.surfaceMuted` to `c.roseBlush` (`hsl(357 60% 95%)`)
- Eyebrow text: change tone from `'danger'` to `'default'` with explicit `color: c.roseDeep` (`hsl(357 86% 38%)`) — gives 6.00:1 contrast ratio (the originally proposed coralPrimary on coralSubtle was only 2.87:1, WCAG FAIL)
- "View all" button: append " →" to `actionLabel` text for directional cue
- Add optional `accentColor` prop for sections that want custom eyebrow colors

---

## Phase 7: Brand Rail Enhancement

**File:** `packages/ui/components/home/HomeBrandRail.tsx`

**Current:** Fixed-width cards (spacing.xxl * 3 = 144px) with circular logo + caption.

**Target:** Slightly larger logos, subtle hover elevation, branded section header.

**Changes:**
- Replace plain `Text` title with `MarketplaceSectionHeader` for consistency (title: "Top Brands", actionLabel: "View all")
- Increase logo size: `spacing.xxl + spacing.sm` → `spacing.xxl + spacing.md` (~64px → ~72px)
- Card width: `spacing.xxl * 3` → `spacing.xxl * 2.5` (~120px) — narrower cards, more brands visible
- Add subtle shadow on hover (web only, via `onPointerEnter`/`onPointerLeave` state)
- Background: keep `c.surface` but add `borderColor: c.roseBlush` on hover for warmth

---

## Phase 9: Token Foundation Fixes (Typography T3/T4/T6 + Color C1/C4/C5/C6)

### Typography fixes:

**File:** `packages/tokens/components.ts` (T3)
**File:** `packages/ui/primitives/Text.tsx` (T4)
**File:** `packages/ui/components/ProductCard.tsx` (T6-card)

**T3 — Minimum brand font in minimal density:**
In `components.ts`, `productCardDensity.minimal`:
- `brandFontSize: 9` → `10`
- `brandLineHeight: 11` → `13`

**T4 — Caption/label line-height for UI elements:**
In `Text.tsx`, change the `caption`, `label`, and `nav` variant lineHeight calculations from `lineHeights.relaxed` (1.55) to `lineHeights.normal` (1.35):
- Caption: `round(11 * 1.55) = 17px` → `round(11 * 1.35) = 15px`
- Label: `round(12 * 1.55) = 19px` → `round(12 * 1.35) = 16px`
- Nav: `round(12 * 1.35) = 16px` (already uses `normal`, verify)

**T6-card — Demote card brand weight:**
In `ProductCard.tsx`, the brand name `Text`:
- `weight='700'` → `weight='500'`
- This separates brand (supporting context) from title (primary content) in weight hierarchy

### Color fixes:

**File:** `packages/tokens/colors.ts` (C1, C4, C5)
**File:** `packages/ui/components/home-v2/FlashSaleBand.tsx` (C6)
**File:** `packages/ui/components/home-v2/CountdownTimer.tsx` (C3)

**C1 — Star rating WCAG failure (2.16:1 → 4.66:1):**
In `colors.ts`:
- `amberWarm: 'hsl(35 90% 55%)'` → `amberWarm: 'hsl(35 85% 35%)'`
- Also update dark mode: `amberWarm: 'hsl(35 80% 55%)'` → `amberWarm: 'hsl(35 80% 55%)'` (dark mode already passes, keep)

**C4 — Separate sale price from brand red (accent overuse fix):**
In `colors.ts`:
- `salePrice: 'hsl(357 86% 44%)'` → `salePrice: 'hsl(350 75% 35%)'` (use commerce burgundy — darker, 8.17:1 on white)

**C5 — Card surface warm alignment:**
In `colors.ts`:
- `surface: 'hsl(0 0% 100%)'` → `surface: 'hsl(12 4% 99.5%)'` (barely perceptible shift, removes cold/warm clash)

**C6 — Flash sale bg: hardcoded → token:**
In `FlashSaleBand.tsx`:
- `backgroundColor: 'hsl(350 60% 30%)'` → `backgroundColor: colors.roseDark`
- `roseDark` = `hsl(357 86% 30%)` — more saturated, hue-aligned, dark-mode-aware

**C3 — Countdown digits borderline contrast:**
In `CountdownTimer.tsx`:
- `color: colors.coralPrimary` → `color: colors.white` (3.22:1 → 10.17:1 on flash bg)

---

## Phase 10: Quality Polish — Hover System + Radius + Image (Diagnosis Q1/Q2/Q3)

### Q1 — Unified hover system

**Add easing to motion tokens:**
**File:** `packages/tokens/motion.ts`
- Add `easeOutQuart: 'cubic-bezier(0, 0, 0.2, 1)'` to easing tokens (the existing `easeOut` is this value — verify and use it)

**ProductCard hover (web only):**
**File:** `packages/ui/components/ProductCard.tsx`
- Wrap card in state-tracked hover (`onPointerEnter`/`onPointerLeave` on web, no-op on native)
- On hover: `transform: [{ translateY: -2 }]`, add `boxShadow: boxShadowStrings.sm`
- Image on hover: `transform: [{ scale: 1.03 }]`
- Image wrapper: ensure `overflow: 'hidden'` (already set on card)
- Transitions: `transition: 'transform 200ms cubic-bezier(0, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0, 0, 0.2, 1)'`

**HomeCategoryStrip hover:**
**File:** `packages/ui/components/home/HomeCategoryStrip.tsx`
- On hover: `borderColor: c.roseMid`, `backgroundColor: c.roseBlush`

**HomeBrandRail hover:**
**File:** `packages/ui/components/home/HomeBrandRail.tsx`
- On hover: lift 2px, `borderColor: c.roseBlush`, `boxShadow: boxShadowStrings.xs`

**OfferBannersGrid hover:**
**File:** `packages/ui/components/home-v2/OfferBannersGrid.tsx`
- Change lift from -1px → -3px, add `boxShadow: boxShadowStrings.md`

**Button scale:**
**File:** `packages/ui/components/Button.tsx`
- Change `scale: 1.005` → `scale: 1.02` on hover
- Add `transition-timing-function: cubic-bezier(0, 0, 0.2, 1)` (replace linear default)

### Q2 — 3-tier radius normalization

| Component | File | Current | Target |
|-----------|------|---------|--------|
| ProductCard | `ProductCard.tsx` | `radiusKey='xs'` (2px) | `radiusKey='md'` (6px) |
| Category buttons | `HomeCategoryStrip.tsx` | `radius.sm` (2px) | `radius.md` (6px) |
| Brand cards | `HomeBrandRail.tsx` | `radius.xs` (2px) | `radius.md` (6px) |
| Offer banner card | `OfferBannersGrid.tsx` | 4px promo token | `radius.md` (6px) |
| Offer banner CTA | `OfferBannersGrid.tsx` | 0px (`secondaryRadius`) | `radius.md` (6px) — update `storefrontHomeTokens.cta.secondaryRadius: 0` → `6` in `components.ts` |
| Hero card | `HeroSlideCard.tsx` | `radius['2xl']` (16px) | `radius.xl` (12px) |

### Q3 — Product image treatment

**File:** `packages/ui/components/ProductCard.tsx`
- Change `resizeMode='contain'` → `resizeMode='cover'` on product image
- Image hover zoom is handled by Q1 hover system above

---

## Phase 8: Scroll Reveal Animations

**File:** `packages/app/features/home/HomeBlocksRenderer.tsx`

**Current:** No scroll animations — all sections render statically.

**Target:** Each section fades up on scroll entry with staggered timing.

**Changes:**
- Wrap each rendered block in `RevealOnScroll` (already exists at `packages/ui/components/RevealOnScroll.tsx`)
- Hero section: no reveal (always visible, first paint)
- Promo ticker: no reveal
- All other sections: `RevealOnScroll` with `delayMs={index * 40}`, `liftY={12}`
- This uses Intersection Observer (threshold 0.12) — already implemented, just needs wrapping

---

## Implementation Order (for executing agent)

Each phase is independent and can be done in sequence. Run `yarn guard:checks` + `yarn tsc -p apps/next/tsconfig.json --noEmit` after each phase.

1. **Phase 9** — Token foundations: typography + color fixes (6 files) — **fix the primitives first**
2. **Phase 10** — Quality polish: hover system + radius normalization + image cover (8 files) — **biggest perceived-quality jump**
3. **Phase 0** — TopPromoBar demotion (1 file)
4. **Phase 6** — Section Headers tiered system (1 file) — needed before other phases use size prop
5. **Phase 1** — Category Strip circles (1 file + 1 type)
6. **Phase 3** — Product Rail Density (1 line change)
7. **Phase 7** — Brand Rail (1 file)
8. **Phase 4** — Hero Carousel (2 files)
9. **Phase 5** — Section Spacing (1 file)
10. **Phase 8** — Scroll Reveals (1 file)
11. **Phase 2** — Flash Deals Section (1 new file + 1 renderer) — last, most complex

## Critical Files

| File | Action |
|------|--------|
| `packages/tokens/colors.ts` | amberWarm darken (C1), salePrice→burgundy (C4), surface warm (C5) |
| `packages/tokens/components.ts` | Min brand font 9→10px (T3) |
| `packages/ui/primitives/Text.tsx` | Caption/label lineHeight relaxed→normal (T4) |
| `packages/ui/components/ProductCard.tsx` | Brand weight 700→500 (T6) |
| `packages/ui/components/home-v2/FlashSaleBand.tsx` | Hardcoded bg→token (C6) |
| `packages/ui/components/home-v2/CountdownTimer.tsx` | Digits coral→white (C3) |
| `packages/ui/components/Button.tsx` | Scale 1.005→1.02, add easing (Q1) |
| `packages/ui/components/home-v2/OfferBannersGrid.tsx` | Lift 3px+shadow, radius 4→6px, CTA radius 0→6px (Q1/Q2) |
| `packages/ui/components/chrome/TopPromoBar.tsx` | Demote visual weight (bg, text weight 700→500) |
| `packages/ui/components/home/HomeCategoryStrip.tsx` | Major rewrite |
| `packages/ui/components/home/types.ts` | Add `icon` to `HomeCategoryItem` |
| `packages/ui/components/home/HomeProductRail.tsx` | Card width change |
| `packages/ui/components/MarketplaceSectionHeader.tsx` | Style enhancements |
| `packages/ui/components/home/HomeBrandRail.tsx` | Layout + header changes |
| `packages/ui/components/HeroSlideCard.tsx` | Gradient + text overlay + CTA |
| `packages/ui/components/home/HomeHeroRail.tsx` | Cards-in-viewport adjustment |
| `packages/app/features/home/HomeBlocksRenderer.tsx` | Spacing rhythm + scroll reveals |
| `packages/ui/components/home/HomeFlashDealsSection.tsx` | **New file** |
| `packages/app/features/home/renderers/renderFlashSaleBlock.tsx` | Wire new component |

## Verification

After all phases:
1. `yarn guard:checks` — token/className/hex/env guards
2. `yarn tsc -p apps/next/tsconfig.json --noEmit` — type check
3. `yarn web` — start dev server, visually verify homepage in browser
4. Check RTL by switching locale to Arabic
5. Check mobile responsive by resizing browser to 375px width
6. Verify scroll reveals fire on scroll (not all at once)
7. Verify hero carousel autoplay still works
8. Verify product rail horizontal scroll + snap behavior
