# The Atelier — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the REAL Cosmetics "Atelier" marketplace design — ink-shell campaign anchors, pure-white product surfaces, gold loyalty accent, crimson CTA, and mixed-weight campaign typography.

**Architecture:** Three layers changed in dependency order — (1) token values, (2) CSS bridge, (3) components. New components (FlashSaleBand, CampaignHeroBlock, CountdownTimer) are added to `packages/ui` and wired into `HomeV2Sections`. All AGENTS.md rules apply throughout.

**Tech Stack:** TypeScript tokens (`packages/tokens`), Tailwind v4 CSS bridge (`packages/ui/global.css`), React Native inline styles, moti (cross-platform animation, §20.1), `packages/ui` components only, no className in `packages/app`.

**Design spec:** `docs/plans/2026-03-10-the-atelier-design.md`

---

## Guard check command (run after every task)

```bash
cd "c:/Users/hamoo/Downloads/solito v5 docs/my-solito-app" && yarn guard:checks
```

Expected: all checks pass. Fix any failure before moving to the next task.

---

## Task 1: Add ink + gold tokens to colors.ts; update surfaces to pure white

**Files:**
- Modify: `packages/tokens/colors.ts`

### Step 1: Read the file

Open `packages/tokens/colors.ts` and note the existing token names so you don't duplicate.

### Step 2: Add ink family tokens

Add this block right after the `// Base surfaces` group, before `// Text`:

```ts
  // Ink family — prestige dark backgrounds (The Atelier)
  inkBlack: 'hsl(20 10% 8%)',      // ink section background (= existing colors.text)
  inkDeep: 'hsl(20 8% 13%)',       // card backgrounds inside ink sections
  inkMid: 'hsl(20 8% 20%)',        // dividers / borders inside ink sections
  inkFrost: 'hsl(30 8% 95%)',      // light text ON ink (warm off-white, not harsh)

  // Gold family — luxury / loyalty accent (The Atelier)
  goldPrimary: 'hsl(39 95% 43%)',  // gold text, loyalty badge fills, featured labels
  goldLight: 'hsl(42 100% 75%)',   // hover / active state of gold elements
  goldSubtle: 'hsl(42 60% 92%)',   // subtle gold tint on white backgrounds
```

### Step 3: Update background surface to pure white

Change these two existing lines:
```ts
// BEFORE:
  background: 'hsl(30 8% 99%)',
  backgroundSecondary: 'hsl(30 6% 97%)',
  surface: 'hsl(30 8% 99%)',
  surfaceMuted: 'hsl(30 6% 97%)',
```
```ts
// AFTER:
  background: 'hsl(0 0% 100%)',          // pure white — logo is black+white
  backgroundSecondary: 'hsl(0 0% 97%)',  // cool light gray foil
  surface: 'hsl(0 0% 100%)',
  surfaceMuted: 'hsl(0 0% 97%)',
```

### Step 4: Add semantic intent aliases

Add at the bottom of the `colors` object, before `} as const`:

```ts
  // Semantic intent aliases — use these for clarity at call sites
  salePrice: 'hsl(358 74% 50%)',      // = brandPrimary — explicit for PriceTag
  ctaBackground: 'hsl(358 74% 50%)',  // = brandPrimary — explicit for add-to-cart
  urgencyBadge: 'hsl(358 74% 50%)',   // = brandPrimary — explicit for flash-sale badges
```

### Step 5: Run guard:checks

```bash
yarn guard:checks
```

Expected: all checks pass. The new values are all HSL — no hex violations.

### Step 6: Commit

```bash
git add packages/tokens/colors.ts
git commit -m "tokens: add ink+gold families, pure white surfaces, intent aliases"
```

---

## Task 2: Add campaign typography tokens

**Files:**
- Modify: `packages/tokens/typography.ts`

### Step 1: Read the file

Open `packages/tokens/typography.ts`. Note:
- `fontWeights.black = '900'` already exists — do NOT add it again
- `letterSpacing.caps = 1` already exists — use it for all-caps nav
- New additions must not duplicate existing keys

### Step 2: Add campaign font-size tiers

In the `typography` object, add after the existing `hero: 48` line:

```ts
  // Campaign tiers — The Atelier mixed-weight contrast system
  campaign: 72,      // full-width hero headlines (home hero, campaign anchors)
  headline: 56,      // section-level ink-anchor headings
  subheadline: 18,   // offer descriptor line above/below campaign number
```

### Step 3: Add ultra font-weight

In the `fontWeights` object, add before `regular`:

```ts
  ultra: '100',      // ultra-thin descriptor text in campaign contrast pairs
```

### Step 4: Add campaign letter-spacing aliases

In the `letterSpacing` object, add after the existing entries:

```ts
  campaignHeading: -0.48,  // ≈ -0.03em at 16px — tight editorial for campaign headlines
  labelPill: 1.92,         // ≈ 0.12em at 16px — wide prestige caps for badge labels
```

Note: `letterSpacing.caps` (= 1, ≈ 0.06em) already covers all-caps nav labels — use that token for category nav.

### Step 5: Run guard:checks

```bash
yarn guard:checks
```

### Step 6: Commit

```bash
git add packages/tokens/typography.ts
git commit -m "tokens: add campaign font sizes, ultra weight, campaignHeading/labelPill letter-spacing"
```

---

## Task 3: Extend CSS token bridge in global.css

**Files:**
- Modify: `packages/ui/global.css`

### Step 1: Add ink + gold CSS custom properties

Inside the `@theme { }` block, after the existing `--color-primary-foreground` line, add:

```css
  /* Ink family — The Atelier prestige backgrounds */
  --color-ink-black:  hsl(20 10% 8%);
  --color-ink-deep:   hsl(20 8% 13%);
  --color-ink-mid:    hsl(20 8% 20%);
  --color-ink-frost:  hsl(30 8% 95%);

  /* Gold family — loyalty / exclusive accent */
  --color-gold:         hsl(39 95% 43%);
  --color-gold-light:   hsl(42 100% 75%);
  --color-gold-subtle:  hsl(42 60% 92%);
```

### Step 2: Update background CSS vars to match updated tokens

Change:
```css
  --color-background:           hsl(30 8% 99%);
  --color-background-secondary: hsl(30 6% 97%);
  --color-card:                 hsl(30 8% 99%);
  --color-muted:                hsl(30 6% 97%);
```
To:
```css
  --color-background:           hsl(0 0% 100%);
  --color-background-secondary: hsl(0 0% 97%);
  --color-card:                 hsl(0 0% 100%);
  --color-muted:                hsl(0 0% 97%);
```

### Step 3: Add campaign typography CSS vars

Inside `@theme { }`, after the existing `--text-4xl` line, add:

```css
  /* Campaign typography — The Atelier mixed-weight contrast */
  --text-campaign:    4.5rem;    /* 72px */
  --text-headline:    3.5rem;    /* 56px */
  --text-subheadline: 1.125rem;  /* 18px */

  /* Letter-spacing — campaign and label-pill */
  --tracking-campaign: -0.03em;
  --tracking-label:     0.12em;
```

### Step 4: Update dark mode background vars

In the `@variant dark { :root { } }` block, change:
```css
    --color-background:           hsl(20 10% 7%);
    --color-background-secondary: hsl(20 8% 10%);
    --color-card:                 hsl(20 8% 9%);
    --color-muted:                hsl(20 8% 13%);
```
(These stay warm-tinted in dark mode — correct, no change needed here. The ink tokens are independent of light/dark mode because ink sections are always dark by design.)

### Step 5: Run guard:checks

```bash
yarn guard:checks
```

Expected: all checks pass — no hex values, all HSL.

### Step 6: Commit

```bash
git add packages/ui/global.css
git commit -m "css: add ink/gold vars, pure white background, campaign typography vars"
```

---

## Task 4: Update HeaderMainRow — ink background + crimson cart button

**Files:**
- Modify: `packages/ui/components/chrome/HeaderMainRow.tsx`

### Step 1: Read the file

Open `packages/ui/components/chrome/HeaderMainRow.tsx` (342 lines). Study the `Action` component (~line 29) and the outer `<Box>` wrapper returned in the desktop branch (~line 211).

### Step 2: Import gold token

The existing import at line 1 already imports `colors`. No additional import needed — `colors.inkBlack`, `colors.inkFrost`, `colors.goldPrimary` will be available after Task 1.

### Step 3: Update the outer wrapper Box to ink background

Find the desktop return's outer `<Box>` (line 211):
```tsx
  return (
    <Box>
```

Replace with:
```tsx
  return (
    <Box style={{ backgroundColor: colors.inkBlack }}>
```

### Step 4: Update the mobile return's outer Container

Find the mobile branch outer `<Container>` (line 171). Wrap it:
```tsx
// BEFORE:
    return (
      <Container>
        <Box style={{ minHeight: layout.header.mainRowHeight, flexDirection: 'row', ...
```
```tsx
// AFTER:
    return (
      <Box style={{ backgroundColor: colors.inkBlack }}>
      <Container>
        <Box style={{ minHeight: layout.header.mainRowHeight, flexDirection: 'row', ...
```
And close the extra `<Box>` after `</Container>` (add `</Box>` after `</Container>`).

### Step 5: Update logo text tone to inkFrost

In the desktop branch, find the logo `<Text>` (~line 231):
```tsx
              <Text variant='h2' weight='700' numberOfLines={1} style={{ letterSpacing: letterSpacing.wide }}>
```
Replace with:
```tsx
              <Text variant='h2' weight='700' numberOfLines={1} style={{ letterSpacing: letterSpacing.wide, color: colors.inkFrost }}>
```

### Step 6: Update search input for ink context

Find both search `<Input>` components (mobile ~line 192, desktop ~line 248). Change their background and border:

Mobile input:
```tsx
// BEFORE:
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceMuted,
```
```tsx
// AFTER:
                  borderColor: colors.inkMid,
                  backgroundColor: colors.inkDeep,
                  color: colors.inkFrost,
```

Desktop input:
```tsx
// BEFORE:
                  borderColor: colors.border,
                  borderWidth: borderWidth.thin,
                  backgroundColor: colors.surface,
```
```tsx
// AFTER:
                  borderColor: colors.inkMid,
                  borderWidth: borderWidth.thin,
                  backgroundColor: colors.inkDeep,
                  color: colors.inkFrost,
```

Also update the search icon color to inkFrost in both branches. Find `<Icon name='search' color={colors.textSecondary} />` (appears twice) and change to `color={colors.inkFrost}`.

### Step 7: Update Action icon colors for ink background

In the `Action` component (~line 66), change:
```tsx
// BEFORE:
              backgroundColor: active || emphasized ? colors.brandPrimarySubtle : colors.surface,
```
```tsx
// AFTER:
              backgroundColor: active ? colors.inkDeep : emphasized ? colors.brandPrimary : colors.inkBlack,
```

Change the icon color:
```tsx
// BEFORE:
              color={active ? colors.brandPrimary : colors.textPrimary}
```
```tsx
// AFTER:
              color={active ? colors.goldPrimary : colors.inkFrost}
```

For the `emphasized` (cart) action — make it a crimson pill. Add a special case in `Action`. Find where `emphasized` is used to change background:

After the existing `backgroundColor` logic for the icon box, add a special cart button style. The cart is called with `emphasized={true}`. Change the whole `<Box>` containing the icon for emphasized:

```tsx
            <Box
              style={{
                position: 'relative',
                minHeight: emphasized ? spacing['40'] : spacing['32'],
                minWidth: emphasized ? spacing['40'] : spacing['32'],
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: emphasized ? radius.full : radius.md,
                backgroundColor: emphasized
                  ? colors.brandPrimary                           // crimson pill
                  : active ? colors.inkDeep : colors.inkBlack,
                transitionProperty: 'background-color,transform',
                transitionDuration: `${motionDuration.microInteraction}ms`,
                transform: [{ translateY: active ? -1 : 0 }],
                ...(!emphasized ? shadows.xs : {}),
              }}
            >
              <Icon
                name={iconName}
                size={spacing['24']}
                color={emphasized ? colors.textInverted : (active ? colors.goldPrimary : colors.inkFrost)}
              />
```

### Step 8: Update locale icon

Find the locale `Touchable` (~line 295). Change its icon box background and icon color:
```tsx
// BEFORE:
                      backgroundColor: hovered || focused ? colors.brandPrimarySubtle : colors.surface,
// and icon:
                    color={hovered || focused ? colors.brandPrimary : colors.textPrimary}
```
```tsx
// AFTER:
                      backgroundColor: hovered || focused ? colors.inkDeep : colors.inkBlack,
// and icon:
                    color={hovered || focused ? colors.goldPrimary : colors.inkFrost}
```

### Step 9: Run guard:checks

```bash
yarn guard:checks
```

### Step 10: Commit

```bash
git add packages/ui/components/chrome/HeaderMainRow.tsx
git commit -m "ui: HeaderMainRow — ink background, inkFrost icons, crimson cart pill, gold hover"
```

---

## Task 5: Create CountdownTimer component

**Files:**
- Create: `packages/ui/components/home-v2/CountdownTimer.tsx`

### Step 1: Write CountdownTimer

```tsx
import { useEffect, useRef, useState } from 'react'
import { colors, fontWeights, spacing, typography } from '@real/tokens'
import { MotiView } from 'moti'
import { Box, Text } from '../../primitives'

type CountdownTimerProps = {
  /** ISO 8601 target date-time string, e.g. "2026-03-11T23:59:59Z" */
  targetIso: string
  /** Show loading state */
  loading?: boolean
}

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0')
}

function getRemaining(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { h, m, s, expired: diff === 0 }
}

function DigitPair({ value, label }: { value: string; label: string }) {
  return (
    <Box style={{ alignItems: 'center', gap: spacing['1'] }}>
      <MotiView
        key={value}
        from={{ opacity: 0, translateY: -4 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 200 }}
      >
        <Text
          style={{
            fontFamily: 'Space Grotesk',
            fontSize: typography.headline,
            fontWeight: fontWeights.black,
            color: colors.goldPrimary,
            lineHeight: typography.headline * 1.1,
            letterSpacing: -1,
          }}
        >
          {value}
        </Text>
      </MotiView>
      <Text
        style={{
          fontSize: typography.caption,
          fontWeight: fontWeights.ultra,
          color: colors.inkFrost,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </Box>
  )
}

function Separator() {
  return (
    <Text
      style={{
        fontSize: typography.headline,
        fontWeight: fontWeights.black,
        color: colors.inkFrost,
        opacity: 0.4,
        alignSelf: 'flex-start',
        lineHeight: typography.headline * 1.1,
      }}
    >
      :
    </Text>
  )
}

export function CountdownTimer({ targetIso, loading = false }: CountdownTimerProps) {
  const targetMs = useRef(new Date(targetIso).getTime())
  const [time, setTime] = useState(() => getRemaining(targetMs.current))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    targetMs.current = new Date(targetIso).getTime()
    setTime(getRemaining(targetMs.current))
  }, [targetIso])

  useEffect(() => {
    if (time.expired) return
    intervalRef.current = setInterval(() => {
      setTime(getRemaining(targetMs.current))
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [time.expired])

  if (loading) {
    return (
      <Box style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing['8'] }}>
        {['--', '--', '--'].map((_, i) => (
          <Box key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing['8'] }}>
            <Box
              style={{
                width: 52,
                height: 56,
                borderRadius: 4,
                backgroundColor: colors.inkMid,
              }}
            />
            {i < 2 ? <Separator /> : null}
          </Box>
        ))}
      </Box>
    )
  }

  if (time.expired) {
    return null
  }

  return (
    <Box style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing['8'] }}>
      <DigitPair value={pad(time.h)} label="hrs" />
      <Separator />
      <DigitPair value={pad(time.m)} label="min" />
      <Separator />
      <DigitPair value={pad(time.s)} label="sec" />
    </Box>
  )
}
```

Note on `fontWeights.ultra`: This was added in Task 2. If the token isn't available yet, define a local fallback constant `const ULTRA = '100' as const` and use it — then remove the fallback once Task 2 is confirmed committed.

### Step 2: Run guard:checks

```bash
yarn guard:checks
```

Expected: passes. The component uses only token values — no hex colors, no hardcoded spacing.

### Step 3: Commit

```bash
git add packages/ui/components/home-v2/CountdownTimer.tsx
git commit -m "ui: add CountdownTimer — gold moti digit flip, cleanup on unmount"
```

---

## Task 6: Create FlashSaleBand component

**Files:**
- Create: `packages/ui/components/home-v2/FlashSaleBand.tsx`

### Step 1: Write FlashSaleBand

```tsx
import { colors, fontWeights, radius, spacing, typography } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'
import { CountdownTimer } from './CountdownTimer'

type FlashSaleBandProps = {
  /** Short offer text, e.g. "40% OFF" */
  offerText: string
  /** Descriptor above the number, e.g. "up to" */
  preLabel: string
  /** Descriptor below the number, e.g. "bestselling skincare" */
  postLabel: string
  /** ISO target for countdown — hides timer when undefined */
  endsAtIso?: string
  /** CTA label */
  ctaLabel?: string
  onPressCtA?: () => void
  loading?: boolean
  disabled?: boolean
}

export function FlashSaleBand({
  offerText,
  preLabel,
  postLabel,
  endsAtIso,
  ctaLabel = 'Shop Now',
  onPressCtA,
  loading = false,
  disabled = false,
}: FlashSaleBandProps) {
  return (
    <Box
      style={{
        backgroundColor: colors.brandPrimary,
        paddingVertical: spacing['24'],
        paddingHorizontal: spacing['16'],
        alignItems: 'center',
        gap: spacing['12'],
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Offer headline — mixed-weight contrast */}
      <Box style={{ alignItems: 'center', gap: spacing['1'] }}>
        <Text
          style={{
            fontSize: typography.subheadline,
            fontWeight: fontWeights.ultra,
            color: colors.textInverted,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {preLabel}
        </Text>
        <Text
          style={{
            fontSize: typography.headline,
            fontWeight: fontWeights.black,
            color: colors.textInverted,
            letterSpacing: -1,
            lineHeight: typography.headline * 1.05,
          }}
        >
          {offerText}
        </Text>
        <Text
          style={{
            fontSize: typography.body,
            fontWeight: fontWeights.regular,
            color: colors.textInverted,
            opacity: 0.85,
          }}
        >
          {postLabel}
        </Text>
      </Box>

      {/* Countdown */}
      {endsAtIso ? (
        <CountdownTimer targetIso={endsAtIso} loading={loading} />
      ) : null}

      {/* CTA */}
      {onPressCtA ? (
        <Touchable
          onPress={disabled ? undefined : onPressCtA}
          accessibilityRole='button'
          accessibilityLabel={ctaLabel}
          accessibilityState={{ disabled }}
          style={{
            backgroundColor: colors.inkBlack,
            borderRadius: radius.full,
            paddingVertical: spacing['12'],
            paddingHorizontal: spacing['24'],
          }}
        >
          {() => (
            <Text
              style={{
                fontSize: typography.label,
                fontWeight: fontWeights.semibold,
                color: colors.inkFrost,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              {ctaLabel}
            </Text>
          )}
        </Touchable>
      ) : null}
    </Box>
  )
}
```

### Step 2: Check token references

Make sure `typography.body`, `typography.label`, `typography.subheadline`, `typography.headline` all exist in the updated `packages/tokens/typography.ts` from Task 2. `typography.body = 16` was there before Task 2. `typography.subheadline`, `typography.headline` are added in Task 2.

### Step 3: Run guard:checks

```bash
yarn guard:checks
```

### Step 4: Commit

```bash
git add packages/ui/components/home-v2/FlashSaleBand.tsx
git commit -m "ui: add FlashSaleBand — crimson band, mixed-weight offer, countdown, ink CTA"
```

---

## Task 7: Create CampaignHeroBlock component

**Files:**
- Create: `packages/ui/components/home-v2/CampaignHeroBlock.tsx`

This is the reusable ink-background editorial section (used as campaign anchor 2/3/4/5). Accepts a background image, headline, descriptor, and CTA.

### Step 1: Write CampaignHeroBlock

```tsx
import { ImageBackground, Platform, useWindowDimensions } from 'react-native'
import { borderWidth, colors, fontWeights, radius, spacing, typography } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'

type CampaignHeroBlockProps = {
  /** Campaign headline — rendered in campaign/headline size + black weight */
  headline: string
  /** Small descriptor above the headline — ultra-thin weight */
  preHeadline?: string
  /** Descriptor below headline — regular weight, muted */
  subline?: string
  /** Badge label (e.g. "New Arrivals", "Exclusive") — gold pill */
  badgeLabel?: string
  /** CTA button label */
  ctaLabel?: string
  /** Background image URL */
  imageUrl?: string
  /** Whether text+CTA sit on left (default) or center */
  align?: 'left' | 'center'
  onPress?: () => void
  loading?: boolean
  disabled?: boolean
}

export function CampaignHeroBlock({
  headline,
  preHeadline,
  subline,
  badgeLabel,
  ctaLabel,
  imageUrl,
  align = 'left',
  onPress,
  loading = false,
  disabled = false,
}: CampaignHeroBlockProps) {
  const { width } = useWindowDimensions()
  const isDesktop = Platform.OS === 'web' && width >= 1024
  const blockHeight = isDesktop ? 480 : 340

  const contentAlign = align === 'center' ? 'center' : 'flex-start'

  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: colors.inkDeep,
          height: blockHeight,
          alignItems: contentAlign,
          justifyContent: 'flex-end',
          paddingHorizontal: spacing['24'],
          paddingBottom: spacing['32'],
          gap: spacing['12'],
        }}
      >
        {/* Skeleton bars */}
        <Box style={{ width: 80, height: 24, borderRadius: radius.full, backgroundColor: colors.inkMid }} />
        <Box style={{ width: '75%', height: 40, borderRadius: radius.sm, backgroundColor: colors.inkMid }} />
        <Box style={{ width: '50%', height: 16, borderRadius: radius.sm, backgroundColor: colors.inkMid }} />
        <Box style={{ width: 120, height: 40, borderRadius: radius.full, backgroundColor: colors.inkMid, marginTop: spacing['8'] }} />
      </Box>
    )
  }

  const content = (
    <Box
      style={{
        flex: 1,
        height: blockHeight,
        backgroundColor: imageUrl ? undefined : colors.inkBlack,
        alignItems: contentAlign,
        justifyContent: 'flex-end',
        paddingHorizontal: spacing['24'],
        paddingBottom: spacing['32'],
        gap: spacing['8'],
      }}
    >
      {/* Dark scrim — always present so text reads on any photo */}
      {imageUrl ? (
        <Box
          pointerEvents='none'
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(16, 12, 8, 0.52)',
          }}
        />
      ) : null}

      {/* Gold badge pill */}
      {badgeLabel ? (
        <Box
          style={{
            alignSelf: contentAlign === 'center' ? 'center' : 'flex-start',
            backgroundColor: colors.goldPrimary,
            borderRadius: radius.full,
            paddingVertical: spacing['4'],
            paddingHorizontal: spacing['12'],
            marginBottom: spacing['4'],
          }}
        >
          <Text
            style={{
              fontSize: typography.caption,
              fontWeight: fontWeights.semibold,
              color: colors.inkBlack,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            {badgeLabel}
          </Text>
        </Box>
      ) : null}

      {/* Pre-headline descriptor */}
      {preHeadline ? (
        <Text
          style={{
            fontSize: typography.subheadline,
            fontWeight: fontWeights.ultra,
            color: colors.inkFrost,
            opacity: 0.75,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            textAlign: align,
          }}
        >
          {preHeadline}
        </Text>
      ) : null}

      {/* Main headline — campaign or headline size */}
      <Text
        style={{
          fontSize: headline.length > 20 ? typography.headline : typography.campaign,
          fontWeight: fontWeights.black,
          color: colors.textInverted,
          letterSpacing: -1,
          lineHeight: (headline.length > 20 ? typography.headline : typography.campaign) * 1.05,
          textAlign: align,
        }}
      >
        {headline}
      </Text>

      {/* Subline */}
      {subline ? (
        <Text
          style={{
            fontSize: typography.body,
            fontWeight: fontWeights.regular,
            color: colors.inkFrost,
            opacity: 0.8,
            textAlign: align,
            marginBottom: spacing['4'],
          }}
        >
          {subline}
        </Text>
      ) : null}

      {/* CTA button */}
      {ctaLabel && onPress ? (
        <Touchable
          onPress={disabled ? undefined : onPress}
          accessibilityRole='button'
          accessibilityLabel={ctaLabel}
          accessibilityState={{ disabled }}
          style={{
            alignSelf: contentAlign === 'center' ? 'center' : 'flex-start',
            backgroundColor: colors.brandPrimary,
            borderRadius: radius.full,
            paddingVertical: spacing['12'],
            paddingHorizontal: spacing['24'],
            marginTop: spacing['8'],
            borderWidth: borderWidth.thin,
            borderColor: colors.brandPrimary,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {() => (
            <Text
              style={{
                fontSize: typography.label,
                fontWeight: fontWeights.semibold,
                color: colors.textInverted,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              {ctaLabel}
            </Text>
          )}
        </Touchable>
      ) : null}
    </Box>
  )

  if (imageUrl) {
    return (
      <ImageBackground
        source={{ uri: imageUrl }}
        style={{ height: blockHeight }}
        resizeMode='cover'
        accessibilityIgnoresInvertColors
      >
        {content}
      </ImageBackground>
    )
  }

  return content
}
```

### Step 2: Run guard:checks

```bash
yarn guard:checks
```

### Step 3: Commit

```bash
git add packages/ui/components/home-v2/CampaignHeroBlock.tsx
git commit -m "ui: add CampaignHeroBlock — ink editorial section, gold badge, crimson CTA, photo scrim"
```

---

## Task 8: Export new components + wire into HomeV2Sections

**Files:**
- Modify: `packages/ui/components/home-v2/index.ts`
- Modify: `packages/app/sections/home/HomeV2Sections.tsx`

### Step 1: Export from home-v2/index.ts

Add three new lines to `packages/ui/components/home-v2/index.ts`:

```ts
export * from './CountdownTimer'
export * from './FlashSaleBand'
export * from './CampaignHeroBlock'
```

### Step 2: Read HomeV2Sections.tsx

Open `packages/app/sections/home/HomeV2Sections.tsx`. Study the existing import block and props type.

### Step 3: Add new props to HomeV2SectionsProps

In `HomeV2SectionsProps`, add these optional fields:

```ts
  // The Atelier — ink anchors and flash sale
  flashSale?: {
    offerText: string
    preLabel: string
    postLabel: string
    endsAtIso?: string
    ctaLabel?: string
  } | null
  campaignAnchor2?: {
    headline: string
    preHeadline?: string
    subline?: string
    badgeLabel?: string
    ctaLabel?: string
    imageUrl?: string
    href?: string
  } | null
```

### Step 4: Add imports

In the import from `'@real/ui/components'`, add `FlashSaleBand` and `CampaignHeroBlock`:

```ts
import {
  AnnouncementTicker,
  BestItemsMonthRail,
  BrandSpotlightSection,
  BrandStoryBanner,
  BundlePromotionsRail,
  CampaignHeroBlock,
  FeaturedCampaignSlot,
  FlashSaleBand,
  HeroCampaignSlider,
  NewsletterLoyaltyCta,
  RevealOnScroll,
  TopBrandsGrid,
  UgcGallery,
} from '@real/ui/components'
```

### Step 5: Add props to the function signature

```tsx
export function HomeV2Sections({
  // ... existing props ...
  flashSale = null,
  campaignAnchor2 = null,
  // ...
}: HomeV2SectionsProps) {
```

### Step 6: Insert new sections into the JSX

After the `AnnouncementTicker` RevealOnScroll block and before the first `renderRail` call, insert:

```tsx
      {/* Flash sale band — crimson urgency band with countdown */}
      {flashSale ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 2}>
          <FlashSaleBand
            offerText={flashSale.offerText}
            preLabel={flashSale.preLabel}
            postLabel={flashSale.postLabel}
            endsAtIso={flashSale.endsAtIso}
            ctaLabel={flashSale.ctaLabel}
            loading={loading}
          />
        </RevealOnScroll>
      ) : null}
```

After the first `renderRail` (bestSellers) block, insert the campaign anchor 2:

```tsx
      {/* Campaign anchor 2 — ink editorial section */}
      {campaignAnchor2 ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 4}>
          <CampaignHeroBlock
            headline={campaignAnchor2.headline}
            preHeadline={campaignAnchor2.preHeadline}
            subline={campaignAnchor2.subline}
            badgeLabel={campaignAnchor2.badgeLabel}
            ctaLabel={campaignAnchor2.ctaLabel}
            imageUrl={campaignAnchor2.imageUrl}
            loading={loading}
            onPress={campaignAnchor2.href ? () => onNavigate?.(campaignAnchor2.href!) : undefined}
          />
        </RevealOnScroll>
      ) : null}
```

### Step 7: Run guard:checks

```bash
yarn guard:checks
```

Pay attention to check 8 (no className in packages/app). `HomeV2Sections` is in `packages/app` — make sure the new code you added uses zero `className` props.

### Step 8: Commit

```bash
git add packages/ui/components/home-v2/index.ts packages/app/sections/home/HomeV2Sections.tsx
git commit -m "ui+app: export FlashSaleBand/CampaignHeroBlock; wire flashSale + campaignAnchor2 into HomeV2Sections"
```

---

## Task 9: Final guard:checks + verification

### Step 1: Run full guard suite

```bash
yarn guard:checks
```

Expected output: all 11 checks pass.

If any check fails:
- **Check 3 (no hex in packages/ui):** Find the hex with `grep -r '#[0-9a-fA-F]' packages/ui/components/home-v2/` and replace with the correct token reference.
- **Check 8 (no className in packages/app):** Find any accidental className with `grep -r 'className' packages/app/` and remove.
- **Check 1/2 (token guard):** Any `hsl(...)` literal in a component file must come from `@real/tokens` — import and use the token instead.

### Step 2: Run web dev server and visually verify

```bash
yarn web
```

Open the home page and check:
- Header background is ink (dark), not white
- Cart icon is a crimson pill shape
- Other icons are inkFrost (warm off-white)
- Search input is dark (inkDeep background)
- If FlashSaleBand or CampaignHeroBlock props are passed, they render with correct colors
- Token color changes: background is now pure white (not cream-tinted)

### Step 3: Commit (if any guard fixes were needed)

```bash
git add -p
git commit -m "fix: guard check cleanup after Atelier phase 1"
```

---

## Implementation Notes

### AGENTS.md compliance checklist per component

| Rule | What to check |
|------|--------------|
| §1.1 | Every color/spacing/radius/font value imported from `@real/tokens` — no literals |
| §9 states | loading ✓, disabled ✓, empty handled (null return or skeleton) |
| §17 RTL | No `paddingLeft`/`paddingRight`/`marginLeft`/`marginRight` — use `paddingHorizontal`/`Start`/`End` |
| §20.1 | `MotiView` used in CountdownTimer — no direct `Animated` API |
| §21 | `yarn guard:checks` passes — no hex colors |
| §25.3 | Radii: `radius.sm` (2px) or `radius.md` (4px) for boxes; `radius.full` only for pills/badges |

### Token names to use (summary)

| Need | Token | Value after Task 1 |
|------|-------|--------------------|
| Ink section bg | `colors.inkBlack` | `hsl(20 10% 8%)` |
| Ink card bg | `colors.inkDeep` | `hsl(20 8% 13%)` |
| Ink divider | `colors.inkMid` | `hsl(20 8% 20%)` |
| Text on ink | `colors.inkFrost` | `hsl(30 8% 95%)` |
| Gold accent | `colors.goldPrimary` | `hsl(39 95% 43%)` |
| Crimson CTA | `colors.brandPrimary` | `hsl(358 74% 50%)` |
| White surfaces | `colors.background` | `hsl(0 0% 100%)` |
| Campaign headline | `typography.campaign` | `72` |
| Section headline | `typography.headline` | `56` |
| Ultra weight | `fontWeights.ultra` | `'100'` |
| Heavy weight | `fontWeights.black` | `'900'` |
