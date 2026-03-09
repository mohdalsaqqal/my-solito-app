# Phosphor Icons + RNR Components Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Lucide icons with Phosphor (`light` weight) and add four RNR-pattern components — Sheet, Skeleton, Tabs, Select — all using only already-installed dependencies.

**Architecture:** Two independent tracks. Track 1 swaps `Icon.tsx` and `Icon.native.tsx` and updates `packages/ui/package.json`. Track 2 adds four new component files to `packages/ui/components/` and exports them from `index.ts`. All components use `@real/tokens` exclusively — no raw hex colors, no hardcoded values.

**Tech Stack:** `phosphor-react` (web), `phosphor-react-native` (native), `moti` (Skeleton + Sheet animation), React Native `Modal` (Sheet + Select native), `@real/tokens`

**Design doc:** `docs/plans/2026-03-10-phosphor-icons-rnr-components-design.md`

---

## Background for the implementer

**Token import path:** `import { colors, radius, spacing, borderWidth, typography, fontWeights } from '@real/tokens'`

**Guard rules (run `yarn guard:checks` after every commit):**
- No single-line `style={{ ... }}` containing `margin`, `padding`, `fontSize`, `lineHeight`, `fontWeight`, `borderRadius`, or `color` — always expand to multi-line
- No raw hex colors (`#fff`, `#123456`) — use token values only
- `className` is allowed in `packages/ui` (UniWind is enabled there)

**Existing primitives you'll use:**
- `import { Text } from '../primitives'` — typed Text with variant/tone/weight props
- `import { Box } from '../primitives'` — View with token shorthand props
- `import { Icon } from './Icon'` — after Task 1, this is Phosphor-backed

**`moti` API used in this plan:**
```tsx
import { MotiView } from 'moti'
// Looping pulse:
<MotiView
  from={{ opacity: 1 }}
  animate={{ opacity: 0.4 }}
  transition={{ type: 'timing', duration: 800, loop: true, repeatReverse: true }}
/>
// One-shot slide:
<MotiView
  from={{ translateY: 400 }}
  animate={{ translateY: 0 }}
  transition={{ type: 'timing', duration: 350 }}
/>
```

---

## Task 1: Swap Lucide → Phosphor icons

**Files:**
- Modify: `packages/ui/package.json`
- Rewrite: `packages/ui/components/Icon.tsx`
- Rewrite: `packages/ui/components/Icon.native.tsx`

### Step 1: Update package.json

In `packages/ui/package.json`, replace the `lucide-react` and `lucide-react-native` lines:

```json
{
  "name": "@real/ui",
  "version": "0.0.0",
  "main": "index.ts",
  "dependencies": {
    "@real/tokens": "*",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "phosphor-react": "^1.4.1",
    "phosphor-react-native": "^2.2.1",
    "react-native": "0.81.4",
    "react-native-svg": "^15.12.1",
    "tailwind-merge": "^3.3.1"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  },
  "sideEffects": false
}
```

### Step 2: Rewrite `Icon.tsx` (web)

Replace the entire file:

```tsx
import {
  ArrowUpRight,
  Eye,
  FacebookLogo,
  Globe,
  Heart,
  House,
  InstagramLogo,
  List,
  MagnifyingGlass,
  Percent,
  Question,
  ShoppingBag,
  SquaresFour,
  TrendUp,
  User,
  YoutubeLogo,
} from 'phosphor-react'
import { colors, spacing } from '@real/tokens'

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'

export type IconName =
  | 'home'
  | 'categories'
  | 'deals'
  | 'account'
  | 'more'
  | 'wishlist'
  | 'cart'
  | 'search'
  | 'quickView'
  | 'language'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'trending'
  | 'trendArrow'
  | 'unknown'

type PhosphorComponent = React.ComponentType<{
  size?: number
  color?: string
  weight?: IconWeight
}>

const ICON_BY_NAME: Record<IconName, PhosphorComponent> = {
  home: House,
  categories: SquaresFour,
  deals: Percent,
  account: User,
  more: List,
  wishlist: Heart,
  cart: ShoppingBag,
  search: MagnifyingGlass,
  quickView: Eye,
  language: Globe,
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  youtube: YoutubeLogo,
  trending: TrendUp,
  trendArrow: ArrowUpRight,
  unknown: Question,
}

type IconProps = {
  name: IconName
  size?: number
  color?: string
  weight?: IconWeight
}

export function Icon({
  name,
  size = spacing['16'],
  color = colors.textPrimary,
  weight = 'light',
}: IconProps) {
  const Glyph = ICON_BY_NAME[name] ?? ICON_BY_NAME.unknown
  return <Glyph size={size} color={color} weight={weight} />
}
```

### Step 3: Rewrite `Icon.native.tsx` (native)

Replace the entire file (same structure, different import source — `phosphor-react-native` uses `react-native-svg` which is already installed):

```tsx
import {
  ArrowUpRight,
  Eye,
  FacebookLogo,
  Globe,
  Heart,
  House,
  InstagramLogo,
  List,
  MagnifyingGlass,
  Percent,
  Question,
  ShoppingBag,
  SquaresFour,
  TrendUp,
  User,
  YoutubeLogo,
} from 'phosphor-react-native'
import { colors, spacing } from '@real/tokens'

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'

export type IconName =
  | 'home'
  | 'categories'
  | 'deals'
  | 'account'
  | 'more'
  | 'wishlist'
  | 'cart'
  | 'search'
  | 'quickView'
  | 'language'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'trending'
  | 'trendArrow'
  | 'unknown'

type PhosphorComponent = React.ComponentType<{
  size?: number
  color?: string
  weight?: IconWeight
}>

const ICON_BY_NAME: Record<IconName, PhosphorComponent> = {
  home: House,
  categories: SquaresFour,
  deals: Percent,
  account: User,
  more: List,
  wishlist: Heart,
  cart: ShoppingBag,
  search: MagnifyingGlass,
  quickView: Eye,
  language: Globe,
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  youtube: YoutubeLogo,
  trending: TrendUp,
  trendArrow: ArrowUpRight,
  unknown: Question,
}

type IconProps = {
  name: IconName
  size?: number
  color?: string
  weight?: IconWeight
}

export function Icon({
  name,
  size = spacing['16'],
  color = colors.textPrimary,
  weight = 'light',
}: IconProps) {
  const Glyph = ICON_BY_NAME[name] ?? ICON_BY_NAME.unknown
  return <Glyph size={size} color={color} weight={weight} />
}
```

### Step 4: Install packages

```bash
yarn
```

Expected: Phosphor packages downloaded, Lucide removed.

### Step 5: Guard check

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

### Step 6: Commit

```bash
git add packages/ui/package.json packages/ui/components/Icon.tsx packages/ui/components/Icon.native.tsx
git commit -m "ui: swap lucide icons for phosphor (light weight)"
```

---

## Task 2: Add Sheet component

**File:** Create `packages/ui/components/Sheet.tsx`

Sheet is a slide-up bottom panel. Native uses `Modal` + `MotiView` animation. Web uses `Modal` (react-native-web renders it as a fixed overlay).

### Step 1: Create the file

```tsx
import { ReactNode } from 'react'
import { Modal, Platform, Pressable, View } from 'react-native'
import { MotiView } from 'moti'
import { borderWidth, colors, radius, spacing } from '@real/tokens'

type SheetProps = {
  visible: boolean
  onClose: () => void
  children?: ReactNode
}

function SheetHandle() {
  return (
    <View
      style={{
        width: 36,
        height: 4,
        borderRadius: radius.full,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: spacing.md,
      }}
    />
  )
}

function SheetContent({ children }: { children?: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxl,
      }}
    >
      {children}
    </View>
  )
}

function SheetRoot({ visible, onClose, children }: SheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='none'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.black,
          opacity: 0.5,
        }}
      />
      {/* Slide-up panel */}
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <MotiView
          from={{ translateY: 400 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'timing', duration: 350 }}
        >
          {children}
        </MotiView>
      </View>
    </Modal>
  )
}

export const Sheet = Object.assign(SheetRoot, {
  Handle: SheetHandle,
  Content: SheetContent,
})
```

### Step 2: Guard check

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

If it fails on a single-line style, ensure each property is on its own line.

### Step 3: Commit (hold — add to index first in Task 6)

Keep file staged for now. We'll commit all new component exports together in Task 6.

---

## Task 3: Add Skeleton component

**File:** Create `packages/ui/components/Skeleton.tsx`

Animated shimmer using Moti's looping opacity pulse. Replaces static `<Box style={{ ...shimmer }}>` blocks.

### Step 1: Create the file

```tsx
import { ReactNode } from 'react'
import { ViewStyle } from 'react-native'
import { MotiView } from 'moti'
import { colors, radius } from '@real/tokens'

type SkeletonProps = {
  width: number | `${number}%`
  height: number
  radius?: keyof typeof radius
  style?: ViewStyle
}

function SkeletonItem({ width, height, radius: radiusKey = 'xs', style }: SkeletonProps) {
  return (
    <MotiView
      from={{ opacity: 1 }}
      animate={{ opacity: 0.4 }}
      transition={{
        type: 'timing',
        duration: 800,
        loop: true,
        repeatReverse: true,
      }}
      style={[
        {
          width,
          height,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: radius[radiusKey],
        },
        style,
      ]}
    />
  )
}

function SkeletonGroup({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

export const Skeleton = Object.assign(SkeletonItem, {
  Group: SkeletonGroup,
})
```

### Step 2: Guard check

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

### Step 3: No commit yet — batched in Task 6

---

## Task 4: Add Tabs component

**File:** Create `packages/ui/components/Tabs.tsx`

Horizontal scrollable tab bar with active underline indicator. Context-based, no external deps.

### Step 1: Create the file

```tsx
import { createContext, ReactNode, useContext, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { colors, radius, spacing } from '@real/tokens'
import { Text } from '../primitives'

type TabsContextValue = {
  value: string
  onChange: (v: string) => void
}

const TabsContext = createContext<TabsContextValue>({
  value: '',
  onChange: () => {},
})

type TabsRootProps = {
  defaultValue?: string
  value?: string
  onChange?: (v: string) => void
  children?: ReactNode
}

function TabsRoot({ defaultValue = '', value: controlled, onChange, children }: TabsRootProps) {
  const [internal, setInternal] = useState(defaultValue)
  const value = controlled ?? internal
  const handleChange = (v: string) => {
    setInternal(v)
    onChange?.(v)
  }
  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      {children}
    </TabsContext.Provider>
  )
}

function TabsList({ children }: { children?: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {children}
      </View>
    </ScrollView>
  )
}

function TabsTrigger({ value, children }: { value: string; children?: ReactNode }) {
  const ctx = useContext(TabsContext)
  const active = ctx.value === value
  return (
    <Pressable
      onPress={() => ctx.onChange(value)}
      accessibilityRole='tab'
      accessibilityState={{ selected: active }}
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        position: 'relative',
      }}
    >
      <Text
        variant='bodySm'
        tone={active ? 'default' : 'muted'}
        weight={active ? '600' : '400'}
      >
        {children}
      </Text>
      {active ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: spacing.md,
            right: spacing.md,
            height: 2,
            backgroundColor: colors.brandPrimary,
            borderRadius: radius.full,
          }}
        />
      ) : null}
    </Pressable>
  )
}

function TabsContent({ value, children }: { value: string; children?: ReactNode }) {
  const ctx = useContext(TabsContext)
  if (ctx.value !== value) return null
  return <View>{children}</View>
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})
```

### Step 2: Guard check

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

### Step 3: No commit yet — batched in Task 6

---

## Task 5: Add Select component

**File:** Create `packages/ui/components/Select.tsx`

Controlled picker. Web: absolute-positioned dropdown. Native: `Modal` bottom sheet with options list.

### Step 1: Create the file

```tsx
import { useState } from 'react'
import { Modal, Platform, Pressable, ScrollView, View } from 'react-native'
import { borderWidth, colors, radius, spacing } from '@real/tokens'
import { Text } from '../primitives'
import { Icon } from './Icon'

export type SelectOption = {
  label: string
  value: string
}

type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

export function Select({ value, onChange, options, placeholder = 'Select…' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  const isWeb = Platform.OS === 'web'

  const handleSelect = (optValue: string) => {
    onChange(optValue)
    setOpen(false)
  }

  const OptionList = (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: borderWidth.thin,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {options.map((option) => {
          const isSelected = option.value === value
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                backgroundColor: isSelected ? colors.backgroundSecondary : colors.surface,
              }}
            >
              <Text
                variant='bodySm'
                tone={isSelected ? 'default' : 'muted'}
                weight={isSelected ? '600' : '400'}
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )

  return (
    <View style={{ position: 'relative' }}>
      {/* Trigger */}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole='button'
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderWidth: borderWidth.thin,
          borderColor: open ? colors.textPrimary : colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
        }}
      >
        <Text
          variant='bodySm'
          tone={selected ? 'default' : 'muted'}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Icon name='more' size={14} color={colors.textMuted} />
      </Pressable>

      {/* Web: inline dropdown */}
      {isWeb && open ? (
        <View
          style={{
            position: 'absolute',
            top: '100%' as any,
            left: 0,
            right: 0,
            zIndex: 100,
            marginTop: spacing.xs,
          }}
        >
          {OptionList}
        </View>
      ) : null}

      {/* Native: Modal bottom sheet */}
      {!isWeb ? (
        <Modal
          visible={open}
          transparent
          animationType='fade'
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              padding: spacing.md,
              backgroundColor: colors.black,
              opacity: 0.5,
            }}
            onPress={() => setOpen(false)}
          />
          <View
            style={{
              position: 'absolute',
              bottom: spacing.xxl,
              left: spacing.md,
              right: spacing.md,
            }}
          >
            {OptionList}
          </View>
        </Modal>
      ) : null}
    </View>
  )
}
```

### Step 2: Guard check

```bash
yarn guard:checks
```

Expected: `[guard] All checks passed`

---

## Task 6: Export all new components + commit

**File:** Modify `packages/ui/components/index.ts`

### Step 1: Add exports

Add four lines after the existing exports:

```ts
export * from './Button'
export * from './StarRating'
export * from './Card'
export * from './Badge'
export * from './Icon'
export * from './Grid'
export * from './NavChip'
export * from './Drawer'
export * from './SectionHeading'
export * from './MetricCard'
export * from './ProductCard'
export * from './RevealOnScroll'
export * from './HeroSlideCard'
export * from './HeroCarouselControls'
export * from './CampaignCard'
export * from './HorizontalRailState'
export * from './Sheet'
export * from './Skeleton'
export * from './Tabs'
export * from './Select'
export * from './chrome'
export * from './home'
export * from './home-v2'
export * from './shop'
```

### Step 2: Final guard check

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
[i18n:hardcoded-check] passed
[guard] All checks passed
```

### Step 3: Commit all new components

```bash
git add packages/ui/components/Sheet.tsx packages/ui/components/Skeleton.tsx packages/ui/components/Tabs.tsx packages/ui/components/Select.tsx packages/ui/components/index.ts
git commit -m "ui: add Sheet, Skeleton, Tabs, Select components (RNR pattern)"
```

---

## Usage examples (for verification)

After implementation, these patterns should work anywhere in `packages/app` or `packages/ui`:

```tsx
import { Sheet, Skeleton, Tabs, Select } from '@real/ui'

// Sheet
<Sheet visible={filterOpen} onClose={() => setFilterOpen(false)}>
  <Sheet.Content>
    <Sheet.Handle />
    <Text variant='title'>Filters</Text>
  </Sheet.Content>
</Sheet>

// Skeleton
<Skeleton width='100%' height={10} radius='xs' />
<Skeleton width='60%' height={13} radius='xs' />

// Tabs
<Tabs defaultValue='description'>
  <Tabs.List>
    <Tabs.Trigger value='description'>Description</Tabs.Trigger>
    <Tabs.Trigger value='reviews'>Reviews</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value='description'>...</Tabs.Content>
</Tabs>

// Select
<Select
  value={size}
  onChange={setSize}
  options={[{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }]}
  placeholder='Select size'
/>
```
