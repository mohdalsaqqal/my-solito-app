# ProductCard Cozy Hierarchy Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix inverted type hierarchy, remove dead whitespace, and tighten spacing in `ProductCard` so it reads cleanly at rail widths of 160–240px.

**Architecture:** Single file — `packages/ui/components/ProductCard.tsx`. All values from `@real/tokens`. No new files. No API changes. The `ProductCardSkeleton` sub-component (same file) is updated in the same pass to stay in sync with the real card's new padding.

**Tech Stack:** React Native, Solito v5, `@real/tokens`, UniWind className

**Design doc:** `docs/plans/2026-03-09-productcard-typography-spacing-design.md`

---

## Background for the implementer

The `ProductCard` has a content area below the image with this layout (top to bottom):
1. Brand name (12px, bold, uppercase, muted) — subordinate label
2. Product name (14px, muted) — **currently invisible due to muted tone**
3. Swatch color dots (12px circles)
4. Star rating
5. Price + strikethrough price
6. Urgency label / out-of-stock text

**Current problems:**
- Price uses `size='3xl'` which overrides to 30px — way too large for a rail card
- Name is `tone='muted'` — makes the hero element look like supporting text
- Brand is `weight='700'` — bold weight on a 12px subordinate label competes with name
- Three `minHeight` constraints create rigid dead whitespace
- Content padding is 8px — too tight at narrow widths
- Card `gap` (between image and content) is 16px — too loose for a cozy feel
- CTA button is flush to card edges (no margin) but the skeleton already has 8px margin — inconsistency

**Token reference** (these are the only values you'll need):
```ts
spacing.xs  = 4
spacing.sm  = 8
spacing.md  = 16
spacing['12'] = 12
```

The guard script at `scripts/guard-checks.sh` enforces no raw hex colors and no inline visual style bypasses. Run it after every change.

---

## Task 1: Fix typography — brand weight, name tone, price size, star size

**File:** `packages/ui/components/ProductCard.tsx`

**What to change and where:**

### Step 1: Brand name — change weight from '700' to '500'

Find this block (~line 615):
```tsx
<Text
  variant='label'
  tone='muted'
  weight='700'
  numberOfLines={1}
  style={{ textTransform: 'uppercase' }}
>
  {item.brand}
</Text>
```

Change `weight='700'` to `weight='500'`:
```tsx
<Text
  variant='label'
  tone='muted'
  weight='500'
  numberOfLines={1}
  style={{ textTransform: 'uppercase' }}
>
  {item.brand}
</Text>
```

### Step 2: Product name — change tone from 'muted' to 'default'

Find (~line 624):
```tsx
<Text variant='bodySm' tone='muted' numberOfLines={2}>
```

Change to:
```tsx
<Text variant='bodySm' tone='default' numberOfLines={2}>
```

### Step 3: Price — remove size='3xl' override

Find (~line 657):
```tsx
<Text variant='price' size='3xl' tone='default' weight='700'>
```

Change to:
```tsx
<Text variant='price' tone='default' weight='700'>
```

### Step 4: Star rating — change size from 12 to 11

Find (~line 652):
```tsx
<StarRating value={ratingValue} reviewCount={reviewCount} size={12} />
```

Change to:
```tsx
<StarRating value={ratingValue} reviewCount={reviewCount} size={11} />
```

### Step 5: Run guard checks

```bash
yarn guard:checks
```

Expected output ends with: `[guard] All checks passed`

If it fails, read the violation line and fix before continuing.

### Step 6: Commit

```bash
git add packages/ui/components/ProductCard.tsx
git commit -m "ui: fix type hierarchy — name tone, brand weight, price size, star size"
```

---

## Task 2: Fix spacing — card gap, content padding, remove minHeights

**File:** `packages/ui/components/ProductCard.tsx`

### Step 1: Card gap — 16px → 8px

Find the outer `<Card>` style object (~line 337). It currently has `gap: spacing.md`:
```tsx
<Card
  variant='flat'
  radiusKey='md'
  className="transition-[box-shadow,transform] duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
  style={{
    width,
    gap: spacing.md,
    padding: 0,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  }}
>
```

Change `gap: spacing.md` to `gap: spacing.sm`:
```tsx
<Card
  variant='flat'
  radiusKey='md'
  className="transition-[box-shadow,transform] duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
  style={{
    width,
    gap: spacing.sm,
    padding: 0,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  }}
>
```

### Step 2: Content outer box — remove minHeight, fix padding

Find the outer content `<Box>` (~line 604):
```tsx
<Box
  style={{
    minHeight: spacing['96'],
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingHorizontal: resolvedContentPadding,
    paddingBottom: resolvedContentPadding,
  }}
>
```

Replace with (remove `minHeight`, bump top padding to `sm`, bump horizontal/bottom padding to `spacing['12']`):
```tsx
<Box
  style={{
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing['12'],
    paddingBottom: spacing['12'],
  }}
>
```

### Step 3: Brand/name box — remove minHeight

Find (~line 614):
```tsx
<Box style={{ gap: spacing.xs, minHeight: spacing['64'] }}>
```

Change to:
```tsx
<Box style={{ gap: spacing.xs }}>
```

### Step 4: Price area box — remove minHeight, tighten gap

Find (~line 655):
```tsx
<Box style={{ gap: spacing.sm, minHeight: spacing['32'] }}>
```

Change to:
```tsx
<Box style={{ gap: spacing.xs }}>
```

### Step 5: Run guard checks

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

### Step 6: Commit

```bash
git add packages/ui/components/ProductCard.tsx
git commit -m "ui: cozy spacing — tighter card gap, 12px content padding, remove minHeight constraints"
```

---

## Task 3: Fix swatch dot size and CTA button margin

**File:** `packages/ui/components/ProductCard.tsx`

### Step 1: Swatch dots — 12px → 14px

Find the swatch dot `<Box>` inside the `resolvedSwatches.slice(0, 4).map(...)` block (~line 630):
```tsx
<Box
  key={swatch.id}
  style={{
    width: spacing['12'],
    height: spacing['12'],
    borderRadius: radius.full,
    backgroundColor: swatch.hex,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  }}
/>
```

Change `width` and `height` from `spacing['12']` (12px) to `14`:
```tsx
<Box
  key={swatch.id}
  style={{
    width: 14,
    height: 14,
    borderRadius: radius.full,
    backgroundColor: swatch.hex,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  }}
/>
```

Note: `width` and `height` are not flagged by the guard (it only checks margin/padding/fontSize/lineHeight/fontWeight/borderRadius/color).

### Step 2: CTA button (native) — add margin

Find the native CTA `<Touchable>` at the bottom of the card (~line 683):
```tsx
<Touchable
  onPress={handleAddToCart}
  disabled={addState === 'loading'}
  style={{
    minHeight: spacing['48'],
    paddingHorizontal: spacing['16'],
    backgroundColor: variant === 'flash' ? colors.primary : colors.black,
    borderWidth: borderWidth.thin,
    borderColor: variant === 'flash' ? colors.primary : colors.black,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  }}
  className="transition-[opacity,transform,background-color] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
>
```

Add `marginHorizontal: spacing.sm` and `marginBottom: spacing.sm`:
```tsx
<Touchable
  onPress={handleAddToCart}
  disabled={addState === 'loading'}
  style={{
    minHeight: spacing['48'],
    paddingHorizontal: spacing['16'],
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: variant === 'flash' ? colors.primary : colors.black,
    borderWidth: borderWidth.thin,
    borderColor: variant === 'flash' ? colors.primary : colors.black,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  }}
  className="transition-[opacity,transform,background-color] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
>
```

### Step 3: Guard check

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

If it fails on `margin` in a single-line style, ensure the style block is multi-line (one property per line) as shown above.

### Step 4: Commit

```bash
git add packages/ui/components/ProductCard.tsx
git commit -m "ui: swatch dots 14px, CTA button margin matches skeleton"
```

---

## Task 4: Sync skeleton padding

**File:** `packages/ui/components/ProductCard.tsx`

The `ProductCardSkeleton` sub-component (lines ~47–96) has a content `<Box>` with `padding: spacing.sm` and `paddingBottom: spacing.md`. These must match the real card's new padding values (`spacing['12']` horizontal/bottom, `spacing.sm` top).

### Step 1: Update skeleton content box

Find (~line 70):
```tsx
<Box
  style={{
    gap: spacing.sm,
    padding: spacing.sm,
    paddingBottom: spacing.md,
  }}
>
```

Change to (match real card: 12px padding, 8px top):
```tsx
<Box
  style={{
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing['12'],
    paddingBottom: spacing['12'],
  }}
>
```

### Step 2: Guard check

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

### Step 3: Commit

```bash
git add packages/ui/components/ProductCard.tsx
git commit -m "ui: sync skeleton padding with real card after cozy redesign"
```

---

## Final verification

After all 4 tasks and commits:

```bash
yarn guard:checks
```

Expected final output:
```
[guard] No className in packages/app
[guard] No inline style visual tokens bypass in shared packages
[guard] No process.env in shared packages
[guard] No tests in forbidden package locations
[guard] No direct adapter imports in app/ui/expo/next app layer (except BFF)
[guard] No provider imports inside packages/ui
[guard] No raw hex colors in shared packages
[guard] No direct adapter imports in BFF routes
[guard] No deprecated Solito props
[guard] No solito/router in App Router paths
[guard] No unsupported pseudo classes in shared/native code
[guard] No reanimated side-effect import in Next app entries/layouts
[guard] No new hardcoded user-facing strings
[guard] All checks passed
```

**Visual check (run `yarn web` and open the homepage product rail):**
- Brand name: small, medium-weight, muted caps — clearly subordinate
- Product name: same size but now dark/readable — the eye goes here first
- Price: ~20px bold — confident, not dominant
- Stars: compact 11px row
- Content area: 12px padding, feels comfortable at narrow widths
- CTA button (mobile): has 8px margin, not flush to card edge
