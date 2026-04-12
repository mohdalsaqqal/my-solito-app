# REAL Cosmetics Brand Identity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform REAL cosmetics into a distinctive brand with the red arc as visual DNA, Playfair Display typography, strict black/white/red palette, and conversion-optimised product cards.

**Architecture:** New shared BrandArc SVG component used across hero, section titles, nav, CTAs and footer. Google Fonts loaded in index.html. Tailwind extended with display font. Token updates enforce strict B/W/R palette.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite, @phosphor-icons/react, Google Fonts (Playfair Display)

---

## Task 1: Load Google Fonts

**File:** `index.html`

**What to change:** The current `<head>` has no font loading at all — only charset, favicon, viewport, and title. Add three lines immediately before `</head>` to preconnect to Google Fonts CDN and load Playfair Display (weights 700, 900) plus Inter (weights 400, 500, 600, 700).

**Current state of `index.html` head (lines 3–8):**
```html
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>REAL cosmetics</title>
  </head>
```

**Replace with:**
```html
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>REAL cosmetics</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
  </head>
```

**Verify:** Open the browser DevTools (F12) → Network tab → refresh → filter by "googleapis" — you should see a request to `fonts.googleapis.com/css2?family=Inter...&family=Playfair+Display...`. In the Fonts section of the Network tab you should also see `.woff2` files for both families loading.

---

## Task 2: Extend Tailwind with display font

**File:** `tailwind.config.ts`

**What to change:** The current `theme.extend` block (lines 5–71) has `colors`, `boxShadow`, `borderRadius`, `zIndex`, and `letterSpacing` but no `fontFamily`. Add a `fontFamily` key to `theme.extend` so the `font-display` Tailwind class resolves to Playfair Display.

**Current state of `theme.extend` opening (lines 5–7):**
```ts
  theme: {
    extend: {
      colors: {
```

**Replace with:**
```ts
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
```

**Why `Georgia` as fallback:** It is a serif font available on all operating systems, so text stays readable even if the Google Fonts request fails or is slow on first load.

**Verify:** Open the browser DevTools → Elements panel → select any element that already has `font-display` applied (e.g. `SectionHeading` in `atoms.tsx` already uses it at line 15). Check the Computed styles panel — "font-family" should show `"Playfair Display", Georgia, serif`. Alternatively, temporarily add `font-display` to any `<h1>` in the hero and visually confirm the serif typeface appears.

---

## Task 3: Update color tokens (strict B/W/R)

**File:** `src/styles/tokens.css`

**What to change:** Two token values need updating to enforce the strict black/white/red palette from the design doc:

1. `--color-bg` is currently `243 243 243` (a slightly grey tint). Change to `255 255 255` (pure white) to match the logo and design spec.
2. `--color-muted` is currently `111 111 111`. Change to `107 107 107` (neutral grey, imperceptibly slightly darker, correcting a warm/cool tint that was in the original).

**Current lines 1–5:**
```css
:root {
  --color-bg: 243 243 243;
  --color-surface: 255 255 255;
  --color-surface-soft: 248 248 248;
  --color-fg: 17 17 17;
  --color-muted: 111 111 111;
```

**Replace with:**
```css
:root {
  --color-bg: 255 255 255;
  --color-surface: 255 255 255;
  --color-surface-soft: 248 248 248;
  --color-fg: 17 17 17;
  --color-muted: 107 107 107;
```

**Tokens NOT to touch:** `--color-brand` (`194 35 59`), `--color-brand-strong` (`169 29 50`), `--color-ink` (`17 17 17`), `--color-ink-soft`, `--color-surface`, `--color-surface-soft`. These are all already correct for the B/W/R palette. The mint, sun, sky, accent tokens remain for system states (stock indicators, promo badges) — do not remove them.

**Verify:** After saving, the page background should be pure white (`#FFFFFF`) instead of the slightly grey `#F3F3F3`. You can confirm in DevTools → Elements → select `<body>` or the root `<div class="... bg-bg">` → Computed → background-color should be `rgb(255, 255, 255)`.

---

## Task 4: Create BrandArc component

**File:** `src/components/shared/BrandArc.tsx` (NEW FILE — directory `src/components/shared/` may need to be created)

**Context on `cn` import path:** All components in `src/components/` import `cn` from `'../lib/cn'` (confirmed in `atoms.tsx` line 2, `EcommerceHeader.tsx` line 17, `designSystem.tsx`). Since `BrandArc.tsx` lives at `src/components/shared/BrandArc.tsx`, the path to `lib/cn` is `../../lib/cn` (one extra level up from the `shared/` subdirectory).

**Complete file content:**
```tsx
import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';

interface BrandArcProps {
  width?: number;
  animated?: boolean;
  className?: string;
  delay?: number; // ms delay before animation starts
}

export function BrandArc({ width = 100, animated = false, className, delay = 0 }: BrandArcProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!animated || !pathRef.current) return;
    const path = pathRef.current;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.style.transition = 'none';

    const timer = setTimeout(() => {
      path.style.transition = `stroke-dashoffset 0.5s ease-out`;
      path.style.strokeDashoffset = '0';
    }, delay);

    return () => clearTimeout(timer);
  }, [animated, delay]);

  const height = Math.max(10, width * 0.12);
  const cp = height * 0.3;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('block', className)}
      aria-hidden
    >
      <path
        ref={pathRef}
        d={`M2,${height - 2} Q${width / 2},${cp} ${width - 2},${height - 2}`}
        stroke="rgb(var(--color-brand))"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

**How the arc works:** The SVG path uses a quadratic Bézier curve (`Q`). Starting at the bottom-left (`M2,${height-2}`), it curves up through a single control point at the horizontal centre (`Q${width/2},${cp}`), then comes back down to the bottom-right (`${width-2},${height-2}`). The result is a single confident upward swoosh — the same shape as in the REAL logo. The `height` is calculated as 12% of the width so the arc stays proportional at any size. The `cp` (control point Y) is 30% of height, giving the arc gentle depth.

**Animation mechanism:** `getTotalLength()` on the SVG path measures its exact pixel length at runtime. Setting `strokeDasharray` to that length and `strokeDashoffset` to that same length makes the entire stroke "invisible" (offset equals the full dash). When `strokeDashoffset` transitions to `0` the stroke draws in left-to-right. The `delay` prop allows staggering multiple arcs on the same page without adding CSS animation complexity.

**Verify:** Create a temporary test by importing `BrandArc` into `IndexScreen.tsx` and adding `<BrandArc width={200} animated delay={200} />` inside the JSX. Start the dev server (`npm run dev`). On page load you should see a red arc draw in from left to right over ~0.5s. Remove the test element after verification.

---

## Task 5: Update Hero Section

**File:** `src/components/HeaderHeroSection.tsx`

**Context:** The hero is a scrollable rail of `HeroTile` cards. Each tile has an `<h2>` for the tile title (line 203) using variant-specific colour classes from `variantStyles`. The `<h2>` currently reads:
```tsx
<h2 className={`min-h-[62px] line-clamp-2 text-[30px] font-semibold leading-[1.03] ${styles.title}`}>
```

**Changes needed:**

**1. Add BrandArc import** at the top of the file, after the existing imports (after line 13):
```tsx
import { BrandArc } from './shared/BrandArc';
```

**2. Add `font-display` to the hero tile `<h2>`** and insert `<BrandArc>` directly below it. The `animated` and `delay` props are intentionally omitted here since these are in a carousel — the arc will be static (always visible). If you want the draw-in animation on the first tile only, pass `animated` conditionally based on `tile.id === 'tile-1'`.

**Current block (lines 203–206):**
```tsx
                      <h2 className={`min-h-[62px] line-clamp-2 text-[30px] font-semibold leading-[1.03] ${styles.title}`}>
                        {tile.title}
                      </h2>
                      <p className="min-h-12 line-clamp-2 text-sm leading-6 opacity-95">{tile.subtitle}</p>
```

**Replace with:**
```tsx
                      <h2 className={`font-display min-h-[62px] line-clamp-2 text-[30px] font-semibold leading-[1.03] ${styles.title}`}>
                        {tile.title}
                      </h2>
                      <BrandArc
                        width={220}
                        animated={tile.id === 'tile-1'}
                        delay={300}
                        className="mt-1"
                      />
                      <p className="min-h-12 line-clamp-2 text-sm leading-6 opacity-95">{tile.subtitle}</p>
```

**3. Add "endless beauty" tagline** below the subtitle `<p>` and above the `<a>` CTA link. Insert after the subtitle paragraph:
```tsx
                      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted mt-4">endless beauty</p>
```

Note: `text-muted` will resolve to the neutral grey from the token, which looks correct on the pastel/coloured tile panels. If a specific tile's panel colour makes this hard to read, the class can be adjusted per-variant, but for initial implementation `text-muted` provides consistent behaviour across all five variants.

**Verify:** Load the page. The first hero tile's headline should render in Playfair Display serif (noticeable change from the current sans-serif). A red arc should draw in below it approximately 300ms after page load. The "endless beauty" tagline in small tracked caps should appear below the subtitle on every tile. Scroll the carousel — all tiles show the arc and tagline.

---

## Task 6: Update Section Titles throughout

**Context:** The `SectionHeading` component in `src/components/atoms.tsx` (lines 12–19) renders the `<h2>` used by `NewArrivalsSection`, `FeaturedProductsSection`, `BrandShowcaseSection`, `BrandBlocksSection`, `CategoriesFilterSection`, and `TestimonialsSection`. It already has `font-display` on the `<h2>` (line 15 reads `font-display text-3xl font-semibold uppercase tracking-wide text-fg`). However, there is no `BrandArc` below any section title.

**The most efficient approach** is to update `SectionHeading` in `atoms.tsx` once — this propagates the arc to all six sections simultaneously.

**File:** `src/components/atoms.tsx`

**Changes needed:**

**1. Add BrandArc import** at line 2, after the existing `cn` import:
```tsx
import { BrandArc } from './shared/BrandArc';
```

The full updated import block (lines 1–4) becomes:
```tsx
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { BrandArc } from './shared/BrandArc';
import { Layer } from '../ui/layer';
import { IconArrowRight, IconCart, UiButton } from './designSystem';
```

**2. Update `SectionHeading`** to render the arc below the `<h2>`:

**Current (lines 12–19):**
```tsx
export function SectionHeading({ title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={cn('space-y-2', align === 'center' ? 'text-center' : 'text-left')}>
      <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-fg">{title}</h2>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  );
}
```

**Replace with:**
```tsx
export function SectionHeading({ title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={cn('space-y-2', align === 'center' ? 'text-center' : 'text-left')}>
      <div className={cn('inline-flex flex-col', align === 'center' ? 'items-center' : 'items-start')}>
        <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-fg">{title}</h2>
        <BrandArc width={80} animated className="mt-1" />
      </div>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  );
}
```

**Why `inline-flex flex-col`:** Wrapping `<h2>` and `<BrandArc>` in an `inline-flex flex-col` container ensures the arc is only as wide as specified (80px) and aligns left or centre correctly based on the `align` prop. Without this wrapper, the arc `<svg>` would sit at full container width and the `mt-1` margin would create extra space even when centred.

**Verify:** Reload the page and scroll to any section (New Arrivals, Featured Products, Categories, Shop By Brand, Testimonials, or any brand block). Each section heading should have a small red arc (80px wide) drawn in below it, animated on first appearance. The arc should be centred under centred headings and left-aligned under left-aligned headings.

---

## Task 7: Update Product Card — arc + urgency + typography

**File:** `src/components/atoms.tsx`

**Context:** The product card rendering is inside the `ProductCard` function (line 247 onward). The `BrandArc` import added in Task 6 is already in place. Key elements to update:

**7a. Brand name label (seller text) — make it red**

The seller/brand label appears at line 640 in the card info section:
```tsx
<span className="truncate">{seller}</span>
```
This `<span>` is inside a `<div>` with `text-[11px] text-muted`. The brand name should be red, not muted grey.

**Current (line 640):**
```tsx
              <span className="truncate">{seller}</span>
```

**Replace with:**
```tsx
              <span className="truncate text-brand font-semibold tracking-[0.08em] uppercase">{seller}</span>
```

The added classes: `text-brand` makes it red, `font-semibold` bumps weight slightly for legibility at 11px, `tracking-[0.08em]` applies the `luxe` letter-spacing already defined in `tailwind.config.ts`, `uppercase` treats brand names as labels (consistent with Pandora, NARS, MAC style conventions).

**7b. Stock label — make "Selling fast" and "Only X left" red**

The `stockLabel` string is calculated at lines 417–423 and displayed at line 641 inside the same flex row as the seller span:
```tsx
<span className={cn('shrink-0 font-medium', inStock ? 'text-mint-strong' : 'text-danger')}>{stockLabel}</span>
```

`text-mint-strong` is green — the design doc requires urgency signals to be red. The `'Out of stock'` and sold-out state should remain red (already using `text-danger` which is the same red). Only the in-stock urgency states ("Selling fast", "Only X left") need to change colour; "In stock" should remain neutral.

**Current (line 641):**
```tsx
              <span className={cn('shrink-0 font-medium', inStock ? 'text-mint-strong' : 'text-danger')}>{stockLabel}</span>
```

**Replace with:**
```tsx
              <span className={cn(
                'shrink-0 font-medium',
                !inStock ? 'text-danger' :
                (stockLabel === 'Selling fast' || stockLabel.startsWith('Only')) ? 'text-brand' :
                'text-muted'
              )}>{stockLabel}</span>
```

Logic: out-of-stock stays red (`text-danger`); "Selling fast" and "Only X left" become brand red (`text-brand`); "In stock" becomes neutral muted grey (`text-muted`).

**7c. "You save $X.XX" text — change from muted to red**

At line 682–686, the savings line reads:
```tsx
              <p
                className={cn('h-4 text-[11px]', saveAmount ? 'text-muted' : 'text-transparent')}
                aria-hidden={!saveAmount}
              >
                {saveAmount ? `You save ${formatMoney(saveAmount)}` : 'You save $0.00'}
              </p>
```

`text-muted` (grey) should become `text-brand` (red) when a saving is present — this is a proven conversion signal. When no saving, it stays transparent (placeholder for layout).

**Current (line 682–684):**
```tsx
              <p
                className={cn('h-4 text-[11px]', saveAmount ? 'text-muted' : 'text-transparent')}
                aria-hidden={!saveAmount}
```

**Replace with:**
```tsx
              <p
                className={cn('h-4 text-[11px] font-semibold', saveAmount ? 'text-brand' : 'text-transparent')}
                aria-hidden={!saveAmount}
```

Added `font-semibold` alongside `text-brand` to increase visual weight — the savings signal should be bold and red.

**7d. Add BrandArc hover effect on the primary CTA button (scan-compact mode)**

The scan-compact mode CTA button is at lines 548–558:
```tsx
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={!inStock}
              className={cn(
                'mt-auto w-full rounded-md px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition',
                inStock ? 'bg-ink text-white hover:bg-ink/90' : 'bg-stroke text-muted cursor-not-allowed'
              )}
            >
              {primaryButtonLabel}
            </button>
```

**Replace with:**
```tsx
            <div className="mt-auto">
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={!inStock}
                className={cn(
                  'group w-full rounded-md px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition',
                  inStock ? 'bg-ink text-white hover:bg-ink/90' : 'bg-stroke text-muted cursor-not-allowed'
                )}
              >
                <span>{primaryButtonLabel}</span>
              </button>
              {inStock ? (
                <BrandArc
                  width={80}
                  animated
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-0.5 w-full"
                />
              ) : null}
            </div>
```

Note: The `group` class needs to be on an ancestor element that wraps both the button and the arc for `group-hover:opacity-100` to work. Since the button is inside a `<div>`, add `group` to the wrapping `<div>`:

```tsx
            <div className="mt-auto group">
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={!inStock}
                className={cn(
                  'w-full rounded-md px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition',
                  inStock ? 'bg-ink text-white hover:bg-ink/90' : 'bg-stroke text-muted cursor-not-allowed'
                )}
              >
                <span>{primaryButtonLabel}</span>
              </button>
              {inStock ? (
                <BrandArc
                  width={80}
                  animated
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-0.5 w-full"
                />
              ) : null}
            </div>
```

**7e. Add BrandArc hover effect on the quick-view-order action icon button area**

For the `quick-view-order` mode, the price/action row is at lines 658–680. The `ActionButton` (small icon button) at lines 665–679 is the CTA. Wrap the price row div in a group container and add the arc below.

**Current price/action row (lines 658–680):**
```tsx
            <div className="space-y-1">
              <div className="flex min-h-8 items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                  <span className={cn('font-semibold', discountPercent ? 'text-danger' : 'text-fg')}>{price}</span>
                  {originalPrice ? <span className="text-muted line-through">{originalPrice}</span> : null}
                  {discountPercent ? <span className="rounded bg-sun px-1.5 py-0.5 text-[10px] font-semibold text-fg">-{discountPercent}%</span> : null}
                </div>
                {isQuickViewOrder ? (
                  <ActionButton
                    label={quickViewOrderActionLabel}
                    icon={quickViewOrderActionIcon}
                    className={cn(
                      'h-9 w-9 shrink-0 border transition-transform duration-200 hover:scale-105 hover:shadow-elevation-04',
                      inStock
                        ? hasVariantChoices
                          ? 'border-ink bg-ink text-white hover:border-black hover:bg-black'
                          : 'border-danger bg-danger text-white hover:border-brand-strong hover:bg-brand-strong'
                        : 'border-stroke bg-stroke text-muted cursor-not-allowed'
                    )}
                    onClick={handlePrimaryAction}
                  />
                ) : null}
              </div>
              <p
                className={cn('h-4 text-[11px] font-semibold', saveAmount ? 'text-brand' : 'text-transparent')}
                aria-hidden={!saveAmount}
              >
                {saveAmount ? `You save ${formatMoney(saveAmount)}` : 'You save $0.00'}
              </p>
            </div>
```

**Replace with:**
```tsx
            <div className="space-y-1 group">
              <div className="flex min-h-8 items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                  <span className={cn('font-semibold', discountPercent ? 'text-danger' : 'text-fg')}>{price}</span>
                  {originalPrice ? <span className="text-muted line-through">{originalPrice}</span> : null}
                  {discountPercent ? <span className="rounded bg-sun px-1.5 py-0.5 text-[10px] font-semibold text-fg">-{discountPercent}%</span> : null}
                </div>
                {isQuickViewOrder ? (
                  <ActionButton
                    label={quickViewOrderActionLabel}
                    icon={quickViewOrderActionIcon}
                    className={cn(
                      'h-9 w-9 shrink-0 border transition-transform duration-200 hover:scale-105 hover:shadow-elevation-04',
                      inStock
                        ? hasVariantChoices
                          ? 'border-ink bg-ink text-white hover:border-black hover:bg-black'
                          : 'border-danger bg-danger text-white hover:border-brand-strong hover:bg-brand-strong'
                        : 'border-stroke bg-stroke text-muted cursor-not-allowed'
                    )}
                    onClick={handlePrimaryAction}
                  />
                ) : null}
              </div>
              <p
                className={cn('h-4 text-[11px] font-semibold', saveAmount ? 'text-brand' : 'text-transparent')}
                aria-hidden={!saveAmount}
              >
                {saveAmount ? `You save ${formatMoney(saveAmount)}` : 'You save $0.00'}
              </p>
              {isQuickViewOrder && inStock ? (
                <BrandArc
                  width={80}
                  animated
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-0.5"
                />
              ) : null}
            </div>
```

**Verify:**
- Brand names (e.g. "Official Store" or any `seller` prop value) on product cards should now appear in red uppercase small text.
- "You save $X.XX" text should be red and bold.
- "Selling fast" label should be red; "Only X left" should be red; "In stock" should be neutral grey; "Out of stock" remains red.
- Hover over the add-to-cart action area on any product card — a red arc should fade in below it.

---

## Task 8: Update Nav Active Indicator

**File:** `src/components/headers/EcommerceHeader.tsx`

**Context:** There are three header variants. The most relevant nav for the arc active indicator is the `HeaderVariantStickyCompact` component (lines 379–416), which has a horizontal category nav bar at lines 407–413:

```tsx
      <div className="mx-auto hidden h-10 max-w-[1320px] items-center gap-6 px-4 text-[11px] uppercase tracking-wide text-muted lg:flex lg:px-6">
        {categoryNav.map((item) => (
          <a key={item} href="#" className="transition hover:text-fg">
            {item}
          </a>
        ))}
      </div>
```

There is currently no active state on these links. The `HeaderVariantMegaSearch` variant has a mega-menu category list (lines 337–353) with `activeCategory` state — those buttons use `bg-brand/10 text-fg` for the active state but no arc.

**Changes needed:**

**1. Add BrandArc import** at the top of the file (after the existing imports at line 17):
```tsx
import { BrandArc } from '../shared/BrandArc';
```

Note the path from `src/components/headers/` to `src/components/shared/` is `'../shared/BrandArc'`.

**2. Add active state to the sticky-compact category nav** using local state. The `HeaderVariantStickyCompact` function needs `useState` (already imported at line 1). Add `activeNav` state and update the nav link rendering:

**Current `HeaderVariantStickyCompact` function signature and nav (lines 379, 407–413):**
```tsx
function HeaderVariantStickyCompact({ previewMode = false }: { previewMode?: boolean }) {
```
```tsx
      <div className="mx-auto hidden h-10 max-w-[1320px] items-center gap-6 px-4 text-[11px] uppercase tracking-wide text-muted lg:flex lg:px-6">
        {categoryNav.map((item) => (
          <a key={item} href="#" className="transition hover:text-fg">
            {item}
          </a>
        ))}
      </div>
```

**Replace the function opening and nav div with:**
```tsx
function HeaderVariantStickyCompact({ previewMode = false }: { previewMode?: boolean }) {
  const [activeNav, setActiveNav] = useState<string>(categoryNav[0]);
```
```tsx
      <div className="mx-auto hidden h-10 max-w-[1320px] items-center gap-6 px-4 text-[11px] uppercase tracking-wide text-muted lg:flex lg:px-6">
        {categoryNav.map((item) => (
          <a
            key={item}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveNav(item); }}
            className={cn(
              'relative flex flex-col items-center transition',
              activeNav === item ? 'text-fg' : 'hover:text-fg'
            )}
          >
            <span>{item}</span>
            {activeNav === item ? (
              <BrandArc width={40} className="absolute -bottom-1 left-0" />
            ) : null}
          </a>
        ))}
      </div>
```

**3. Add arc active indicator to the mega-search category sidebar** (optional, secondary enhancement). In `HeaderVariantMegaSearch` at lines 337–353, the active category button already shows `bg-brand/10`. Optionally add the arc for visual consistency:

**Current active category button class (line 346):**
```tsx
                    className={cn(
                      'flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm transition',
                      activeCategory === item ? 'bg-brand/10 text-fg' : 'text-muted hover:bg-surface hover:text-fg'
                    )}
```

This is a lower-priority change. The primary task is the sticky-compact nav arc above.

**Verify:** Switch to the `sticky-compact` header variant (if the app allows variant switching via the `?view=` param, navigate to a route that uses `sticky-compact`). Click a category link — the arc should appear under the active link. The arc should move to a different category when you click another link.

---

## Task 9: Update Footer — tagline + arc divider

**File:** `src/components/FooterSection.tsx`

**Context:** The footer structure (lines 21–109) is:
- `<footer className="bg-ink text-white">` — black background
- Instagram image grid (lines 26–38)
- Main content grid with Quick Links, Useful Links, Follow Us/Payment, Newsletter (lines 40–103)
- Copyright bar (lines 105–107)

There is no brand name / logo mark displayed anywhere in the footer content. The brand identity spec calls for adding the brand name with tagline + arc at the top of the main content grid. The arc divider goes at the very top of the `<footer>` element, between the footer opening tag and the instagram grid.

**Changes needed:**

**1. Add BrandArc import** at the top of the file (after the existing imports at line 5):
```tsx
import { BrandArc } from './shared/BrandArc';
```

**2. Add full-width arc divider** at the very top of the `<footer>` element. This is the brand's visual signature entering the footer — a red arc spanning the full viewport width.

**Current footer opening (line 24–25):**
```tsx
  return (
    <footer className="bg-ink text-white">
      <div className="relative grid grid-cols-4 sm:grid-cols-8">
```

**Replace with:**
```tsx
  return (
    <footer className="bg-ink text-white">
      <div className="w-full overflow-hidden">
        <BrandArc width={1200} className="w-full" />
      </div>
      <div className="relative grid grid-cols-4 sm:grid-cols-8">
```

Note: `width={1200}` sets the SVG's intrinsic width. The `className="w-full"` makes it stretch to container width via CSS. The `overflow-hidden` wrapper prevents any subpixel overflow on narrow screens.

**3. Add brand mark with tagline and arc** inside the main content grid as a new fifth column spanning the full width on mobile. The most appropriate placement is as an additional column or a leading full-width row. Since the grid is `md:grid-cols-2 lg:grid-cols-4`, adding a brand column would push it to 5 columns on desktop. A better approach is to add the brand section before the grid as a full-width element, or as the first item in the grid spanning full width on desktop.

**Replace the main content grid opening (lines 40–42):**
```tsx
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="space-y-4">
          <FooterHeading>Quick Links</FooterHeading>
```

**Replace with:**
```tsx
      <div className="mx-auto max-w-[1320px] px-4 pt-10 pb-4 lg:px-6">
        <div className="flex flex-col items-start gap-1">
          <span className="font-display text-[34px] tracking-[0.03em] text-white">REAL</span>
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">cosmetics</span>
          <p className="text-sm tracking-[0.15em] uppercase text-white/70 mt-1">endless beauty</p>
          <BrandArc width={120} className="mt-2 opacity-60" />
        </div>
      </div>
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-8 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="space-y-4">
          <FooterHeading>Quick Links</FooterHeading>
```

**Why not change the font-display class here:** The footer background is black (`bg-ink`). The existing `BrandMark` component in the header uses `font-display` for "REAL" — we replicate the same visual treatment but with `text-white` instead of `text-fg`. The BrandArc uses `rgb(var(--color-brand))` which is the REAL red — this shows as brand red on the black footer background, which matches the logo's black+red combination exactly.

**Full updated FooterSection.tsx return block:**

The complete `return` statement with all changes applied:

```tsx
  return (
    <footer className="bg-ink text-white">
      <div className="w-full overflow-hidden">
        <BrandArc width={1200} className="w-full" />
      </div>
      <div className="relative grid grid-cols-4 sm:grid-cols-8">
        {instagramTiles.map((image, idx) => (
          <div key={idx} className="h-20 sm:h-28">
            <img src={image} alt="Instagram" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
        <button
          type="button"
          className="absolute left-1/2 mt-7 -translate-x-1/2 rounded-md bg-white px-5 py-2 text-sm font-medium text-fg sm:mt-11"
        >
          Instagram
        </button>
      </div>

      <div className="mx-auto max-w-[1320px] px-4 pt-10 pb-4 lg:px-6">
        <div className="flex flex-col items-start gap-1">
          <span className="font-display text-[34px] tracking-[0.03em] text-white">REAL</span>
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">cosmetics</span>
          <p className="text-sm tracking-[0.15em] uppercase text-white/70 mt-1">endless beauty</p>
          <BrandArc width={120} className="mt-2 opacity-60" />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-8 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="space-y-4">
          <FooterHeading>Quick Links</FooterHeading>
          <ul className="space-y-2 text-sm text-white/75">
            {quickLinks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <FooterHeading>Useful Links</FooterHeading>
          <ul className="space-y-2 text-sm text-white/75">
            {usefulLinks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <FooterHeading>Follow Us</FooterHeading>
          <div className="flex gap-3 text-white/80">
            <a href="#" aria-label="Facebook" className="transition hover:text-white">
              <FacebookLogo size={20} weight="fill" />
            </a>
            <a href="#" aria-label="Instagram" className="transition hover:text-white">
              <InstagramLogo size={20} weight="fill" />
            </a>
            <a href="#" aria-label="YouTube" className="transition hover:text-white">
              <YoutubeLogo size={20} weight="fill" />
            </a>
            <a href="#" aria-label="TikTok" className="transition hover:text-white">
              <TiktokLogo size={20} weight="fill" />
            </a>
          </div>
          <FooterHeading>Payment</FooterHeading>
          <PaymentBadges />
        </div>

        <div className="space-y-4">
          <FooterHeading>Subscribe Our Newsletter</FooterHeading>
          <p className="text-sm leading-6 text-white/75">
            Subscribe to the weekly newsletter for all the latest updates and get a 10% off bill offer.
          </p>
          <div className="flex rounded-md bg-white p-1">
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 flex-1 border-0 bg-transparent px-3 text-sm text-fg outline-none"
            />
            <button
              type="button"
              onClick={() => setEmail('')}
              className="grid h-10 w-10 place-items-center rounded bg-sun text-fg"
              aria-label="Send"
            >
              <IconArrowRight />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 py-4 text-center text-xs text-white/80">
        Copyright {new Date().getFullYear()} REAL cosmetics. Designed by BZOTech.com
      </div>
    </footer>
  );
```

**Verify:** Scroll to the bottom of the page. You should see:
1. A full-width red arc spanning the very top of the footer, just above the Instagram image grid. This acts as a visual divider between the main content and the footer.
2. Below the Instagram grid, the REAL cosmetics brand name in Playfair Display (white), the "cosmetics" sub-label, then "endless beauty" tagline in tracked uppercase white/70 text.
3. A small red arc (120px, 60% opacity) below the tagline.
4. The four-column footer links grid below the brand section.

---

## Implementation Order

Execute tasks in this order to avoid broken imports:

1. **Task 1** (Google Fonts) — no dependencies
2. **Task 2** (Tailwind `font-display`) — no dependencies
3. **Task 3** (token CSS) — no dependencies
4. **Task 4** (BrandArc component) — must complete before Tasks 5–9
5. **Task 5** (Hero Section) — requires Task 4
6. **Task 6** (Section Titles) — requires Task 4; import added in Task 7 step 1 covers both
7. **Task 7** (Product Card) — requires Task 4; imports Task 4 in the same step
8. **Task 8** (Nav Active Indicator) — requires Task 4
9. **Task 9** (Footer) — requires Task 4

Tasks 1, 2, 3 can be done in any order or in parallel. Task 4 is the prerequisite blocker for all remaining tasks.
