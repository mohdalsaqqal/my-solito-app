# Design System & Product Card Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all design, accessibility, token, responsiveness, and UX issues found in the frontend design analysis of the REAL cosmetics e-commerce UI.

**Architecture:** Issues are grouped into 10 logical tasks ordered by dependency — token fixes first (since `--color-mint` corrupts dozens of components), then content/branding, then accessibility, then component-level fixes. No new dependencies required; all fixes are CSS, TSX, and HTML changes within the existing Vite + React + Tailwind stack.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS (token-driven via CSS variables in `src/styles/tokens.css`), Phosphor Icons (`@phosphor-icons/react`)

**Verify after each task:** `npm run dev` is running at `http://localhost:5173/` — check visually in browser.

---

## Task 1: Fix `--color-mint` Token (Highest Impact)

**Why this is first:** `--color-mint` is currently set to the same value as `--color-brand` (`#C2233B` red). This corrupts: CTA buttons, "In stock" labels (shown in danger-red), wishlist active state, star ratings, feedback card border, and mode switcher. Fixing this single token cascades fixes across the whole UI.

**Files:**
- Modify: `src/styles/tokens.css:12-13`

**Step 1: Update the mint token to a distinct teal/green**

In `src/styles/tokens.css`, replace lines 12–13:

```css
/* BEFORE */
--color-mint: 194 35 59;
--color-mint-strong: 169 29 50;

/* AFTER */
--color-mint: 22 163 74;
--color-mint-strong: 15 118 55;
```

This sets mint to `#16A34A` (green-600) and mint-strong to `#0F7637` (green-700) — a clear positive/success color appropriate for "In stock", add-to-cart CTAs, and active states.

**Step 2: Verify in browser**

Open `http://localhost:5173/?view=card-system` and confirm:
- "In stock" / "Selling fast" labels are now **green**, not red
- Primary CTA buttons on cards are green
- Active wishlist button is green
- Star ratings are green
- Mode switcher active button is green

Open `http://localhost:5173/` and confirm:
- Feedback card dashed border is green, not red

---

## Task 2: Fix `--color-sun` Token Naming Mismatch

**Why:** `--color-sun` is `214 225 238` (a light blue `#D6E1EE`). "Sun" implies warm/yellow. It's used as the discount badge background on product cards (`bg-sun`). Either rename it to match the actual color intent or change its value to a warm yellow.

**Files:**
- Modify: `src/styles/tokens.css:14`
- Modify: `tailwind.config.ts:18` (rename token alias if renaming)

**Step 1: Decide the intent and fix**

The discount badge uses `bg-sun px-1.5 py-0.5 text-[10px] font-semibold text-fg` for "-19%" etc. A warm yellow better signals "discount/sale" than light blue. Change the value:

In `src/styles/tokens.css`, replace line 14:
```css
/* BEFORE */
--color-sun: 214 225 238;

/* AFTER */
--color-sun: 254 240 138;
```

This sets sun to `#FEF08A` (yellow-200) — warm, appropriate for discount badges, and the existing `text-fg` (dark) on it will pass contrast.

**Step 2: Verify in browser**

Open `http://localhost:5173/?view=card-system` — discount percentage badges (e.g. "-33%") should now appear on a warm yellow background instead of light blue.

---

## Task 3: Gate Dev Navigation Bar Behind DEV Flag

**Why:** 10 floating fixed-position links (`Asset Gallery`, `Components`, etc.) are always rendered in production at `z-50` top-right, overlapping the header on the main page.

**Files:**
- Modify: `src/components/IndexScreen.tsx:15-76`

**Step 1: Wrap the dev nav in an env check**

In `src/components/IndexScreen.tsx`, wrap the fixed nav div:

```tsx
/* BEFORE */
<div className="fixed right-4 top-4 z-50 flex gap-2">
  ...all the links...
</div>

/* AFTER */
{import.meta.env.DEV && (
  <div className="fixed right-4 top-4 z-50 flex flex-wrap justify-end gap-2 max-w-[600px]">
    ...all the links...
  </div>
)}
```

**Step 2: Verify**

- In dev (`npm run dev`): links still visible at top-right ✓
- Build with `npm run build` then `npm run preview`: links should be gone ✓

---

## Task 4: Fix Brand Name Inconsistency

**Why:** Three different brand names appear: "REAL cosmetics" (navbar), "Sephora Placeholder" (page title), "Copyright 2023 Sephora" (footer), "Follow BZOPets" (footer social heading).

**Files:**
- Modify: `src/components/FooterSection.tsx:61,103`
- Modify: `index.html` (page title)

**Step 1: Fix footer social heading**

In `src/components/FooterSection.tsx`, replace line 61:
```tsx
/* BEFORE */
<FooterHeading>Follow BZOPets</FooterHeading>

/* AFTER */
<FooterHeading>Follow Us</FooterHeading>
```

**Step 2: Fix copyright year and brand name**

In `src/components/FooterSection.tsx`, replace line 103:
```tsx
/* BEFORE */
Copyright 2023 Sephora. Designed by BZOTech.com

/* AFTER */
Copyright {new Date().getFullYear()} REAL cosmetics. Designed by BZOTech.com
```

**Step 3: Fix page title**

In `index.html`, find the `<title>` tag and update:
```html
<!-- BEFORE -->
<title>Sephora Placeholder</title>

<!-- AFTER -->
<title>REAL cosmetics</title>
```

**Step 4: Verify**

Open `http://localhost:5173/` — browser tab shows "REAL cosmetics", footer shows correct brand name and current year, social heading says "Follow Us".

---

## Task 5: Fix Footer Issues (Social Icons + Placeholder Inputs)

**Why:** Footer social links use text characters (`f`, `ig`, `yt`, `tt`) instead of SVG icons. Two `SearchField` components with `placeholder="Placeholder"` are orphaned UI with no clear purpose.

**Files:**
- Modify: `src/components/FooterSection.tsx`

**Step 1: Replace text social links with Phosphor SVG icons**

`@phosphor-icons/react` is already installed (used in `EcommerceHeader.tsx`). Import and use:

In `src/components/FooterSection.tsx`, add the import:
```tsx
import { FacebookLogo, InstagramLogo, YoutubeLogo, TiktokLogo } from '@phosphor-icons/react';
```

Replace the social spans block (lines 62–67):
```tsx
/* BEFORE */
<div className="flex gap-2 text-sm text-white/80">
  <span>f</span>
  <span>ig</span>
  <span>yt</span>
  <span>tt</span>
</div>

/* AFTER */
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
```

**Step 2: Remove the two orphaned SearchField inputs**

In `src/components/FooterSection.tsx`:
- Remove `const [searchOne, setSearchOne] = useState('');` (line 23)
- Remove `const [searchTwo, setSearchTwo] = useState('');` (line 24)
- Remove the `<div className="space-y-2">` block containing the two `SearchField` components (lines 95–98)
- Remove the `SearchField` import if it becomes unused

**Step 3: Verify**

Open `http://localhost:5173/` — scroll to footer, see proper social icons with hover states. No orphaned search inputs.

---

## Task 6: Fix Header Accessibility (Icon Buttons + Utility Bar Social)

**Why:** `ActionIcon` buttons (User, Wishlist, Cart) have no `aria-label`. TopUtilityBar social links use text "FB", "IG", "YT", "TT".

**Files:**
- Modify: `src/components/headers/EcommerceHeader.tsx`

**Step 1: Add aria-labels to ActionIcon buttons**

In `EcommerceHeader.tsx`, the `RightControls` function uses `<ActionIcon>` three times. Add `aria-label` to `ActionIcon`:

Change the `ActionIcon` component signature and element (lines 147–157):
```tsx
/* BEFORE */
function ActionIcon({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <button type="button" className="relative grid h-9 w-9 place-items-center text-fg transition hover:text-brand">

/* AFTER */
function ActionIcon({ children, count, label }: { children: ReactNode; count?: number; label: string }) {
  return (
    <button type="button" aria-label={count ? `${label} (${count})` : label} className="relative grid h-9 w-9 place-items-center text-fg transition hover:text-brand">
```

Then update the three call sites in `RightControls`:
```tsx
/* BEFORE */
<ActionIcon>
  <User size={21} weight="regular" />
</ActionIcon>
<ActionIcon count={2}>
  <Heart size={21} weight="regular" />
</ActionIcon>
<ActionIcon count={3}>
  <ShoppingCart size={21} weight="regular" />
</ActionIcon>

/* AFTER */
<ActionIcon label="Account">
  <User size={21} weight="regular" />
</ActionIcon>
<ActionIcon label="Wishlist" count={2}>
  <Heart size={21} weight="regular" />
</ActionIcon>
<ActionIcon label="Cart" count={3}>
  <ShoppingCart size={21} weight="regular" />
</ActionIcon>
```

**Step 2: Replace TopUtilityBar text social links with Phosphor icons**

In `TopUtilityBar` (lines 115–119):
```tsx
/* BEFORE */
<div className="hidden items-center gap-3 text-[11px] md:flex">
  <span>FB</span>
  <span>IG</span>
  <span>YT</span>
  <span>TT</span>
</div>

/* AFTER */
<div className="hidden items-center gap-3 md:flex">
  <a href="#" aria-label="Facebook" className="transition hover:text-white/70">
    <FacebookLogo size={14} weight="fill" />
  </a>
  <a href="#" aria-label="Instagram" className="transition hover:text-white/70">
    <InstagramLogo size={14} weight="fill" />
  </a>
  <a href="#" aria-label="YouTube" className="transition hover:text-white/70">
    <YoutubeLogo size={14} weight="fill" />
  </a>
  <a href="#" aria-label="TikTok" className="transition hover:text-white/70">
    <TiktokLogo size={14} weight="fill" />
  </a>
</div>
```

Add the import at the top of `EcommerceHeader.tsx`:
```tsx
import { FacebookLogo, InstagramLogo, YoutubeLogo, TiktokLogo, ... } from '@phosphor-icons/react';
```

**Step 3: Remove flag emojis from LanguageSwitcher**

In `languageOptions` array (lines 29–34), remove the `flag` field and its usage:
```tsx
/* BEFORE */
const languageOptions = [
  { flag: '🇺🇸', code: 'EN', label: 'English' },
  ...
];

/* AFTER */
const languageOptions = [
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Español' },
  { code: 'FR', label: 'Français' },
  { code: 'AR', label: 'العربية' },
];
```

In the dropdown button template, remove `<span aria-hidden>{option.flag}</span>`.

**Step 4: Verify**

Open browser DevTools → Accessibility tree → confirm User/Wishlist/Cart buttons have accessible names. Visually confirm top bar and header show proper icons.

---

## Task 7: Fix Carousel Buttons Accessibility

**Why:** Prev/Next carousel buttons in `NewArrivalsSection` and `FeaturedProductsSection` use `<` and `>` text characters with no aria-label.

**Files:**
- Modify: `src/components/atoms.tsx` (CarouselButton component)

**Step 1: Find and update CarouselButton**

In `src/components/atoms.tsx`, find the `CarouselButton` component (around line 895+) and add aria-label + SVG icon:

```tsx
/* BEFORE — whatever the current implementation is */
export function CarouselButton({ direction, className }: CarouselButtonProps) {
  return (
    <button ... >
      <generic>{direction === 'left' ? '<' : '>'}</generic>
    </button>
  );
}

/* AFTER */
export function CarouselButton({ direction, className }: CarouselButtonProps) {
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      className={cn('...existing classes...', className)}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {direction === 'left'
          ? <path d="M15 18l-6-6 6-6" />
          : <path d="M9 18l6-6-6-6" />
        }
      </svg>
    </button>
  );
}
```

**Step 2: Verify**

Open `http://localhost:5173/` → New Arrivals section → carousel prev/next buttons show chevron icons. DevTools accessibility tree shows "Previous" / "Next" labels.

---

## Task 8: Fix `ShopNowButton` Label + Placeholder Section Subtitles

**Why:** `ShopNowButton` renders the text "Button" as its label. Four section subtitles say "It is a long established fact that a reader" (lorem ipsum).

**Files:**
- Modify: `src/components/atoms.tsx:21-33`
- Modify: `src/components/CategoriesFilterSection.tsx`
- Modify: `src/components/NewArrivalsSection.tsx`
- Modify: `src/components/BrandShowcaseSection.tsx`
- Modify: `src/components/FeaturedProductsSection.tsx`

**Step 1: Fix ShopNowButton label**

In `src/components/atoms.tsx` lines 21–33:
```tsx
/* BEFORE */
export function ShopNowButton({ className }: { className?: string }) {
  return (
    <UiButton variant="solid" size="md" leftIcon={<IconCart />} rightIcon={<IconArrowRight />} className={className}>
      Button
    </UiButton>
  );
}

/* AFTER */
export function ShopNowButton({ label = 'Shop Now', className }: { label?: string; className?: string }) {
  return (
    <UiButton variant="solid" size="md" leftIcon={<IconCart />} rightIcon={<IconArrowRight />} className={className}>
      {label}
    </UiButton>
  );
}
```

**Step 2: Replace lorem ipsum subtitles**

Search all section components for `"It is a long established fact that a reader"` and replace with relevant copy:

| Component | Suggested subtitle |
|-----------|-------------------|
| `CategoriesFilterSection` | `Browse by skin concern, product type, or routine step` |
| `NewArrivalsSection` | `The latest drops — added this week` |
| `BrandShowcaseSection` | `Trusted names in skincare, body care, and beauty` |
| `FeaturedProductsSection` | `Buy any 4 or more and get 20% off` (already has this — verify) |

**Step 3: Verify**

Open `http://localhost:5173/` — scroll through page, no lorem ipsum subtitles. PromotionalBanner section buttons say "Shop Now" not "Button".

---

## Task 9: Fix Product Card Badge Token Colors + Border Radius

**Why:** Badge colors bypass the token system with hardcoded hex. Card uses `rounded-[2px]` instead of the design system's `--radius-sm` (0.5rem).

**Files:**
- Modify: `src/components/atoms.tsx:82-113` (Badge component)
- Modify: `src/styles/tokens.css` (add badge tokens)

**Step 1: Add badge color tokens**

In `src/styles/tokens.css`, add after the existing color block:
```css
/* Badge colors */
--color-badge-new-bg: 17 17 17;
--color-badge-new-fg: 255 255 255;
--color-badge-sale-bg: 194 35 59;
--color-badge-sale-fg: 255 255 255;
--color-badge-bestseller-bg: 42 37 35;
--color-badge-bestseller-fg: 255 255 255;
--color-badge-limited-bg: 233 214 167;
--color-badge-limited-fg: 90 59 0;
```

In `tailwind.config.ts`, add to the `colors` object:
```ts
'badge-new-bg': 'rgb(var(--color-badge-new-bg) / <alpha-value>)',
'badge-new-fg': 'rgb(var(--color-badge-new-fg) / <alpha-value>)',
'badge-sale-bg': 'rgb(var(--color-badge-sale-bg) / <alpha-value>)',
'badge-sale-fg': 'rgb(var(--color-badge-sale-fg) / <alpha-value>)',
'badge-bestseller-bg': 'rgb(var(--color-badge-bestseller-bg) / <alpha-value>)',
'badge-bestseller-fg': 'rgb(var(--color-badge-bestseller-fg) / <alpha-value>)',
'badge-limited-bg': 'rgb(var(--color-badge-limited-bg) / <alpha-value>)',
'badge-limited-fg': 'rgb(var(--color-badge-limited-fg) / <alpha-value>)',
```

**Step 2: Update Badge component to use tokens**

In `src/components/atoms.tsx` (lines 82–113):
```tsx
/* BEFORE */
const badgeMap: Record<BadgeType, { label: string; className: string }> = {
  new:        { label: 'New',           className: 'bg-[#111111] text-white' },
  sale:       { label: 'Sale',          className: 'bg-[#C81E3A] text-white' },
  bestseller: { label: 'Best Seller',   className: 'bg-[#2A2523] text-white' },
  limited:    { label: 'Limited Edition', className: 'bg-[#E9D6A7] text-[#5A3B00]' },
};

/* AFTER */
const badgeMap: Record<BadgeType, { label: string; className: string }> = {
  new:        { label: 'New',           className: 'bg-badge-new-bg text-badge-new-fg' },
  sale:       { label: 'Sale',          className: 'bg-badge-sale-bg text-badge-sale-fg' },
  bestseller: { label: 'Best Seller',   className: 'bg-badge-bestseller-bg text-badge-bestseller-fg' },
  limited:    { label: 'Limited Edition', className: 'bg-badge-limited-bg text-badge-limited-fg' },
};
```

**Step 3: Fix card border radius to use design system token**

In `src/components/atoms.tsx`, find all `rounded-[2px]` occurrences (lines ~481, ~549) and replace:
```tsx
/* BEFORE */
<div className="group flex h-full flex-col gap-3 rounded-[2px] border border-stroke bg-surface p-3">

/* AFTER */
<div className="group flex h-full flex-col gap-3 rounded-sm border border-stroke bg-surface p-3">
```

Also update the inner layer's `rounded-[2px]`:
```tsx
/* BEFORE */
<Layer depth="e02" tone="neutral" className="relative overflow-hidden rounded-[2px] border-0 p-0">

/* AFTER */
<Layer depth="e02" tone="neutral" className="relative overflow-hidden rounded-sm border-0 p-0">
```

**Step 4: Verify**

Open `http://localhost:5173/?view=card-system` — badges look the same visually but now use token classes. Cards have a slightly more rounded corner (0.5rem vs 1.5px).

---

## Task 10: Fix Product Card — Feedback Toast in Quick-View-Order Mode

**Why:** The default mode (`quick-view-order`) suppresses the feedback toast — users get zero confirmation when they wishlist or share a product.

**Files:**
- Modify: `src/components/atoms.tsx:739-741`

**Step 1: Show feedback toast in all modes**

In `src/components/atoms.tsx`, find the conditional around line 739:
```tsx
/* BEFORE */
{feedback && !isQuickViewOrder ? (
  <p className="min-h-[16px] text-[11px] font-medium text-mint-strong">{feedback}</p>
) : null}

/* AFTER */
{feedback ? (
  <p className="min-h-[16px] text-[11px] font-medium text-mint-strong">{feedback}</p>
) : null}
```

**Step 2: Verify**

Open `http://localhost:5173/?view=card-system` with mode set to "Quick View Order". Click the wishlist button — a green feedback message should appear briefly on the card.

---

## Task 11: Fix Star Rating Accessibility

**Why:** `toStars()` renders `*****` text characters in `font-mono`. Screen readers announce "asterisk asterisk asterisk..." — not "4.7 out of 5 stars".

**Files:**
- Modify: `src/components/atoms.tsx` (rating display, ~3 locations)

**Step 1: Update `toStars` to use Unicode stars**

Replace the `toStars` function (line 137):
```tsx
/* BEFORE */
function toStars(value: number) {
  const rounded = Math.max(1, Math.min(5, Math.round(value)));
  return `${'*'.repeat(rounded)}${'.'.repeat(5 - rounded)}`;
}

/* AFTER */
function toStars(value: number) {
  const rounded = Math.max(1, Math.min(5, Math.round(value)));
  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
}
```

**Step 2: Add aria-label to every rating display**

There are 3 rating display instances in the component. Each looks like:
```tsx
<div className="flex h-4 items-center gap-2 text-[11px] text-muted">
  <span className="font-mono tracking-[1.5px] text-mint">{toStars(rating.value)}</span>
  <span>{rating.value.toFixed(1)}</span>
  <span>({rating.count})</span>
</div>
```

Wrap the stars span with accessible markup:
```tsx
<div
  className="flex h-4 items-center gap-2 text-[11px] text-muted"
  role="img"
  aria-label={`${rating.value.toFixed(1)} out of 5 stars, ${rating.count} reviews`}
>
  <span className="font-mono tracking-[1.5px] text-mint" aria-hidden>{toStars(rating.value)}</span>
  <span aria-hidden>{rating.value.toFixed(1)}</span>
  <span aria-hidden>({rating.count})</span>
</div>
```

Apply this pattern to all 3 rating display locations in `atoms.tsx` (card body, scan-compact body, quick view modal).

**Step 3: Verify**

Open `http://localhost:5173/?view=card-system` — stars now display `★★★★★` / `★★★★☆` Unicode. DevTools accessibility tree shows the rating div with label "4.7 out of 5 stars, 240 reviews".

---

## Task 12: Fix Quick View Modal — Escape Key + Qty Button Labels

**Why:** Quick view modal doesn't close on Escape (unlike the mega menu which does). Qty `+`/`-` buttons have no accessible labels.

**Files:**
- Modify: `src/components/atoms.tsx` (quick view modal, ~line 760)

**Step 1: Add Escape key handler to quick view modal**

In `ProductCard`, add a `useEffect` for Escape (alongside the existing ones):
```tsx
useEffect(() => {
  if (!isQuickViewOpen) return;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setIsQuickViewOpen(false);
  };
  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}, [isQuickViewOpen]);
```

**Step 2: Add aria-labels to Qty buttons**

In the quick view modal qty section (around line 857–872):
```tsx
/* BEFORE */
<button type="button" onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="px-2 py-1 text-sm">
  -
</button>
<span className="min-w-8 text-center text-sm">{quantity}</span>
<button type="button" onClick={() => setQuantity(prev => Math.min(10, prev + 1))} className="px-2 py-1 text-sm">
  +
</button>

/* AFTER */
<button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="px-2 py-1 text-sm">
  −
</button>
<span className="min-w-8 text-center text-sm" aria-live="polite" aria-label={`Quantity: ${quantity}`}>{quantity}</span>
<button type="button" aria-label="Increase quantity" onClick={() => setQuantity(prev => Math.min(10, prev + 1))} className="px-2 py-1 text-sm">
  +
</button>
```

**Step 3: Verify**

Open `http://localhost:5173/?view=card-system` → click "Choose Options" to open quick view modal → press `Escape` — modal closes. DevTools accessibility tree: qty buttons show "Decrease quantity" / "Increase quantity" labels.

---

## Task 13: Fix Card Fixed Widths (Responsiveness)

**Why:** `CardProductElement` (w-[334px]), `BannerCardElement` (w-[840px] h-[350px]), `FeedbackCardElement` (w-[666px]), `CategoriesCardElement` (w-[334px]) all use fixed widths that break on smaller viewports.

**Files:**
- Modify: `src/components/elements/cards/CardProductElement.tsx:60`
- Modify: `src/components/elements/cards/BannerCardElement.tsx:9,13-16`
- Modify: `src/components/elements/cards/FeedbackCardElement.tsx:17`
- Modify: `src/components/elements/cards/CategoriesCardElement.tsx:46`

**Step 1: Fix CardProductElement wrapper**

```tsx
/* BEFORE */
<div className="w-[334px]">

/* AFTER */
<div className="w-full max-w-[334px]">
```

**Step 2: Fix BannerCardElement**

```tsx
/* BEFORE */
<article className="relative h-[350px] w-[840px] overflow-hidden rounded-lg bg-surface">
  ...
  <div className="absolute left-[60px] top-[60px]">
    <p className="w-[400px] font-poppins text-[26px] leading-8 text-fg">{subheading}</p>
    <p className="mt-6 w-[400px] font-poppins text-[34px] font-semibold leading-10 tracking-[0.0025em] text-fg">
      {heading}
    </p>

/* AFTER */
<article className="relative h-[350px] w-full overflow-hidden rounded-lg bg-surface">
  ...
  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-8 pb-8 pt-16">
    <p className="font-poppins text-xl leading-7 text-white md:text-[26px] md:leading-8">{subheading}</p>
    <p className="mt-3 font-poppins text-2xl font-semibold leading-8 tracking-[0.0025em] text-white md:text-[34px] md:leading-10">
      {heading}
    </p>
```

Also update the button:
```tsx
/* BEFORE */
<button ... className="mt-8 inline-flex h-12 w-[150px] ... bg-mint ...">

/* AFTER */
<button ... className="mt-6 inline-flex h-11 w-auto px-6 ... bg-mint ...">
```

**Step 3: Fix FeedbackCardElement**

```tsx
/* BEFORE */
<article className="w-[666px] rounded-lg border border-dashed border-mint bg-surface p-10">

/* AFTER */
<article className="w-full max-w-[666px] rounded-lg border border-dashed border-mint bg-surface p-6 md:p-10">
```

**Step 4: Fix CategoriesCardElement**

```tsx
/* BEFORE */
<article className="w-[334px] space-y-2 rounded-md border border-dashed border-accent p-2">

/* AFTER */
<article className="w-full max-w-[334px] space-y-2 rounded-md border border-dashed border-accent p-2">
```

Also fix the inner `CategoryPill` fixed widths:
```tsx
/* BEFORE */
<div className="flex h-[140px] items-center justify-center rounded-[100px] bg-surface px-[30px] shadow-elevation-02">
  <div className="flex w-[258px] items-center justify-between">
    ...
    <div className="flex w-[158px] items-center justify-between">

/* AFTER */
<div className="flex h-[140px] items-center justify-center rounded-full bg-surface px-6 shadow-elevation-02">
  <div className="flex w-full items-center justify-between gap-3">
    ...
    <div className="flex flex-1 items-center justify-between gap-2">
```

**Step 5: Verify**

Open `http://localhost:5173/?view=card-system` at 375px viewport width (DevTools mobile). Cards should fill their container. Banner card should be full-width with readable overlay text.

---

## Task 14: Fix BannerCardElement Text Contrast

**Why:** Banner uses `bg-ink/20` overlay (20% opacity) with `text-fg` (dark text). Dark text on a semi-dark overlay over an unknown image is unreliable. Task 13 already migrates to a gradient overlay with white text — this task verifies the contrast improvement is sufficient or strengthens it.

**Files:**
- Modify: `src/components/elements/cards/BannerCardElement.tsx` (already partly addressed in Task 13)

**Step 1: Ensure overlay gradient is sufficient**

After Task 13's changes, the text should be white on a gradient overlay. Verify in browser:
- Open `http://localhost:5173/?view=card-system`
- Inspect the banner card — text should be clearly legible against the gradient

If contrast is still insufficient for any image, strengthen the gradient:
```tsx
/* Stronger overlay if needed */
className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent ..."
```

---

## Task 15: Fix `quickActionButtons.className` Dead Code

**Why:** The `quickActionButtons` array defines a `className` property for each item, but `QuickActionRow` and `HeaderVariantMegaSearch` both ignore it and use hardcoded inline logic instead.

**Files:**
- Modify: `src/components/headers/EcommerceHeader.tsx:36-67, 238-256, 334-351`

**Step 1: Remove the unused `className` field from the config**

In `src/components/headers/EcommerceHeader.tsx`, remove `className` from each item in `quickActionButtons` (lines 36–67):
```tsx
/* BEFORE */
const quickActionButtons = [
  {
    key: 'best-selling',
    label: 'Best Selling',
    className: 'bg-surface text-fg border border-stroke hover:border-brand/45 hover:bg-brand/10'
  },
  ...
] as const;

/* AFTER */
const quickActionButtons = [
  { key: 'best-selling', label: 'Best Selling' },
  { key: 'top-categories', label: 'Top Categories' },
  { key: 'new-arrival', label: 'New Arrival' },
  { key: 'bundles', label: 'Bundles' },
  { key: 'luxury-product', label: 'Luxury Product' },
  { key: 'hot-sale', label: 'Hot Sale' },
] as const;
```

**Step 2: Verify no TypeScript errors**

Run: `npm run build` — should complete with 0 errors.

---

## Task 16: Add `prefers-reduced-motion` Guards

**Why:** Hover animations (`hover:-translate-y-1`, image scale) don't respect user's motion preferences.

**Files:**
- Modify: `src/components/SephoraPlaceholder.tsx:85`
- Modify: `src/components/atoms.tsx` (image hover scale ~line 558)

**Step 1: Add motion-safe to product hover animations**

In `src/components/atoms.tsx`, find the image scale on hover (~line 558):
```tsx
/* BEFORE */
className={cn('h-full w-full object-cover transition duration-300', isQuickViewOrder ? 'group-hover:scale-[1.02]' : '')}

/* AFTER */
className={cn('h-full w-full object-cover transition duration-300', isQuickViewOrder ? 'motion-safe:group-hover:scale-[1.02]' : '')}
```

In `src/components/SephoraPlaceholder.tsx` (line 85):
```tsx
/* BEFORE */
<Layer ... className="group p-4 transition hover:-translate-y-1">

/* AFTER */
<Layer ... className="group p-4 transition motion-safe:hover:-translate-y-1">
```

**Step 2: Verify**

In browser DevTools → Rendering → check "Emulate CSS media feature prefers-reduced-motion: reduce". Hover over product cards — no scale/translate animations. With `prefers-reduced-motion: no-preference`, animations work normally.

---

## Task 17: Add Favicon

**Why:** Browser console shows 404 for `favicon.ico`.

**Files:**
- Create: `public/favicon.svg`
- Modify: `index.html`

**Step 1: Create a minimal brand favicon**

Create `public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#C2233B"/>
  <text x="16" y="22" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="white">R</text>
</svg>
```

**Step 2: Update index.html to reference SVG favicon**

In `index.html`, update (or add) the favicon link:
```html
<!-- BEFORE -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />

<!-- AFTER -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

**Step 3: Verify**

Hard-refresh browser. Browser console should have no favicon 404. Browser tab shows a red "R" icon.

---

## Summary of All Fixes

| Task | Issue | Files Touched |
|------|-------|--------------|
| 1 | `--color-mint` = brand red | `tokens.css` |
| 2 | `--color-sun` = light blue, named wrong | `tokens.css` |
| 3 | Dev nav always visible in production | `IndexScreen.tsx` |
| 4 | Brand name inconsistency + copyright year | `FooterSection.tsx`, `index.html` |
| 5 | Footer social text + orphaned inputs | `FooterSection.tsx` |
| 6 | Header icon button aria-labels + text social links + flag emojis | `EcommerceHeader.tsx` |
| 7 | Carousel buttons `<`/`>` text | `atoms.tsx` (CarouselButton) |
| 8 | "Button" label + lorem ipsum subtitles | `atoms.tsx`, section components |
| 9 | Badge hardcoded hex + `rounded-[2px]` | `atoms.tsx`, `tokens.css`, `tailwind.config.ts` |
| 10 | Feedback toast hidden in default card mode | `atoms.tsx` |
| 11 | Star rating inaccessible `*****` text | `atoms.tsx` |
| 12 | Quick view: no Escape key, qty no aria-labels | `atoms.tsx` |
| 13 | Fixed widths on card wrappers | 4 card element files |
| 14 | Banner text contrast unreliable | `BannerCardElement.tsx` |
| 15 | `quickActionButtons.className` dead code | `EcommerceHeader.tsx` |
| 16 | No `prefers-reduced-motion` guard | `atoms.tsx`, `SephoraPlaceholder.tsx` |
| 17 | Favicon 404 | `public/favicon.svg`, `index.html` |
