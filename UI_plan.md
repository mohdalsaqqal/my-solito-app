# UI Plan — Technical Quality Remediation

**Source:** `/audit` report (5 dimensions: Accessibility, Performance, Responsive, Theming, Anti-Patterns)  
**Baseline Score:** 11/20 (Acceptable)  
**Target Score:** 17/20+ (Good → Excellent)  
**Date:** 2026-04-03

---

## Executive Summary

A systematic technical quality audit across 5 dimensions revealed **51 issues** (8 P0, 18 P1, 20 P2, 5 P3) in the shared UI layer. The codebase has a solid architectural foundation — server-first data flow, homepage layout engine, guard system, and i18n pipeline — but suffers from concentrated gaps in dark mode support, responsive consistency, accessibility, and component memoization.

### Score Breakdown

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Accessibility | 2/4 | 4/4 | +2 |
| Performance | 2/4 | 3/4 | +1 |
| Responsive Design | 2/4 | 4/4 | +2 |
| Theming | 2/4 | 4/4 | +2 |
| Anti-Patterns | 3/4 | 4/4 | +1 |
| **Total** | **11/20** | **19/20** | **+8** |

### Top 5 Systemic Issues

| # | Issue | Scope | Impact |
|---|-------|-------|--------|
| 1 | **Dark mode broken for inline styles** — every `style={{ color: colors.xxx }}` renders light-only hex values | 12+ components in `packages/ui/components/` | Dark mode users see poor contrast, broken visual hierarchy |
| 2 | **`useBreakpoint()` hook unused** — 4 components duplicate its logic with conflicting thresholds (768px, 760px, none) | HeroTileRail, ProductRail, CategoryRail, OfferBannersGrid, BrandSpotlightPanel | Inconsistent responsive behavior, maintenance burden |
| 3 | **Zero `React.memo` on large components** — HeroTileCard (200+ lines), QuickViewModal (350+), CartDrawer (350+) re-render on every parent update | 6+ large components | Unnecessary re-renders on cart updates, locale changes, any parent state change |
| 4 | **Touch targets below 44px minimum** — CartDrawer delete (24px), quantity pills (28×32px), admin buttons (32px), search close (40px) | CartDrawer, SearchOverlay, AdminShell, HeroTileRail nav | WCAG 2.5.5 violation, difficult to tap on mobile |
| 5 | **3 AI slop tells** — glassmorphism blur, luxury-editorial copy, radial glow overlay | HeroSlideCard, BrandSpotlightPanel | Conflicts with stated mass-market commercial direction |

### Execution Strategy

**5 phases**, ordered by leverage and dependency:

1. **Phase 1 — Foundation** (P0 systemic fixes): break/useBreakpoint consolidation, token format unification, dark mode bridge
2. **Phase 2 — Accessibility Blockers** (P0 a11y): form labels, keyboard navigation, focus styles, semantic HTML
3. **Phase 3 — Performance** (P1 perf): React.memo, interval fixes, memoized formatters, debounce window dimensions
4. **Phase 4 — Responsive & Touch** (P1 responsive): 44px touch targets, fluid layouts, breakpoint alignment
5. **Phase 5 — Visual Polish** (P1-P3 anti-patterns + polish): remove AI tells, tokenize magic numbers, final pass

**Rule:** Each phase must pass `yarn guard:checks` + `yarn tsc` before proceeding.

---

## Phase 1 — Foundation (Systemic P0)

**Goal:** Fix the 3 systemic issues that every other phase depends on.  
**Estimated files:** 8-10  
**Verification:** `yarn guard:checks` + `yarn tsc` + manual dark mode test

### 1.1 — Consolidate Breakpoint Usage

**Problem:** `useBreakpoint()` exists but 4 components duplicate its logic with inconsistent thresholds.

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Wire HeroTileRail to `useBreakpoint()` | `packages/ui/components/home-v2/HeroTileRail.tsx` | Remove manual `useWindowDimensions`, `Platform.OS`, `hasHydrated`, `effectiveWidth`, `isDesktop`. Replace with `const profile = useBreakpoint()` |
| 2 | Wire ProductRail to `useBreakpoint()` | `packages/ui/components/home-v2/ProductRail.tsx` | Same pattern as above |
| 3 | Wire CategoryRail to `useBreakpoint()` | `packages/ui/components/home-v2/CategoryRail.tsx` | Same pattern as above |
| 4 | Wire TopBrandsGrid to `useBreakpoint()` | `packages/ui/components/home-v2/TopBrandsGrid.tsx` | Replace `isHydrated` pattern |
| 5 | Update OfferBannersGrid to accept breakpoint | `packages/ui/components/home-v2/OfferBannersGrid.tsx` | Derive `isDesktop` from breakpoint prop or `useBreakpoint()` internally |
| 6 | Update BrandSpotlightPanel to accept breakpoint | `packages/ui/components/home-v2/BrandSpotlightPanel.tsx` | Same as above |
| 7 | Fix conflicting tablet thresholds | `profiles.ts` | Unify to `breakpoints.tabletMin` (641px), remove hardcoded `768` and `760` checks |

### 1.2 — Unify Color Token Format

**Problem:** `colors.ts` mixes hex and HSL formats, causing silent drift between JS and CSS layers.

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Convert surface hex to HSL | `packages/tokens/colors.ts` | `#f9f9f9` → `hsl(0 0% 97.6%)`, `#f3f3f3` → `hsl(0 0% 95.3%)`, `#eeeeee` → `hsl(0 0% 93.3%)`, `#e5e5e5` → `hsl(0 0% 89.8%)`, `#ffffff` → `hsl(0 0% 100%)` |
| 2 | Convert text hex to HSL | `packages/tokens/colors.ts` | `#1a1a1a` → `hsl(0 0% 10.2%)`, `#5e5e5e` → `hsl(0 0% 36.9%)`, `#9e9e9e` → `hsl(0 0% 62%)` |
| 3 | Convert brand hex to HSL | `packages/tokens/colors.ts` | `#222222` → `hsl(0 0% 13.3%)`, `#a8000d` → `hsl(356 100% 33%)`, `#d31018` → `hsl(357 86% 44%)`, `#8a000b` → `hsl(355 100% 27%)`, `#fff5f5` → `hsl(0 100% 98%)` |
| 4 | Remove duplicate tokens | `packages/tokens/colors.ts` | Delete `mutedText` (keep `textMuted`), delete `mint` (keep `premiumBlue`), rename or document `brandTeal` (misleading name for red value), clarify `sun` intent |
| 5 | Sync CSS token bridge | `packages/ui/global.css` | Verify all `--color-*` values match updated HSL tokens |

### 1.3 — Dark Mode Bridge for Inline Styles

**Problem:** Every component using `style={{ backgroundColor: colors.xxx }}` renders light-theme-only values that never change in dark mode.

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Create `useThemeColors()` hook | `packages/ui/responsive/useThemeColors.ts` (new) | Returns `colors` or `colorsDark` map based on theme context. Falls back to `colors` if no theme provider |
| 2 | Create `colorsDark` token map | `packages/tokens/colors.ts` (add export) | Dark-mode equivalents for all surface, text, and brand tokens. E.g., surface: `hsl(0 0% 9%)`, text: `hsl(0 0% 95%)` |
| 3 | Update shared Button | `packages/ui/components/Button.tsx` | Replace `colors.ctaBackground` → `theme.ctaBackground`, `colors.brandPrimary` → `theme.brandPrimary`, etc. |
| 4 | Update HeroSlideCard | `packages/ui/components/HeroSlideCard.tsx` | Replace inline hex colors with theme-aware references |
| 5 | Update CampaignHeroBlock | `packages/ui/components/home-v2/CampaignHeroBlock.tsx` | Replace inline hex with theme references |
| 6 | Update TestimonialsBlock | `packages/ui/components/home-v2/TestimonialsBlock.tsx` | Replace inline hex with theme references |
| 7 | Update CategoryRail | `packages/ui/components/home-v2/CategoryRail.tsx` | Replace inline hex with theme references |
| 8 | Update NewsletterLoyaltyCta | `packages/ui/components/home-v2/NewsletterLoyaltyCta.tsx` | Replace inline hex with theme references |
| 9 | Update UgcGallery | `packages/ui/components/home-v2/UgcGallery.tsx` | Replace inline hex with theme references |
| 10 | Fix dark theme `--primary` contrast | `packages/ui/global.css` | Light: `hsl(0 0% 13%)`, Dark: should be lighter for contrast against `--background: hsl(0 0% 9%)` |

---

## Phase 2 — Accessibility Blockers (P0 A11y)

**Goal:** Resolve all P0 accessibility issues that prevent task completion or violate WCAG A/AA.  
**Estimated files:** 10-12  
**Verification:** `yarn guard:checks` + screen reader testing (NVDA/VoiceOver) + keyboard-only navigation test

### 2.1 — Form Label Association

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Add `id` + `label` props to Input | `packages/ui/reusables/input.tsx` | Render `<label htmlFor={id}>` on web, `accessibilityLabel` on native. Reject rendering if neither label nor `aria-label` is provided |
| 2 | Update all Input consumers | Search across `apps/next/app/`, `packages/ui/components/` | Pass `id` + `label` to all Input usages. Update admin forms, auth forms, checkout forms |
| 3 | Fix admin search input | `apps/next/app/admin/_components/AdminShell.tsx` | Add visually hidden `<label>` element alongside `aria-label` |

### 2.2 — Keyboard Navigation & Focus

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Add keyboard pause to AnnouncementTicker | `packages/ui/components/home-v2/AnnouncementTicker.tsx` | Add `onFocus`/`onBlur` handlers to pause animation. Add visible pause button with `aria-pressed` state |
| 2 | Add focus styles to admin shell buttons | `apps/next/app/admin/_components/AdminShell.tsx` | Add `:focus-visible: outline: 2px solid var(--color-primary)` to all inline button styles including `iconButtonStyle`, dropdown menu items, sidebar items |
| 3 | Fix admin drawer backdrop semantics | `apps/next/app/admin/_components/AdminShell.tsx` | Change backdrop `<button>` to `<div onClick>`. Keep close button on drawer panel |
| 4 | Add `aria-controls` to admin menus | `apps/next/app/admin/_components/AdminShell.tsx` | Add `id` to menu containers, `aria-controls={menuId}` to team selector and user menu buttons |
| 5 | Add keyboard nav to ProductRail ScrollView | `packages/ui/components/home-v2/ProductRail.tsx` | Implement roving tabindex or arrow-key handling for horizontal scroll container. Ensure prev/next buttons have clear labels |
| 6 | Add keyboard nav to HeroTileRail ScrollView | `packages/ui/components/home-v2/HeroTileRail.tsx` | Same as ProductRail above |

### 2.3 — Semantic HTML & ARIA

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Fix ProductCard semantic structure | `packages/ui/components/ProductCard.tsx` | Wrap card in `<article>`, render title as semantic heading (`<h3>`), use single actionable link for card navigation. Add quick-add as secondary action within article |
| 2 | Add `aria-current` to carousel dots | `packages/ui/components/HeroCarouselControls.tsx` | Add `aria-current={selected ? 'true' : undefined}` to active dot button |
| 3 | Add heading to HeroTileRail | `packages/ui/components/home-v2/HeroTileRail.tsx` | Add visible section heading (e.g., "Featured Collections") rendered as semantic `<h2>` |
| 4 | Add heading to ProductRail title | `packages/ui/components/home-v2/ProductRail.tsx` | Render rail title as semantic `<h2>` instead of styled `<Text>` span |
| 5 | Add `alt` text to BrandSpotlight images | `packages/ui/components/home-v2/BrandSpotlightPanel.tsx` | Logo images: `accessibilityLabel=''` (decorative, text provides same info). Showcase image: accept and pass `imageAlt` prop |
| 6 | Add `alt` text to HeroTileCard images | `packages/ui/components/home-v2/HeroTileRail.tsx` | Add `accessibilityLabel={item.imageAlt || item.title}` to Image elements |
| 7 | Add `role='marquee'` to AnnouncementTicker | `packages/ui/components/home-v2/AnnouncementTicker.tsx` | Add `aria-label="Announcements"` on container for screen reader context |
| 8 | Add `aria-pressed` to filter chips | `packages/ui/components/home-v2/ProductRail.tsx` | Add `aria-pressed={isActive}` to active filter buttons |
| 9 | Add `aria-busy` to ProductCard skeleton | `packages/ui/components/ProductCard.tsx` | Add `aria-busy='true'` on container, `aria-hidden='true'` on skeleton placeholder elements |
| 10 | Fix OfferBanners action button | `packages/ui/components/home-v2/OfferBannersGrid.tsx` | Add `accessibilityRole='button'` and `accessibilityLabel={actionLabel}` to section header action |

---

## Phase 3 — Performance (P1)

**Goal:** Eliminate unnecessary re-renders and expensive computations.  
**Estimated files:** 8-10  
**Verification:** React DevTools Profiler before/after comparison, Lighthouse performance score

### 3.1 — Component Memoization

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Memoize HeroTileCard | `packages/ui/components/home-v2/HeroTileRail.tsx` | Wrap with `React.memo`. Extract render-prop style function into stable reference or use CSS hover |
| 2 | Memoize QuickViewModal | `packages/ui/components/QuickViewModal.tsx` | Wrap with `React.memo`. Early return for `!open` already exists but memoization prevents function execution |
| 3 | Memoize CartDrawer | `packages/ui/components/chrome/CartDrawer.tsx` | Wrap with `React.memo` |
| 4 | Memoize TickerSequence | `packages/ui/components/home-v2/AnnouncementTicker.tsx` | Wrap with `React.memo` |
| 5 | Memoize DigitPair + Separator | `packages/ui/components/home-v2/CountdownTimer.tsx` | Wrap `DigitPair` with `React.memo`. Extract `Separator` outside component (static) |
| 6 | Memoize SearchOverlay content | `packages/ui/components/chrome/SearchOverlay.tsx` | Wrap `OverlayContent` with `React.memo`. Consider debouncing `onQueryChange` |
| 7 | Memoize IconCircleButton | `packages/ui/components/QuickViewModal.tsx` | Wrap inner `IconCircleButton` component with `React.memo` |
| 8 | Memoize renderer components | `packages/app/features/home/renderers/*.tsx` | Wrap renderers (`renderHeroBlock`, `renderProductRailBlock`, etc.) with `React.memo` to prevent re-renders from `HomeBlocksRenderer` |

### 3.2 — Expensive Computations

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Memoize `Intl.NumberFormat` in CartDrawer | `packages/ui/components/chrome/CartDrawer.tsx` | `const formatCurrency = useMemo(() => { const fmt = new Intl.NumberFormat(...); return (v) => fmt.format(v); }, [])` |
| 2 | Fix CountdownTimer interval re-creation | `packages/ui/components/home-v2/CountdownTimer.tsx` | Remove `time` from `useEffect` dependency array. Use ref for `targetMs`, check `time.expired` inside interval callback only |
| 3 | Debounce `useWindowDimensions()` in ProductRail | `packages/ui/components/home-v2/ProductRail.tsx` | Replace with `useBreakpoint()` (done in Phase 1.1). If raw dimensions still needed, add debounce/throttle |
| 4 | Debounce `useWindowDimensions()` in HeroTileRail | `packages/ui/components/home-v2/HeroTileRail.tsx` | Same as above |
| 5 | Cache CartDrawer focus trap query | `packages/ui/components/chrome/CartDrawer.tsx` | Cache `panel.querySelectorAll(...)` in a ref, only re-query when cart items change |
| 6 | Stabilize callback references | `packages/app/features/home/HomeBlocksRenderer.tsx` | Wrap `onNavigate`, `onSelectProduct`, `onAddToCart`, `onAddAllToCart` with `useCallback` at parent level |

### 3.3 — Animation & Style Optimization

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Move ticker keyframes to global CSS | `packages/ui/global.css` | Remove imperative `ensureWebTickerKeyframes()` DOM injection. Define `@keyframes ticker-scroll` in global.css |
| 2 | Memoize derived style values in HeroTileCard | `packages/ui/components/home-v2/HeroTileRail.tsx` | Wrap `Math.round()`, `Math.max()` title size calculations with `useMemo` |

---

## Phase 4 — Responsive & Touch (P1)

**Goal:** Ensure all interactive elements meet 44px minimum and layouts adapt fluidly across viewports.  
**Estimated files:** 5-7  
**Verification:** Chrome DevTools device emulation (320px–1440px), physical device testing on iOS/Android

### 4.1 — Touch Target Compliance

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Fix CartDrawer delete button (24px → 44px) | `packages/ui/components/chrome/CartDrawer.tsx` | Increase wrapper to `minWidth: 44, minHeight: 44`. Keep icon at 24px but add padding around it |
| 2 | Fix CartDrawer quantity buttons (28×32px → 44px) | `packages/ui/components/chrome/CartDrawer.tsx` | Increase to `minWidth: 44, minHeight: 44` |
| 3 | Fix CartDrawer close button (32px → 44px) | `packages/ui/components/chrome/CartDrawer.tsx` | Increase wrapper to 44px minimum |
| 4 | Fix SearchOverlay close button (40px → 44px) | `packages/ui/components/chrome/SearchOverlay.tsx` | Increase from `spacing['40']` to at least `spacing['44']` or 44px |
| 5 | Fix HeroTileRail nav button touch target | `packages/ui/components/home-v2/HeroTileRail.tsx` | Ensure `IconButton size='lg'` wrapper is at least 44px (currently resolves to 36px) |
| 6 | Audit all IconButton sizes | `packages/ui/components/IconButton.tsx` | Add minimum 44px wrapper for all icon button variants. Document exceptions for dense desktop-only surfaces |

### 4.2 — Fluid Layouts & Breakpoint Alignment

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Replace hardcoded maxWidth with fluid values | `packages/ui/components/home-v2/BrandSpotlightPanel.tsx` | `maxWidth: 320` → derive from container width. Use `maxWidth: 'clamp(240px, 30vw, 400px)'` or token-based |
| 2 | Replace hardcoded maxWidth in CategoryRail | `packages/ui/components/home-v2/CategoryRail.tsx` | `maxWidth: isDesktop ? 420 : 280` → derive from container width minus padding |
| 3 | Fix HeroTileRail card width on 320px viewports | `packages/ui/components/home-v2/HeroTileRail.tsx` | `cardWidth` calculation produces 292px minimum + 24px padding × 2 = 340px, overflows 320px. Reduce minimum or add viewport-aware padding |
| 4 | Replace magic-number positioning | `packages/ui/components/home-v2/HeroTileRail.tsx` | `translateY: -22` → derive from button size: `-(iconButtonTokens.size.lg / 2)` |
| 5 | Tokenize CartDrawer width | `packages/ui/components/chrome/CartDrawer.tsx` | `spacing.xxl * 9.6` (460.8px) → add `layout.cartDrawerWidth` token |
| 6 | Tighten TopBrandsGrid mobile padding | `packages/ui/components/home-v2/TopBrandsGrid.tsx` | `paddingHorizontal: spacing['2']` (8px) → `spacing['4']` (16px) minimum |
| 7 | Add mobile carousel fallback for OfferBanners | `packages/ui/components/home-v2/OfferBannersGrid.tsx` | Single-column mobile layout with 4 banners = 1000px+ vertical scroll. Add horizontal scroll or carousel on mobile |

---

## Phase 5 — Visual Polish (Anti-Patterns + P2/P3)

**Goal:** Remove AI tells, tokenize remaining magic numbers, and polish edge cases.  
**Estimated files:** 8-10  
**Verification:** Visual review against `.impeccable.md` design direction, re-run `/audit`

### 5.1 — Remove AI Tells

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Remove glassmorphism blur from badge | `packages/ui/components/HeroSlideCard.tsx` | Remove `backdropFilter: 'blur(6px)'`. The `glass.badgeWhite` (`rgba(255,255,255,0.94)`) background is sufficient without blur |
| 2 | Remove luxury-editorial copy | `packages/ui/components/HeroSlideCard.tsx` | Replace hardcoded "curated beauty edit" with CMS-driven content or remove entirely |
| 3 | Remove radial glow overlay | `packages/ui/components/home-v2/BrandSpotlightPanel.tsx` | Remove `scrim.brandSpotlightHighlight` radial gradient from showcase panel. Let the image speak for itself |
| 4 | Collapse triple overlay stacking | `packages/ui/components/home-v2/OfferBannersGrid.tsx` | Remove `glossOverlay` (0.02 opacity is imperceptible). Collapse to single overlay layer |
| 5 | Remove decorative accent bar | `packages/ui/components/HeroSlideCard.tsx` | 1px red bar above title — evaluate if it adds real hierarchy value or is decorative chrome |
| 6 | Vary testimonial card sizes | `packages/ui/components/home-v2/TestimonialsBlock.tsx` | Make first card larger (featured), stagger the rest. Break the monotonous identical grid |

### 5.2 — Tokenize Magic Numbers

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Add opacity tokens for common values | `packages/tokens/opacity.ts` | Add `loading: 0.45`, `disabledAlt: 0.65`, `subtle: 0.66`, `medium: 0.72`, `high: 0.84`, `nearSolid: 0.92` |
| 2 | Add letterSpacing tokens for common values | `packages/tokens/typography.ts` | Map `0.2`, `0.3`, `0.4`, `0.6`, `0.8`, `1.05`, `1.1`, `1.4`, `1.8`, `1.98` to named tokens |
| 3 | Replace hardcoded opacity in HeroSlideCard | `packages/ui/components/HeroSlideCard.tsx` | `opacity: 0.78` → `opacity.overlayDark`, `opacity: 0.66` → new `opacity.subtle` token |
| 4 | Replace hardcoded opacity in CategoryRail | `packages/ui/components/home-v2/CategoryRail.tsx` | `opacity: 0.78` → `opacity.overlayDark` |
| 5 | Replace hardcoded letterSpacing in TestimonialsBlock | `packages/ui/components/home-v2/TestimonialsBlock.tsx` | `letterSpacing: 1.4` → `typography.letterSpacing.labelPill` |
| 6 | Replace hardcoded shadow strings | `packages/tokens/components.ts` | ProductCard shell shadows → reference `elevation` and `shadows` tokens |
| 7 | Fix `skip-link` hardcoded values | `apps/next/app/globals.css` | `background: hsl(0 0% 13%)` → `var(--color-ink-black)`, `border-radius: 8px` → `var(--radius-md)` |
| 8 | Fix `admin-focus-ring` hardcoded value | `apps/next/app/globals.css` | `outline: 2px solid hsl(0 0% 16%)` → `var(--color-ink-deep)` |

### 5.3 — Edge Cases & Polish

| # | Action | File | Details |
|---|--------|------|---------|
| 1 | Add accessible text enforcement for icon-only buttons | `packages/ui/reusables/button.tsx` | Add runtime warning or require `accessibilityLabel` when children contain no text nodes |
| 2 | Fix carousel tab order on complex layouts | `packages/ui/components/HeroCarouselControls.tsx` | Ensure prev/next buttons fall in correct DOM order relative to slide content |
| 3 | Fix HeroTileCard title clipping at large fonts | `packages/ui/components/home-v2/HeroTileRail.tsx` | Increase `numberOfLines` for small screens with system font scaling |
| 4 | Fix OfferBanners text-on-image contrast | `packages/ui/components/home-v2/OfferBannersGrid.tsx` | Add solid scrim fallback to guarantee 4.5:1 contrast with white text |
| 5 | Add dark mode verification for destructive variant | `packages/ui/reusables/button.tsx` | Verify `dark:bg-destructive/60` has sufficient contrast on dark backgrounds |
| 6 | Fix CSS Grid `as any` cast | `packages/ui/components/home-v2/OfferBannersGrid.tsx` | Use flexWrap with percentage widths for cross-platform safety, or document web-only |

---

## Phase Dependencies

```
Phase 1 (Foundation)
  ├── 1.1 Consolidate Breakpoints     ← no dependencies
  ├── 1.2 Unify Color Token Format    ← no dependencies
  └── 1.3 Dark Mode Bridge           ← depends on 1.2 (colors must be consistent first)

Phase 2 (Accessibility Blockers)
  ├── 2.1 Form Labels                ← depends on 1.2 (token format)
  ├── 2.2 Keyboard & Focus           ← no dependencies
  └── 2.3 Semantic HTML & ARIA       ← depends on 2.1 (forms must have labels first)

Phase 3 (Performance)
  ├── 3.1 Component Memoization      ← depends on 1.1 (useBreakpoint stability affects memo deps)
  ├── 3.2 Expensive Computations     ← depends on 1.1 (breakpoint stability)
  └── 3.3 Animation Optimization     ← no dependencies

Phase 4 (Responsive & Touch)
  ├── 4.1 Touch Target Compliance     ← no dependencies
  └── 4.2 Fluid Layouts              ← depends on 1.1 (useBreakpoint must be wired)

Phase 5 (Visual Polish)
  ├── 5.1 Remove AI Tells            ← no dependencies
  ├── 5.2 Tokenize Magic Numbers     ← depends on 1.2 (token format must be unified)
  └── 5.3 Edge Cases & Polish        ← depends on all previous phases
```

---

## Verification Gates

**After every phase:**

```bash
# 1. Token/style enforcement
yarn guard:checks

# 2. TypeScript compilation
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false

# 3. Build verification (Phases 1, 3, 4 only)
cd apps/next && next build --webpack --debug-prerender
```

**Manual verification:**

| Phase | Manual Check |
|-------|-------------|
| 1.3 | Toggle dark mode, verify all surfaces adapt correctly |
| 2.2 | Navigate entire site with keyboard only (Tab, Shift+Tab, Enter, Escape, Arrow keys) |
| 2.3 | Test with NVDA (Windows) or VoiceOver (macOS/iOS) |
| 4.1 | Test on physical 320px device (iPhone SE / small Android) |
| 5.1 | Visual review against `.impeccable.md` — mass-market commercial, not luxury-editorial |

---

## Definition of Done

- [ ] All P0 issues resolved (8 → 0)
- [ ] All P1 issues resolved (18 → 0)
- [ ] P2 issues resolved or documented as intentional (20 → < 5)
- [ ] P3 items addressed where practical (5 → 0)
- [ ] Audit score improved from 11/20 to 17+/20
- [ ] `yarn guard:checks` passes clean
- [ ] `yarn tsc` passes clean
- [ ] Dark mode manual verification passed
- [ ] Keyboard-only navigation verified
- [ ] Screen reader testing passed for core flows (browse, add to cart, checkout)
- [ ] Touch target verification on physical device

---

## Positive Findings to Maintain

These are working well — don't regress them:

- **Guard system** — best-in-class token enforcement and forbidden import detection
- **Homepage layout engine** — clean CMS → service → normalized blocks → renderer pipeline
- **Reduced motion support** — consistently implemented across AnnouncementTicker, ProductRail, HeroTileRail
- **44px touch targets on hero carousel dots** — correct implementation
- **Server-first architecture** — no apiClient in Server Components, thin route handlers
- **i18n pipeline** — Crowdin integration, RTL support, hardcoded string detection
- **Clean components** — ProductCard, EditorialHotspotSection, NewsletterLoyaltyCta, MiniSearchBar
- **Cache Components** — enabled with tagged caching for safe public reads

---

*Generated from `/audit` report — 2026-04-03*
