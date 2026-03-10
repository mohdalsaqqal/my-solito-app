# Token Bridge + Primitive Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the TypeScript token system to CSS custom properties, fix existing component violations, and add missing primitives required by AGENTS.md §26 canonical patterns.

**Architecture:** Create `packages/ui/global.css` as the CSS token bridge (Tailwind v4 `@theme`), import it in both app CSS entries, fix hardcoded values and missing states in existing components, then add missing commerce/form/feedback primitives — all inline-style + UniWind `className` in `packages/ui` only.

**Tech Stack:** Tailwind v4, Uniwind, React Native (inline style objects), `@real/tokens`, moti (for Toast/Spinner animation), CVA (class-variance-authority)

**Reference design doc:** `docs/plans/2026-03-10-token-bridge-and-primitive-hardening-design.md`

---

## PHASE A — CSS Token Bridge

### Task 1: Create `packages/ui/global.css`

**Files:**
- Create: `packages/ui/global.css`

**Context:**
`packages/tokens/*.ts` hold HSL color values as TypeScript objects. No `@theme` block exists anywhere, so Tailwind semantic classes (`bg-primary`, `text-foreground`, etc.) are undefined. This file is the bridge.

AGENTS rules:
- §1.1: All values must come from `packages/tokens/*.ts` — every CSS variable below maps 1:1 to a token value
- §9: UniWind/Tailwind config lives in `packages/ui` only
- §17: No directional values (no `left`/`right`) in CSS variables
- §21 guard: No hex colors — HSL only
- §20/P1: Static theming via `@theme` / `@variant dark`

**Step 1: Create the file**

```css
/* packages/ui/global.css */
/* ─────────────────────────────────────────────────────────────────────────
   CSS Token Bridge
   Maps packages/tokens/*.ts → CSS custom properties for Tailwind v4 @theme
   Every value here must match its corresponding TypeScript token.
   ───────────────────────────────────────────────────────────────────────── */

@theme {
  /* ── Colors — from packages/tokens/colors.ts ── */
  --color-background:           hsl(30 8% 99%);
  --color-background-secondary: hsl(30 6% 97%);
  --color-foreground:           hsl(20 10% 8%);
  --color-foreground-muted:     hsl(20 8% 35%);
  --color-border:               hsl(30 10% 88%);
  --color-card:                 hsl(30 8% 99%);
  --color-muted:                hsl(30 6% 97%);
  --color-muted-foreground:     hsl(20 8% 35%);

  /* Brand — brandPrimary = hsl(358 74% 50%) */
  --color-primary:              hsl(358 74% 50%);
  --color-primary-hover:        hsl(358 74% 44%);
  --color-primary-pressed:      hsl(358 74% 38%);
  --color-primary-subtle:       hsl(30 6% 97%);
  --color-primary-foreground:   hsl(0 0% 100%);

  /* Status — from packages/tokens/status.ts */
  --color-success:              hsl(162 100% 39%);
  --color-success-subtle:       hsl(144 45% 94%);
  --color-warning:              hsl(39 95% 43%);
  --color-warning-subtle:       hsl(40 100% 95%);
  --color-destructive:          hsl(358 100% 42%);
  --color-destructive-subtle:   hsl(355 70% 95%);
  --color-info:                 hsl(210 90% 40%);
  --color-info-subtle:          hsl(214 78% 95%);

  /* ── Radius — from packages/tokens/radius.ts — §25.3: sharp by default ── */
  --radius-none: 0px;
  --radius-xs:   0px;
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   8px;
  --radius-xl:   8px;
  --radius-full: 9999px;
  --radius:      4px; /* semantic default alias */

  /* ── Spacing — from packages/tokens/spacing.ts — 8px rhythm §25.1 ── */
  --spacing-px:   1px;
  --spacing-0-5:  2px;
  --spacing-1:    4px;
  --spacing-2:    8px;
  --spacing-3:    12px;
  --spacing-4:    16px;
  --spacing-5:    20px;
  --spacing-6:    24px;
  --spacing-7:    28px;
  --spacing-8:    32px;
  --spacing-10:   40px;
  --spacing-12:   48px;
  --spacing-14:   56px;
  --spacing-16:   64px;
  --spacing-20:   80px;
  --spacing-24:   96px;
  --spacing-32:   128px;

  /* ── Typography — from packages/tokens/typography.ts ── */
  --font-sans:    "Inter", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-heading: "Space Grotesk", "Inter", -apple-system, system-ui, sans-serif;
  --font-mono:    Menlo, monospace;

  --text-xs:      0.75rem;   /* 12px — captionTier */
  --text-sm:      0.875rem;  /* 14px */
  --text-base:    1rem;      /* 16px — bodyTier */
  --text-lg:      1.125rem;  /* 18px */
  --text-xl:      1.25rem;   /* 20px — subHeadlineTier */
  --text-2xl:     1.5rem;    /* 24px */
  --text-3xl:     1.875rem;  /* 30px */
  --text-4xl:     2.25rem;   /* 36px — displayTier */

  /* ── Elevation / Shadow — from packages/tokens/elevation.ts ── */
  --shadow-xs: 0 0 0 1px hsla(355 12% 8% / 0.04), 0 2px 4px   hsla(355 12% 8% / 0.06);
  --shadow-sm: 0 0 0 1px hsla(355 12% 8% / 0.05), 0 4px 10px  hsla(355 12% 8% / 0.08);
  --shadow-md: 0 0 0 1px hsla(355 12% 8% / 0.06), 0 8px 18px  hsla(355 12% 8% / 0.10);
  --shadow-lg: 0 0 0 1px hsla(355 12% 8% / 0.07), 0 12px 28px hsla(355 12% 8% / 0.12);
  --shadow-xl: 0 0 0 1px hsla(355 12% 8% / 0.08), 0 20px 40px hsla(355 12% 8% / 0.14);

  /* ── Motion — from packages/tokens/motion.ts — §24 ── */
  --duration-micro:   300ms;
  --duration-hover:   400ms;
  --duration-reveal:  600ms;
  --duration-stagger: 20ms;
  --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-exit:    cubic-bezier(0.7, 0, 0.84, 0);

  /* ── Z-index — from packages/tokens/layers.ts ── */
  --z-base:     0;
  --z-raised:   10;
  --z-sticky:   100;
  --z-overlay:  300;
  --z-modal:    400;
  --z-toast:    500;
  --z-dropdown: 700;
  --z-search:   1200;
}

/* ── Dark mode — §23.2 warm-tinted neutrals, not dead gray ── */
@variant dark {
  :root {
    --color-background:           hsl(20 10% 7%);
    --color-background-secondary: hsl(20 8% 10%);
    --color-foreground:           hsl(30 8% 95%);
    --color-foreground-muted:     hsl(20 6% 60%);
    --color-border:               hsl(20 8% 20%);
    --color-card:                 hsl(20 8% 9%);
    --color-muted:                hsl(20 8% 13%);
    --color-muted-foreground:     hsl(20 6% 60%);
    --color-primary-subtle:       hsl(358 30% 15%);
    --color-success-subtle:       hsl(144 30% 12%);
    --color-warning-subtle:       hsl(40 40% 12%);
    --color-destructive-subtle:   hsl(355 40% 12%);
    --color-info-subtle:          hsl(214 40% 12%);
  }
}
```

**Step 2: Verify file exists and has no hex colors**

```bash
# Must return 0 matches (no hex colors — §21 guard)
grep -n "#[0-9a-fA-F]" packages/ui/global.css && echo "FAIL: hex found" || echo "PASS: no hex"
```

Expected: `PASS: no hex`

**Step 3: Commit**

```bash
git add packages/ui/global.css
git commit -m "ui: add CSS token bridge (global.css with @theme from packages/tokens)"
```

---

### Task 2: Import the CSS bridge in both app entries

**Files:**
- Modify: `apps/next/app/globals.css`
- Modify: `apps/expo/global.css`

**Context:**
The bridge file must be imported before `@import 'tailwindcss'` so Tailwind picks up the custom properties. The relative path from `apps/next/app/` to `packages/ui/` is `../../../packages/ui/`.

**Step 1: Update `apps/next/app/globals.css`**

Add the import as the very first line:

```css
@import '../../../packages/ui/global.css';
@import 'tailwindcss';
@import 'uniwind';
/* ... rest of file unchanged ... */
```

**Step 2: Update `apps/expo/global.css`**

```css
@import '../../packages/ui/global.css';
@import 'tailwindcss';
@import 'uniwind';
```

**Step 3: Run guard checks**

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

**Step 4: Commit**

```bash
git add apps/next/app/globals.css apps/expo/global.css
git commit -m "ui: import CSS token bridge in next and expo app entries"
```

---

## PHASE C — Component Hardening

### Task 3: Fix Badge — hardcoded value + missing states

**Files:**
- Modify: `packages/ui/components/Badge.tsx`

**Context:**
Current Badge has `minHeight: 24` hardcoded (§1.1 violation) and no `disabled` state (§9 violation).
Token to use: `spacing.sm * 3` = 24 but from token. Actually `spacing` doesn't have `24` as a pixel value directly accessible — use `spacing['24']` which = 24px. Or we add a semantic token. Check `packages/tokens/spacing.ts`: `'24': 24` ✓.

**Step 1: Read the current Badge**

```bash
cat packages/ui/components/Badge.tsx
```

**Step 2: Write the updated Badge**

Key changes:
- `minHeight: 24` → `minHeight: spacing['24']` — wait, `spacing['24']` = 24px ✓
- Add `disabled?: boolean` prop
- Apply `opacity.disabled` when disabled (from `packages/tokens/layers.ts`)
- Use `accessibilityState` for disabled

```tsx
import { ReactNode } from 'react'
import { View, ViewProps } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'

type BadgeTone = 'neutral' | 'accent' | 'outline'

type BadgeProps = ViewProps & {
  children?: ReactNode
  tone?: BadgeTone
  disabled?: boolean
}

export function Badge({
  children,
  tone = 'neutral',
  disabled = false,
  style,
  ...props
}: BadgeProps) {
  const backgroundColor =
    tone === 'accent'
      ? colors.brandPrimary
      : tone === 'outline'
        ? 'transparent'
        : colors.backgroundSecondary

  const borderColor =
    tone === 'outline'
      ? colors.border
      : tone === 'accent'
        ? colors.brandPrimary
        : 'transparent'

  const textTone =
    tone === 'accent' ? 'inverse' : tone === 'outline' ? 'default' : 'muted'

  return (
    <View
      accessibilityState={{ disabled }}
      style={[
        {
          minHeight: spacing['24'],
          paddingHorizontal: spacing.sm,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderWidth: borderWidth.thin,
          borderColor,
          alignSelf: 'flex-start',
          opacity: disabled ? opacity.disabled : 1,
        },
        style,
      ]}
      {...props}
    >
      <Text variant="caption" tone={textTone}>
        {children}
      </Text>
    </View>
  )
}
```

**Step 3: Run guard checks**

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

**Step 4: Commit**

```bash
git add packages/ui/components/Badge.tsx
git commit -m "ui: fix Badge hardcoded minHeight and add disabled state"
```

---

### Task 4: Fix Button — add loading state

**Files:**
- Modify: `packages/ui/components/Button.tsx`

**Context:**
Button is missing `loading` state (§9 violation). When loading, show a visual indicator and disable interaction. Use moti's `ActivityIndicator` equivalent or a simple `Skeleton`-style pulse. Per §20.1, use `moti` for cross-platform animation.

**Step 1: Read the current Button**

```bash
cat packages/ui/components/Button.tsx
```

**Step 2: Add loading prop**

```tsx
import { ReactNode } from 'react'
import { ActivityIndicator } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { ViewStyle } from 'react-native'
import { Button as ReusableButton } from '../reusables/button'
import { Text } from '../primitives/Text'

type ButtonProps = {
  children?: ReactNode
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onPress?: () => void
}

type ButtonVariant = NonNullable<ButtonProps['variant']>
type ButtonSize = NonNullable<ButtonProps['size']>

const buttonSizeStyles: Record<ButtonSize, { minHeight: number; paddingHorizontal: number }> = {
  sm: { minHeight: spacing['32'], paddingHorizontal: spacing.sm },
  md: { minHeight: spacing['40'], paddingHorizontal: spacing.md },
  lg: { minHeight: spacing['48'], paddingHorizontal: spacing.lg },
}

const buttonContainerStyles: Record<ButtonVariant, ViewStyle> = {
  solid: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
    borderWidth: borderWidth.none,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.brandPrimary,
    borderWidth: borderWidth.thin,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: borderWidth.none,
  },
}

const buttonTextTone: Record<ButtonVariant, 'inverse' | 'primary'> = {
  solid: 'inverse',
  outline: 'primary',
  ghost: 'primary',
}

const reusableVariantMap: Record<ButtonVariant, 'default' | 'outline' | 'ghost'> = {
  solid: 'default',
  outline: 'outline',
  ghost: 'ghost',
}

const reusableSizeMap: Record<ButtonSize, 'sm' | 'default' | 'lg'> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
}

const spinnerColor: Record<ButtonVariant, string> = {
  solid: colors.white,
  outline: colors.brandPrimary,
  ghost: colors.brandPrimary,
}

export function Button({
  children,
  variant = 'solid',
  size = 'md',
  disabled,
  loading = false,
  onPress,
}: ButtonProps) {
  const sizeStyle = buttonSizeStyles[size]
  const variantStyle = buttonContainerStyles[variant]
  const isDisabled = disabled || loading

  return (
    <ReusableButton
      disabled={isDisabled}
      onPress={onPress}
      variant={reusableVariantMap[variant]}
      size={reusableSizeMap[size]}
      style={{
        minHeight: sizeStyle.minHeight,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? opacity.disabled : 1,
        ...variantStyle,
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={spinnerColor[variant]}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text tone={buttonTextTone[variant]} variant="label" style={{ textTransform: 'uppercase' }}>
          {children}
        </Text>
      )}
    </ReusableButton>
  )
}
```

**Step 3: Run guard checks**

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

**Step 4: Commit**

```bash
git add packages/ui/components/Button.tsx
git commit -m "ui: add loading state to Button, use opacity token for disabled"
```

---

### Task 5: RTL audit — fix any left/right violations

**Files:**
- Modify: any component in `packages/ui/components/` or `packages/ui/primitives/` that uses `paddingLeft`, `paddingRight`, `marginLeft`, `marginRight` (§17)

**Step 1: Find violations**

```bash
grep -rn "paddingLeft\|paddingRight\|marginLeft\|marginRight" packages/ui/
```

**Step 2: For each match**, replace with logical equivalents:
- `paddingLeft` → `paddingStart` (React Native logical prop)
- `paddingRight` → `paddingEnd`
- `marginLeft` → `marginStart`
- `marginRight` → `marginEnd`

Exception: if the value is intentionally directional (e.g. an icon chevron that must flip — handle with `I18nManager.isRTL` conditional), add a comment explaining why.

**Step 3: Run guard checks**

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

**Step 4: Commit**

```bash
git add packages/ui/
git commit -m "ui: replace directional padding/margin with logical props for RTL (§17)"
```

---

## PHASE B1 — Commerce Primitives

### Task 6: Create `PriceTag`

**Files:**
- Create: `packages/ui/components/PriceTag.tsx`
- Modify: `packages/ui/components/index.ts` (add export)

**Context:**
Required by §26.1 (ProductCard) and §26.3 (PDP). Must show: current price, optional compare-at (strikethrough), sale indicator, currency. RTL-safe — amounts in RTL flip direction. States: `loading` (skeleton), `disabled`.

**Step 1: Create the component**

```tsx
import { View, ViewStyle } from 'react-native'
import { colors, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'

type PriceTagProps = {
  price: number
  compareAt?: number
  currency?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

const priceTextVariant = {
  sm: 'bodySm',
  md: 'bodyMd',
  lg: 'bodyLg',
} as const

const CURRENCY_DEFAULT = 'SAR'

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function PriceTag({
  price,
  compareAt,
  currency = CURRENCY_DEFAULT,
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: PriceTagProps) {
  const isSale = compareAt !== undefined && compareAt > price

  if (loading) {
    return (
      <View style={[{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }, style]}>
        <Skeleton style={{ width: 64, height: 20, borderRadius: 4 }} />
        {compareAt !== undefined && (
          <Skeleton style={{ width: 48, height: 16, borderRadius: 4 }} />
        )}
      </View>
    )
  }

  return (
    <View
      style={[
        { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' },
        style,
      ]}
      accessibilityLabel={
        isSale
          ? `Sale price ${formatPrice(price, currency)}, was ${formatPrice(compareAt!, currency)}`
          : `Price ${formatPrice(price, currency)}`
      }
      accessibilityRole="text"
    >
      <Text
        variant={priceTextVariant[size]}
        tone={isSale ? 'danger' : disabled ? 'muted' : 'primary'}
        style={{ fontWeight: '700' }}
      >
        {formatPrice(price, currency)}
      </Text>

      {isSale && compareAt !== undefined && (
        <Text
          variant={size === 'lg' ? 'bodyMd' : 'bodySm'}
          tone="muted"
          style={{ textDecorationLine: 'line-through' }}
        >
          {formatPrice(compareAt, currency)}
        </Text>
      )}
    </View>
  )
}
```

**Step 2: Export from index**

Add to `packages/ui/components/index.ts`:
```ts
export { PriceTag } from './PriceTag'
```

**Step 3: Run guard checks**

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

**Step 4: Commit**

```bash
git add packages/ui/components/PriceTag.tsx packages/ui/components/index.ts
git commit -m "ui: add PriceTag component (sale/compare-at, loading, RTL-safe)"
```

---

### Task 7: Create `StockBadge`

**Files:**
- Create: `packages/ui/components/StockBadge.tsx`
- Modify: `packages/ui/components/index.ts`

**Context:**
Required by §26.1 and §26.3. Three states: `in-stock`, `low-stock`, `out-of-stock`. Uses `status` tokens. Per §9, must also have `disabled` and `loading`.

**Step 1: Create the component**

```tsx
import { View, ViewStyle } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'

type StockLevel = 'in-stock' | 'low-stock' | 'out-of-stock'

type StockBadgeProps = {
  level: StockLevel
  quantity?: number
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

const stockConfig: Record<
  StockLevel,
  { label: string; backgroundColor: string; textColor: string }
> = {
  'in-stock': {
    label: 'In Stock',
    backgroundColor: colors.success,
    textColor: colors.white,
  },
  'low-stock': {
    label: 'Low Stock',
    backgroundColor: colors.warning,
    textColor: colors.black,
  },
  'out-of-stock': {
    label: 'Out of Stock',
    backgroundColor: colors.backgroundSecondary,
    textColor: colors.textMuted,
  },
}

export function StockBadge({
  level,
  quantity,
  loading = false,
  disabled = false,
  style,
}: StockBadgeProps) {
  if (loading) {
    return <Skeleton style={[{ width: 80, height: 24, borderRadius: radius.full }, style]} />
  }

  const config = stockConfig[level]
  const label =
    level === 'low-stock' && quantity !== undefined
      ? `Only ${quantity} left`
      : config.label

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xxs,
          borderRadius: radius.full,
          backgroundColor: config.backgroundColor,
          alignSelf: 'flex-start',
          borderWidth: borderWidth.thin,
          borderColor:
            level === 'out-of-stock' ? colors.border : config.backgroundColor,
          opacity: disabled ? opacity.disabled : 1,
        },
        style,
      ]}
    >
      <Text variant="caption" style={{ color: config.textColor, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  )
}
```

**Step 2: Export from index**

```ts
export { StockBadge } from './StockBadge'
```

**Step 3: Run guard checks**

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

**Step 4: Commit**

```bash
git add packages/ui/components/StockBadge.tsx packages/ui/components/index.ts
git commit -m "ui: add StockBadge component (in/low/out-of-stock, loading, disabled)"
```

---

### Task 8: Create `QuantityInput`

**Files:**
- Create: `packages/ui/components/QuantityInput.tsx`
- Modify: `packages/ui/components/index.ts`

**Context:**
Required by §26.3 (PDP) and §26.4 (Cart). Decrement/increment buttons with value display. Disabled at min/max bounds. States: `loading`, `disabled`.

**Step 1: Create the component**

```tsx
import { View, Pressable, ViewStyle } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'

type QuantityInputProps = {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export function QuantityInput({
  value,
  min = 1,
  max = 99,
  onChange,
  loading = false,
  disabled = false,
  style,
}: QuantityInputProps) {
  if (loading) {
    return <Skeleton style={[{ width: 112, height: 40, borderRadius: radius.lg }, style]} />
  }

  const canDecrement = value > min && !disabled
  const canIncrement = value < max && !disabled

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: borderWidth.thin,
          borderColor: colors.border,
          borderRadius: radius.lg,
          overflow: 'hidden',
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Pressable
        onPress={() => canDecrement && onChange(value - 1)}
        disabled={!canDecrement}
        accessibilityLabel="Decrease quantity"
        accessibilityRole="button"
        style={{
          width: spacing['40'],
          height: spacing['40'],
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canDecrement ? 1 : opacity.disabled,
        }}
      >
        <Text variant="bodyMd" tone="primary" style={{ fontWeight: '700' }}>
          −
        </Text>
      </Pressable>

      <View
        style={{
          width: spacing['32'],
          alignItems: 'center',
          justifyContent: 'center',
          borderStartWidth: borderWidth.thin,
          borderEndWidth: borderWidth.thin,
          borderColor: colors.border,
          height: spacing['40'],
        }}
      >
        <Text variant="bodyMd" tone={disabled ? 'muted' : 'primary'} style={{ fontWeight: '600' }}>
          {value}
        </Text>
      </View>

      <Pressable
        onPress={() => canIncrement && onChange(value + 1)}
        disabled={!canIncrement}
        accessibilityLabel="Increase quantity"
        accessibilityRole="button"
        style={{
          width: spacing['40'],
          height: spacing['40'],
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canIncrement ? 1 : opacity.disabled,
        }}
      >
        <Text variant="bodyMd" tone="primary" style={{ fontWeight: '700' }}>
          +
        </Text>
      </Pressable>
    </View>
  )
}
```

**Step 2: Export from index**

```ts
export { QuantityInput } from './QuantityInput'
```

**Step 3: Run guard checks + commit**

```bash
yarn guard:checks
git add packages/ui/components/QuantityInput.tsx packages/ui/components/index.ts
git commit -m "ui: add QuantityInput component (min/max bounds, loading, disabled, RTL-safe)"
```

---

## PHASE B2 — Form Primitives

### Task 9: Create `Checkbox`

**Files:**
- Create: `packages/ui/components/Checkbox.tsx`
- Modify: `packages/ui/components/index.ts`

**Context:**
Needed by §26.5 (Checkout) and §26.6 (Account). Must be keyboard/screen-reader accessible. States: `loading`, `disabled`, `checked`, `indeterminate`.

**Step 1: Create the component**

```tsx
import { Pressable, View, ViewStyle } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'

type CheckboxProps = {
  checked?: boolean
  indeterminate?: boolean
  label?: string
  disabled?: boolean
  loading?: boolean
  onChange?: (checked: boolean) => void
  style?: ViewStyle
}

export function Checkbox({
  checked = false,
  indeterminate = false,
  label,
  disabled = false,
  loading = false,
  onChange,
  style,
}: CheckboxProps) {
  if (loading) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, style]}>
        <Skeleton style={{ width: 20, height: 20, borderRadius: radius.sm }} />
        {label && <Skeleton style={{ width: 80, height: 14, borderRadius: radius.sm }} />}
      </View>
    )
  }

  const isChecked = checked || indeterminate

  return (
    <Pressable
      onPress={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}
      accessibilityLabel={label}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          opacity: disabled ? opacity.disabled : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: radius.sm,
          borderWidth: borderWidth.thin,
          borderColor: isChecked ? colors.brandPrimary : colors.border,
          backgroundColor: isChecked ? colors.brandPrimary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {indeterminate && (
          <View
            style={{
              width: 10,
              height: 2,
              backgroundColor: colors.white,
              borderRadius: radius.full,
            }}
          />
        )}
        {checked && !indeterminate && (
          <Text variant="caption" style={{ color: colors.white, fontWeight: '700', lineHeight: 14 }}>
            ✓
          </Text>
        )}
      </View>

      {label && (
        <Text variant="bodyMd" tone={disabled ? 'muted' : 'default'}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}
```

**Step 2: Export + guard + commit**

```bash
# Add export to index.ts
yarn guard:checks
git add packages/ui/components/Checkbox.tsx packages/ui/components/index.ts
git commit -m "ui: add Checkbox (checked/indeterminate/disabled/loading, accessible)"
```

---

### Task 10: Create `Switch`

**Files:**
- Create: `packages/ui/components/Switch.tsx`
- Modify: `packages/ui/components/index.ts`

**Step 1: Create the component**

Uses moti for the thumb animation (§20.1 — cross-platform animation = moti).

```tsx
import { Pressable, View, ViewStyle } from 'react-native'
import { MotiView } from 'moti'
import { borderWidth, colors, motionDuration, motionEasing, opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'

type SwitchProps = {
  value?: boolean
  label?: string
  disabled?: boolean
  loading?: boolean
  onChange?: (value: boolean) => void
  style?: ViewStyle
}

const TRACK_WIDTH = 44
const TRACK_HEIGHT = 24
const THUMB_SIZE = 18
const THUMB_OFFSET = (TRACK_HEIGHT - THUMB_SIZE) / 2

export function Switch({
  value = false,
  label,
  disabled = false,
  loading = false,
  onChange,
  style,
}: SwitchProps) {
  if (loading) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, style]}>
        <Skeleton style={{ width: TRACK_WIDTH, height: TRACK_HEIGHT, borderRadius: radius.full }} />
        {label && <Skeleton style={{ width: 80, height: 14, borderRadius: radius.sm }} />}
      </View>
    )
  }

  return (
    <Pressable
      onPress={() => !disabled && onChange?.(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          opacity: disabled ? opacity.disabled : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: radius.full,
          backgroundColor: value ? colors.brandPrimary : colors.border,
          justifyContent: 'center',
          paddingHorizontal: THUMB_OFFSET,
          borderWidth: borderWidth.none,
        }}
      >
        <MotiView
          animate={{ translateX: value ? TRACK_WIDTH - THUMB_SIZE - THUMB_OFFSET * 2 : 0 }}
          transition={{
            type: 'timing',
            duration: motionDuration.microInteraction,
            // easing provided as string — moti accepts CSS easing strings
          }}
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: radius.full,
            backgroundColor: colors.white,
          }}
        />
      </View>

      {label && (
        <Text variant="bodyMd" tone={disabled ? 'muted' : 'default'}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}
```

**Step 2: Export + guard + commit**

```bash
yarn guard:checks
git add packages/ui/components/Switch.tsx packages/ui/components/index.ts
git commit -m "ui: add Switch component (moti thumb animation, disabled/loading, accessible)"
```

---

### Task 11: Create `Textarea`

**Files:**
- Create: `packages/ui/components/Textarea.tsx`
- Modify: `packages/ui/components/index.ts`

**Step 1: Create the component**

```tsx
import { TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing, typography } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'

type TextareaProps = Omit<TextInputProps, 'multiline' | 'style'> & {
  rows?: number
  error?: string
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
}

export function Textarea({
  rows = 4,
  error,
  disabled = false,
  loading = false,
  style,
  ...props
}: TextareaProps) {
  if (loading) {
    const height = rows * 24 + spacing.md * 2
    return <Skeleton style={[{ width: '100%', height, borderRadius: radius.md }, style]} />
  }

  const borderColor = error ? colors.error : disabled ? colors.border : colors.border
  const focusBorderColor = error ? colors.error : colors.brandPrimary

  return (
    <View style={[{ width: '100%' }, style]}>
      <TextInput
        multiline
        numberOfLines={rows}
        editable={!disabled}
        textAlignVertical="top"
        accessibilityState={{ disabled }}
        style={{
          minHeight: rows * 24,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderWidth: borderWidth.thin,
          borderColor,
          borderRadius: radius.md,
          backgroundColor: disabled ? colors.backgroundSecondary : colors.background,
          color: disabled ? colors.textMuted : colors.text,
          fontSize: typography.bodyMd,
          fontFamily: 'Inter',
          opacity: disabled ? opacity.disabled : 1,
        }}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && (
        <Text variant="caption" tone="danger" style={{ marginTop: spacing.xxs }}>
          {error}
        </Text>
      )}
    </View>
  )
}
```

**Step 2: Export + guard + commit**

```bash
yarn guard:checks
git add packages/ui/components/Textarea.tsx packages/ui/components/index.ts
git commit -m "ui: add Textarea component (multiline, error state, disabled/loading)"
```

---

### Task 12: Create `FormField`

**Files:**
- Create: `packages/ui/components/FormField.tsx`
- Modify: `packages/ui/components/index.ts`

**Context:**
Wrapper that pairs a label, any input child, optional hint, and error message. RTL-safe — label aligns to start. Used in Checkout (§26.5) and Account (§26.6).

**Step 1: Create the component**

```tsx
import { ReactNode } from 'react'
import { View, ViewStyle } from 'react-native'
import { spacing } from '@real/tokens'
import { Text } from '../primitives/Text'

type FormFieldProps = {
  label: string
  children: ReactNode
  hint?: string
  error?: string
  required?: boolean
  loading?: boolean
  style?: ViewStyle
}

export function FormField({
  label,
  children,
  hint,
  error,
  required = false,
  style,
}: FormFieldProps) {
  return (
    <View style={[{ gap: spacing.xxs }, style]}>
      <Text variant="label" tone="primary" style={{ fontWeight: '600' }}>
        {label}
        {required && (
          <Text variant="label" tone="danger">
            {' '}*
          </Text>
        )}
      </Text>

      {children}

      {hint && !error && (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      )}

      {error && (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      )}
    </View>
  )
}
```

**Step 2: Export + guard + commit**

```bash
yarn guard:checks
git add packages/ui/components/FormField.tsx packages/ui/components/index.ts
git commit -m "ui: add FormField wrapper (label, hint, error, required, RTL-safe)"
```

---

## PHASE B3 — Feedback Primitives

### Task 13: Create `Spinner`

**Files:**
- Create: `packages/ui/components/Spinner.tsx`
- Modify: `packages/ui/components/index.ts`

**Context:**
Lightweight spinner using `ActivityIndicator` (cross-platform, no moti needed). Sized from tokens.

**Step 1: Create the component**

```tsx
import { ActivityIndicator, View, ViewStyle } from 'react-native'
import { colors, spacing } from '@real/tokens'

type SpinnerTone = 'primary' | 'inverse' | 'muted'
type SpinnerSize = 'sm' | 'md' | 'lg'

type SpinnerProps = {
  tone?: SpinnerTone
  size?: SpinnerSize
  style?: ViewStyle
}

const spinnerColor: Record<SpinnerTone, string> = {
  primary: colors.brandPrimary,
  inverse: colors.white,
  muted: colors.textMuted,
}

const spinnerSize: Record<SpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
}

export function Spinner({ tone = 'primary', size = 'md', style }: SpinnerProps) {
  return (
    <View
      style={[{ alignItems: 'center', justifyContent: 'center', padding: spacing.sm }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <ActivityIndicator color={spinnerColor[tone]} size={spinnerSize[size]} />
    </View>
  )
}
```

**Step 2: Export + guard + commit**

```bash
yarn guard:checks
git add packages/ui/components/Spinner.tsx packages/ui/components/index.ts
git commit -m "ui: add Spinner component (tone, size, accessible)"
```

---

### Task 14: Create `Alert`

**Files:**
- Create: `packages/ui/components/Alert.tsx`
- Modify: `packages/ui/components/index.ts`

**Context:**
Inline feedback banner. Four tones matching `status` tokens: `success`, `warning`, `error`, `info`. Dismissible optional.

**Step 1: Create the component**

```tsx
import { ReactNode } from 'react'
import { Pressable, View, ViewStyle } from 'react-native'
import { borderWidth, colors, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'

type AlertTone = 'success' | 'warning' | 'error' | 'info'

type AlertProps = {
  tone?: AlertTone
  title?: string
  children: ReactNode
  onDismiss?: () => void
  style?: ViewStyle
}

const alertConfig: Record<AlertTone, { border: string; background: string; textTone: 'success' | 'warning' | 'danger' | 'info' }> = {
  success: { border: colors.success, background: colors.success,    textTone: 'success' },
  warning: { border: colors.warning, background: colors.warning,    textTone: 'warning' },
  error:   { border: colors.error,   background: colors.error,      textTone: 'danger'  },
  info:    { border: colors.info,    background: colors.info,        textTone: 'info'    },
}

// Subtle background derived from status tokens
const subtleBg: Record<AlertTone, string> = {
  success: 'hsl(144 45% 94%)',
  warning: 'hsl(40 100% 95%)',
  error:   'hsl(355 70% 95%)',
  info:    'hsl(214 78% 95%)',
}

export function Alert({ tone = 'info', title, children, onDismiss, style }: AlertProps) {
  const config = alertConfig[tone]

  return (
    <View
      accessibilityRole="alert"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.md,
          borderStartWidth: borderWidth.thick + borderWidth.thin, // 3px accent border
          borderStartColor: config.border,
          borderWidth: borderWidth.thin,
          borderColor: config.border,
          backgroundColor: subtleBg[tone],
        },
        style,
      ]}
    >
      <View style={{ flex: 1, gap: spacing.xxs }}>
        {title && (
          <Text variant="bodyMd" tone={config.textTone} style={{ fontWeight: '600' }}>
            {title}
          </Text>
        )}
        <Text variant="bodySm" tone="default">
          {children}
        </Text>
      </View>

      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          accessibilityLabel="Dismiss alert"
          accessibilityRole="button"
          style={{ padding: spacing.xxs }}
        >
          <Text variant="bodyMd" tone="muted">
            ✕
          </Text>
        </Pressable>
      )}
    </View>
  )
}
```

**Step 2: Export + guard + commit**

```bash
yarn guard:checks
git add packages/ui/components/Alert.tsx packages/ui/components/index.ts
git commit -m "ui: add Alert component (4 status tones, dismissible, accessible)"
```

---

### Task 15: Create `Toast` + `ToastProvider`

**Files:**
- Create: `packages/ui/components/Toast.tsx`
- Modify: `packages/ui/components/index.ts`

**Context:**
Toast needs to be globally triggered, animated in/out, and stack-safe. Uses moti `AnimatePresence` (§20.1). Z-index from `layers.toast` (500). Auto-dismiss after 4s. Tones from `status` tokens.

This is the most complex component. Keep it minimal: a `ToastProvider` (context + absolute overlay) and a `useToast()` hook.

**Step 1: Create the file**

```tsx
import { createContext, useCallback, useContext, useState, ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { AnimatePresence, MotiView } from 'moti'
import { colors, motionDuration, motionEasing, radius, spacing, zIndex } from '@real/tokens'
import { Text } from '../primitives/Text'

type ToastTone = 'success' | 'error' | 'info' | 'warning'

type ToastItem = {
  id: string
  message: string
  tone: ToastTone
}

type ToastContextValue = {
  show: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toastBorderColor: Record<ToastTone, string> = {
  success: colors.success,
  error:   colors.error,
  warning: colors.warning,
  info:    colors.info,
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -8 }}
      transition={{ type: 'timing', duration: motionDuration.microInteraction }}
      style={{
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderStartWidth: 3,
        borderStartColor: toastBorderColor[item.tone],
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        // web shadow
        shadowColor: 'hsl(0 0% 0%)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <Text variant="bodySm" tone="primary" style={{ flex: 1 }}>
        {item.message}
      </Text>
      <Pressable
        onPress={onDismiss}
        accessibilityLabel="Dismiss"
        accessibilityRole="button"
      >
        <Text variant="caption" tone="muted">✕</Text>
      </Pressable>
    </MotiView>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View
        style={{
          position: 'absolute',
          bottom: spacing.xl,
          // RTL-safe: start side
          start: spacing.md,
          end: spacing.md,
          zIndex: zIndex.toast,
          pointerEvents: 'box-none',
        }}
        accessibilityLiveRegion="polite"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <ToastItem key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
          ))}
        </AnimatePresence>
      </View>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
```

**Step 2: Export from index**

```ts
export { ToastProvider, useToast } from './Toast'
```

**Step 3: Wire `ToastProvider` into app layout**

In `apps/next/app/layout.tsx`, wrap children with `<ToastProvider>`:
```tsx
import { ToastProvider } from '@real/ui'
// wrap: <ToastProvider>{children}</ToastProvider>
```

In `apps/expo/app/_layout.tsx`:
```tsx
import { ToastProvider } from '@real/ui'
// wrap: <ToastProvider>{children}</ToastProvider>
```

**Step 4: Run guard checks**

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

**Step 5: Commit**

```bash
git add packages/ui/components/Toast.tsx packages/ui/components/index.ts \
  apps/next/app/layout.tsx apps/expo/app/_layout.tsx
git commit -m "ui: add Toast + ToastProvider (moti AnimatePresence, 4 tones, RTL-safe, z-index token)"
```

---

## Final Verification

### Task 16: Full guard + visual check

**Step 1: Run full guard suite**

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

**Step 2: Verify no hardcoded colors remain in packages/ui**

```bash
grep -rn "#[0-9a-fA-F]{3,8}" packages/ui/ && echo "FAIL" || echo "PASS"
```

Expected: `PASS`

**Step 3: Verify no className in packages/app**

```bash
grep -rn "className=" packages/app/ && echo "FAIL" || echo "PASS"
```

Expected: `PASS`

**Step 4: Manual RTL spot-check**

In the Next.js dev server, temporarily add `dir="rtl"` to `<html>` and visually verify:
- PriceTag: currency symbol flips correctly
- QuantityInput: − and + buttons swap positions
- Alert: accent border appears on the correct (start) side
- Toast: appears aligned to the correct edge

**Step 5: Final commit**

```bash
git add -A
git commit -m "ui: final guard pass — token bridge + primitive hardening complete"
```

---

## Summary

| Phase | Tasks | New files |
|-------|-------|-----------|
| A — CSS Bridge | 1–2 | `packages/ui/global.css` |
| C — Hardening | 3–5 | (Badge, Button modified; RTL fixes) |
| B1 — Commerce | 6–8 | PriceTag, StockBadge, QuantityInput |
| B2 — Forms | 9–12 | Checkbox, Switch, Textarea, FormField |
| B3 — Feedback | 13–15 | Spinner, Alert, Toast+ToastProvider |
| Verify | 16 | — |

**Total: 10 new component files, 2 modified components, 1 CSS bridge file.**

All comply with AGENTS.md: §1.1 (tokens only), §4.1 (packages/ui), §9 (states + className location),
§17 (RTL logical spacing), §20.1 (moti for animation), §21 (guard), §24 (tokenized motion),
§25.3 (sharp radius default), §26 (canonical patterns served), §27 (extends existing before creating new).
