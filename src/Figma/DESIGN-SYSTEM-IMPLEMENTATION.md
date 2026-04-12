# DESIGN-SYSTEM-IMPLEMENTATION.md

## Purpose

This document is a Codex-ready implementation plan for converting the Figma **Design systems** page into a shared, production-ready design system for a **Solito + Tamagui + React + React Native + TypeScript** stack.

It is written to be directly usable by an implementation agent. It includes:

- exact target file structure
- exact starter file contents
- implementation rules
- naming conventions
- acceptance criteria

This plan is grounded in the visible Figma design-system foundations already confirmed:
- **System Effect**
- **Light Mode**
- **System Layout Grid**
- **Typography**
- **ICONS**

Where exact Figma values were not fully extractable due MCP plan/tool-call limits, the structure below uses safe starter defaults and clearly marks the places that should be adjusted after final token extraction.

---

## Locked decisions

1. Use a dedicated shared package: `packages/design-system`
2. Use **foundation tokens** + **semantic theme tokens**
3. Use **Tamagui** for theme/token plumbing
4. Keep business-specific styling out of token files
5. Start with **light mode only**
6. Build **primitives first**, then composites
7. Do not hardcode design values inside feature components
8. Keep naming semantic in code, not overly Figma-literal

---

## Target repo structure

```txt
packages/
  design-system/
    src/
      tokens/
        color.ts
        spacing.ts
        radius.ts
        shadow.ts
        border.ts
        layout.ts
        typography.ts
        icon.ts
        zIndex.ts
        motion.ts
        index.ts
      themes/
        light.ts
        index.ts
      utils/
        responsive.ts
        iconMap.ts
        getToken.ts
      primitives/
        Box.tsx
        Stack.tsx
        Text.tsx
        Heading.tsx
        Button.tsx
        Card.tsx
        Divider.tsx
        Badge.tsx
        Icon.tsx
        Container.tsx
        SectionHeader.tsx
        index.ts
      composites/
        ProductCard.tsx
        CategoryCard.tsx
        BrandCard.tsx
        Banner.tsx
        TestimonialCard.tsx
        index.ts
      index.ts
```

---

## Implementation rules for Codex

### Architecture rules

1. All design values must originate from token files.
2. Components may consume semantic theme values, not raw hex values directly.
3. Primitive components must be cross-platform safe.
4. Do not introduce CSS-only solutions that break React Native parity.
5. Prefer Tamagui `styled()` and shared token props where possible.
6. Avoid premature dark mode abstractions beyond clean theme boundaries.
7. Avoid coupling to current placeholder branding unless explicitly required.

### Naming rules

1. Foundation tokens use simple names:
   - `rawColors.gray.90`
   - `space.4`
   - `radius.md`
   - `shadows[4]`

2. Theme tokens use semantic names:
   - `background.page`
   - `text.primary`
   - `action.primary.bg`

3. Component variants use product language:
   - `Button` variants: `primary`, `secondary`, `ghost`, `link`
   - `Card` variants: `flat`, `elevated`, `outlined`

### Styling rules

1. No magic numbers inside components unless impossible to avoid.
2. All spacing must come from `space`.
3. All radii must come from `radius`.
4. All typography must come from `typeScale`.
5. All shadows must come from `shadows`.
6. All colors must come from `lightTheme` or semantic aliases.

---

## File contents

## 1) `packages/design-system/src/tokens/color.ts`

```ts
export const rawColors = {
  gray: {
    0: '#FFFFFF',
    5: '#F2F2F2',
    10: '#E5E5E5',
    20: '#CCCCCC',
    30: '#B3B3B3',
    40: '#999999',
    50: '#808080',
    60: '#666666',
    70: '#4D4D4D',
    80: '#333333',
    90: '#1A1A1A',
    100: '#000000',
  },

  warning: {
    50: '#FF1212',
  },

  attention: {
    50: '#FFCC00',
  },

  success: {
    50: '#26F13B',
  },

  link: {
    50: '#0E55FF',
  },

  brand: {
    home1: '#0064FA',
    home2: '#1E1E1E',
    home3: '#9F1D00',
    homeAccent: '#FAC300',
  },
} as const

export type RawColors = typeof rawColors
```

---

## 2) `packages/design-system/src/tokens/spacing.ts`

```ts
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  30: 120,
} as const

export type SpaceToken = keyof typeof space
```

---

## 3) `packages/design-system/src/tokens/radius.ts`

```ts
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const

export type RadiusToken = keyof typeof radius
```

---

## 4) `packages/design-system/src/tokens/shadow.ts`

```ts
export const shadows = {
  0: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  1: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  2: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  3: {
    shadowColor: '#000000',
    shadowOpacity: 0.10,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  4: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  6: {
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  8: {
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  12: {
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  16: {
    shadowColor: '#000000',
    shadowOpacity: 0.20,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  24: {
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 24,
  },
} as const

export type ShadowToken = keyof typeof shadows
```

---

## 5) `packages/design-system/src/tokens/border.ts`

```ts
export const borders = {
  width: {
    none: 0,
    hairline: 1,
    thin: 1,
    medium: 2,
  },
  color: {
    default: '#E5E5E5',
    subtle: '#F2F2F2',
    strong: '#CCCCCC',
    inverse: '#FFFFFF',
  },
} as const
```

---

## 6) `packages/design-system/src/tokens/layout.ts`

```ts
export const layout = {
  pageMax: {
    desktopWide: 1710,
    desktop: 1440,
    tablet: 1024,
    mobile: 390,
  },

  gutter: {
    mobile: 16,
    tablet: 24,
    desktop: 32,
    wide: 32,
  },

  containerPadding: {
    mobile: 16,
    tablet: 24,
    desktop: 32,
    wide: 32,
  },

  headerHeight: {
    mobile: 56,
    desktop: 136,
  },
} as const
```

---

## 7) `packages/design-system/src/tokens/typography.ts`

```ts
export const fontFamilies = {
  body: 'Urbanist',
  heading: 'Urbanist',
  editorial: 'Jost',
} as const

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

export const typeScale = {
  h1: { fontSize: 52, lineHeight: 60, letterSpacing: 0, fontWeight: fontWeights.bold },
  h2: { fontSize: 40, lineHeight: 48, letterSpacing: 0, fontWeight: fontWeights.bold },
  h3: { fontSize: 32, lineHeight: 40, letterSpacing: 0, fontWeight: fontWeights.semibold },
  h4: { fontSize: 24, lineHeight: 32, letterSpacing: 0, fontWeight: fontWeights.semibold },
  h5: { fontSize: 20, lineHeight: 28, letterSpacing: 0, fontWeight: fontWeights.semibold },
  h6: { fontSize: 18, lineHeight: 24, letterSpacing: 0, fontWeight: fontWeights.semibold },

  subtitle1: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: fontWeights.medium },
  subtitle2: { fontSize: 14, lineHeight: 20, letterSpacing: 0, fontWeight: fontWeights.medium },

  body1: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: fontWeights.regular },
  body2: { fontSize: 14, lineHeight: 20, letterSpacing: 0, fontWeight: fontWeights.regular },

  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0, fontWeight: fontWeights.regular },
  button: { fontSize: 14, lineHeight: 20, letterSpacing: 0.2, fontWeight: fontWeights.semibold },
  overline: { fontSize: 12, lineHeight: 16, letterSpacing: 1, fontWeight: fontWeights.semibold },
} as const

export type TypeScaleToken = keyof typeof typeScale
```

---

## 8) `packages/design-system/src/tokens/icon.ts`

```ts
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const

export type IconSizeToken = keyof typeof iconSize
```

---

## 9) `packages/design-system/src/tokens/zIndex.ts`

```ts
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 100,
  overlay: 1000,
  modal: 1100,
  toast: 1200,
} as const
```

---

## 10) `packages/design-system/src/tokens/motion.ts`

```ts
export const motion = {
  duration: {
    fast: 120,
    normal: 180,
    slow: 240,
  },
  easing: {
    standard: 'ease',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  },
} as const
```

---

## 11) `packages/design-system/src/tokens/index.ts`

```ts
export * from './color'
export * from './spacing'
export * from './radius'
export * from './shadow'
export * from './border'
export * from './layout'
export * from './typography'
export * from './icon'
export * from './zIndex'
export * from './motion'
```

---

## 12) `packages/design-system/src/themes/light.ts`

```ts
import { rawColors } from '../tokens/color'

export const lightTheme = {
  background: {
    page: rawColors.gray[0],
    surface: rawColors.gray[0],
    subtle: rawColors.gray[5],
    elevated: rawColors.gray[0],
    overlay: 'rgba(0,0,0,0.4)',
  },

  text: {
    primary: rawColors.gray[90],
    secondary: rawColors.gray[60],
    muted: rawColors.gray[40],
    inverse: rawColors.gray[0],
    link: rawColors.link[50],
  },

  border: {
    default: rawColors.gray[10],
    subtle: rawColors.gray[5],
    strong: rawColors.gray[20],
  },

  action: {
    primary: {
      bg: rawColors.gray[90],
      fg: rawColors.gray[0],
      hoverBg: rawColors.gray[80],
      pressedBg: rawColors.gray[100],
      disabledBg: rawColors.gray[10],
      disabledFg: rawColors.gray[30],
    },

    secondary: {
      bg: rawColors.gray[0],
      fg: rawColors.gray[90],
      border: rawColors.gray[20],
    },

    ghost: {
      bg: 'transparent',
      fg: rawColors.gray[90],
    },

    link: {
      bg: 'transparent',
      fg: rawColors.link[50],
    },
  },

  status: {
    success: {
      bg: rawColors.success[50],
      fg: rawColors.gray[100],
    },
    warning: {
      bg: rawColors.warning[50],
      fg: rawColors.gray[0],
    },
    attention: {
      bg: rawColors.attention[50],
      fg: rawColors.gray[100],
    },
  },

  brand: {
    primary: rawColors.brand.home2,
    accent: rawColors.brand.homeAccent,
    heroBlue: rawColors.brand.home1,
    editorial: rawColors.brand.home3,
  },
} as const

export type LightTheme = typeof lightTheme
```

---

## 13) `packages/design-system/src/themes/index.ts`

```ts
export * from './light'
```

---

## 14) `packages/design-system/src/utils/responsive.ts`

```ts
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const

export type Breakpoint = keyof typeof breakpoints
```

---

## 15) `packages/design-system/src/utils/iconMap.ts`

```ts
export type AppIconName =
  | 'search'
  | 'cart'
  | 'user'
  | 'heart'
  | 'star'
  | 'compare'
  | 'play'
  | 'home'
  | 'menu'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'

export const iconMap: Record<AppIconName, string> = {
  search: 'SEARCH',
  cart: 'CART',
  user: 'USER',
  heart: 'HEART',
  star: 'STAR',
  compare: 'COMPARE',
  play: 'PLAY',
  home: 'HOME',
  menu: 'MENU BURGER',
  close: 'CLOSE LARGE',
  'chevron-left': 'ANGLE SMALL',
  'chevron-right': 'ANGLE SMALL',
}
```

---

## 16) `packages/design-system/src/utils/getToken.ts`

```ts
export function getToken<T extends Record<string, unknown>, K extends keyof T>(
  source: T,
  key: K,
): T[K] {
  return source[key]
}
```

---

## 17) `packages/design-system/src/primitives/Box.tsx`

```tsx
import { View, ViewProps } from 'tamagui'

export type BoxProps = ViewProps

export function Box(props: BoxProps) {
  return <View {...props} />
}
```

---

## 18) `packages/design-system/src/primitives/Stack.tsx`

```tsx
import { YStack, YStackProps } from 'tamagui'

export type StackProps = YStackProps

export function Stack(props: StackProps) {
  return <YStack {...props} />
}
```

---

## 19) `packages/design-system/src/primitives/Text.tsx`

```tsx
import { Text as TamaguiText, TextProps as TamaguiTextProps } from 'tamagui'
import { fontFamilies, typeScale, TypeScaleToken } from '../tokens'

export type TextProps = TamaguiTextProps & {
  variant?: TypeScaleToken
  colorToken?: string
}

export function Text({
  variant = 'body1',
  color = '$color',
  ...props
}: TextProps) {
  const scale = typeScale[variant]

  return (
    <TamaguiText
      fontFamily={fontFamilies.body}
      fontSize={scale.fontSize}
      lineHeight={scale.lineHeight}
      letterSpacing={scale.letterSpacing}
      fontWeight={scale.fontWeight}
      color={color}
      {...props}
    />
  )
}
```

---

## 20) `packages/design-system/src/primitives/Heading.tsx`

```tsx
import { Text } from './Text'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export type HeadingProps = React.ComponentProps<typeof Text> & {
  level?: HeadingLevel
}

export function Heading({ level = 'h3', ...props }: HeadingProps) {
  return <Text variant={level} {...props} />
}
```

---

## 21) `packages/design-system/src/primitives/Button.tsx`

```tsx
import * as React from 'react'
import { Pressable } from 'react-native'
import { XStack } from 'tamagui'
import { Text } from './Text'
import { radius, space } from '../tokens'
import { lightTheme } from '../themes'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onPress?: () => void
}

const sizeStyles = {
  sm: { px: space[3], py: space[2], minHeight: 36 },
  md: { px: space[4], py: space[3], minHeight: 44 },
  lg: { px: space[5], py: space[4], minHeight: 52 },
} as const

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onPress,
}: ButtonProps) {
  const s = sizeStyles[size]

  const styles = {
    primary: {
      bg: disabled ? lightTheme.action.primary.disabledBg : lightTheme.action.primary.bg,
      fg: disabled ? lightTheme.action.primary.disabledFg : lightTheme.action.primary.fg,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    secondary: {
      bg: lightTheme.action.secondary.bg,
      fg: lightTheme.action.secondary.fg,
      borderWidth: 1,
      borderColor: lightTheme.action.secondary.border,
    },
    ghost: {
      bg: 'transparent',
      fg: lightTheme.action.ghost.fg,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    link: {
      bg: 'transparent',
      fg: lightTheme.action.link.fg,
      borderWidth: 0,
      borderColor: 'transparent',
    },
  }[variant]

  return (
    <Pressable disabled={disabled || loading} onPress={onPress}>
      <XStack
        alignItems="center"
        justifyContent="center"
        paddingHorizontal={s.px}
        paddingVertical={s.py}
        minHeight={s.minHeight}
        borderRadius={radius.md}
        backgroundColor={styles.bg}
        borderWidth={styles.borderWidth}
        borderColor={styles.borderColor}
      >
        <Text variant="button" color={styles.fg}>
          {loading ? 'Loading...' : children}
        </Text>
      </XStack>
    </Pressable>
  )
}
```

---

## 22) `packages/design-system/src/primitives/Card.tsx`

```tsx
import * as React from 'react'
import { YStack } from 'tamagui'
import { borders, radius, shadows, space } from '../tokens'
import { lightTheme } from '../themes'

type CardVariant = 'flat' | 'outlined' | 'elevated'

export type CardProps = {
  variant?: CardVariant
  padding?: keyof typeof space
  children: React.ReactNode
}

export function Card({
  variant = 'flat',
  padding = 4,
  children,
}: CardProps) {
  const elevated = variant === 'elevated'
  const outlined = variant === 'outlined'

  return (
    <YStack
      backgroundColor={lightTheme.background.surface}
      borderRadius={radius.md}
      padding={space[padding]}
      borderWidth={outlined ? borders.width.thin : 0}
      borderColor={outlined ? lightTheme.border.default : 'transparent'}
      {...(elevated ? shadows[3] : null)}
    >
      {children}
    </YStack>
  )
}
```

---

## 23) `packages/design-system/src/primitives/Divider.tsx`

```tsx
import { View } from 'tamagui'
import { borders } from '../tokens'

export function Divider() {
  return (
    <View
      height={1}
      backgroundColor={borders.color.default}
      width="100%"
    />
  )
}
```

---

## 24) `packages/design-system/src/primitives/Badge.tsx`

```tsx
import { XStack } from 'tamagui'
import { Text } from './Text'
import { radius, space } from '../tokens'

export type BadgeProps = {
  label: string
  backgroundColor?: string
  color?: string
}

export function Badge({
  label,
  backgroundColor = '#F2F2F2',
  color = '#1A1A1A',
}: BadgeProps) {
  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      paddingHorizontal={space[3]}
      paddingVertical={space[1]}
      borderRadius={radius.pill}
      backgroundColor={backgroundColor}
    >
      <Text variant="caption" color={color}>
        {label}
      </Text>
    </XStack>
  )
}
```

---

## 25) `packages/design-system/src/primitives/Icon.tsx`

```tsx
import { View } from 'tamagui'
import { iconSize, IconSizeToken } from '../tokens'
import { AppIconName } from '../utils/iconMap'

export type IconProps = {
  name: AppIconName
  size?: IconSizeToken
  color?: string
}

/**
 * Replace this placeholder with your actual icon renderer.
 * Example targets:
 * - lucide-react / lucide-react-native
 * - custom svg sprite
 * - imported icon pack mapped from Figma names
 */
export function Icon({
  name,
  size = 'md',
  color = '#1A1A1A',
}: IconProps) {
  const px = iconSize[size]

  return (
    <View
      width={px}
      height={px}
      backgroundColor="transparent"
      borderWidth={1}
      borderColor="transparent"
      aria-label={name}
    />
  )
}
```

---

## 26) `packages/design-system/src/primitives/Container.tsx`

```tsx
import * as React from 'react'
import { View } from 'tamagui'
import { layout } from '../tokens'

export type ContainerProps = {
  children: React.ReactNode
  maxWidth?: keyof typeof layout.pageMax
}

export function Container({
  children,
  maxWidth = 'desktopWide',
}: ContainerProps) {
  return (
    <View
      width="100%"
      maxWidth={layout.pageMax[maxWidth]}
      paddingHorizontal={layout.containerPadding.desktop}
      marginHorizontal="auto"
    >
      {children}
    </View>
  )
}
```

---

## 27) `packages/design-system/src/primitives/SectionHeader.tsx`

```tsx
import { YStack, XStack } from 'tamagui'
import { Heading } from './Heading'
import { Text } from './Text'
import { Button } from './Button'
import { space } from '../tokens'

export type SectionHeaderProps = {
  title: string
  subtitle?: string
  ctaLabel?: string
  onPressCta?: () => void
}

export function SectionHeader({
  title,
  subtitle,
  ctaLabel,
  onPressCta,
}: SectionHeaderProps) {
  return (
    <XStack
      alignItems="flex-end"
      justifyContent="space-between"
      gap={space[4]}
    >
      <YStack gap={space[2]} flex={1}>
        <Heading level="h4">{title}</Heading>
        {subtitle ? <Text variant="body2">{subtitle}</Text> : null}
      </YStack>

      {ctaLabel ? (
        <Button variant="link" onPress={onPressCta}>
          {ctaLabel}
        </Button>
      ) : null}
    </XStack>
  )
}
```

---

## 28) `packages/design-system/src/primitives/index.ts`

```ts
export * from './Box'
export * from './Stack'
export * from './Text'
export * from './Heading'
export * from './Button'
export * from './Card'
export * from './Divider'
export * from './Badge'
export * from './Icon'
export * from './Container'
export * from './SectionHeader'
```

---

## 29) `packages/design-system/src/composites/ProductCard.tsx`

```tsx
import { YStack } from 'tamagui'
import { Card, Text, Badge } from '../primitives'
import { space } from '../tokens'

export type ProductCardProps = {
  title: string
  brand?: string
  price: string
  badge?: string
}

export function ProductCard({
  title,
  brand,
  price,
  badge,
}: ProductCardProps) {
  return (
    <Card variant="outlined" padding={4}>
      <YStack gap={space[3]}>
        <YStack height={220} backgroundColor="#F2F2F2" borderRadius={12} />
        {badge ? <Badge label={badge} /> : null}
        {brand ? <Text variant="caption">{brand}</Text> : null}
        <Text variant="body2">{title}</Text>
        <Text variant="subtitle1">{price}</Text>
      </YStack>
    </Card>
  )
}
```

---

## 30) `packages/design-system/src/composites/CategoryCard.tsx`

```tsx
import { YStack } from 'tamagui'
import { Card, Heading, Text } from '../primitives'
import { space } from '../tokens'

export type CategoryCardProps = {
  title: string
  description?: string
}

export function CategoryCard({
  title,
  description,
}: CategoryCardProps) {
  return (
    <Card variant="outlined" padding={4}>
      <YStack gap={space[2]}>
        <YStack height={80} backgroundColor="#F2F2F2" borderRadius={12} />
        <Heading level="h6">{title}</Heading>
        {description ? <Text variant="body2">{description}</Text> : null}
      </YStack>
    </Card>
  )
}
```

---

## 31) `packages/design-system/src/composites/BrandCard.tsx`

```tsx
import { YStack } from 'tamagui'
import { Card, Heading } from '../primitives'
import { space } from '../tokens'

export type BrandCardProps = {
  title: string
}

export function BrandCard({ title }: BrandCardProps) {
  return (
    <Card variant="outlined" padding={4}>
      <YStack gap={space[3]}>
        <YStack height={120} backgroundColor="#F2F2F2" borderRadius={12} />
        <Heading level="h6">{title}</Heading>
      </YStack>
    </Card>
  )
}
```

---

## 32) `packages/design-system/src/composites/Banner.tsx`

```tsx
import { YStack } from 'tamagui'
import { Heading, Text, Button } from '../primitives'
import { radius, space } from '../tokens'

export type BannerProps = {
  title: string
  description?: string
  ctaLabel?: string
  onPressCta?: () => void
  backgroundColor?: string
}

export function Banner({
  title,
  description,
  ctaLabel,
  onPressCta,
  backgroundColor = '#F2F2F2',
}: BannerProps) {
  return (
    <YStack
      backgroundColor={backgroundColor}
      borderRadius={radius.lg}
      padding={space[6]}
      gap={space[4]}
    >
      <Heading level="h3">{title}</Heading>
      {description ? <Text variant="body1">{description}</Text> : null}
      {ctaLabel ? <Button onPress={onPressCta}>{ctaLabel}</Button> : null}
    </YStack>
  )
}
```

---

## 33) `packages/design-system/src/composites/TestimonialCard.tsx`

```tsx
import { YStack } from 'tamagui'
import { Card, Text, Heading } from '../primitives'
import { space } from '../tokens'

export type TestimonialCardProps = {
  author: string
  quote: string
}

export function TestimonialCard({
  author,
  quote,
}: TestimonialCardProps) {
  return (
    <Card variant="outlined" padding={4}>
      <YStack gap={space[3]}>
        <Text variant="body1">“{quote}”</Text>
        <Heading level="h6">{author}</Heading>
      </YStack>
    </Card>
  )
}
```

---

## 34) `packages/design-system/src/composites/index.ts`

```ts
export * from './ProductCard'
export * from './CategoryCard'
export * from './BrandCard'
export * from './Banner'
export * from './TestimonialCard'
```

---

## 35) `packages/design-system/src/index.ts`

```ts
export * from './tokens'
export * from './themes'
export * from './utils/responsive'
export * from './utils/iconMap'
export * from './primitives'
export * from './composites'
```

---

## Optional Tamagui integration example

If your repo already has a Tamagui config, map these token values there.

Example starter:

```ts
import { createTamagui } from 'tamagui'
import { space, radius, zIndex } from './packages/design-system/src/tokens'

export const config = createTamagui({
  tokens: {
    space,
    radius,
    zIndex,
    size: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 32,
      8: 40,
      9: 48,
      10: 56,
    },
  },
  themes: {
    light: {
      bg: '#FFFFFF',
      color: '#1A1A1A',
      borderColor: '#E5E5E5',
    },
  },
})
```

Do not treat this snippet as final if a Tamagui config already exists in the repo. Merge carefully into the existing token/theme structure.

---

## Required follow-up tasks for Codex

### Task 1 — create files
Create all files exactly as listed above.

### Task 2 — wire exports
Ensure `packages/design-system/src/index.ts` exports everything needed by `apps/next` and `apps/expo`.

### Task 3 — replace placeholder primitives where needed
If the repo already has a base primitive layer, merge these APIs into the existing primitives instead of duplicating them.

### Task 4 — connect fonts
Wire `Urbanist` and optionally `Jost` into both web and Expo app font loading.

### Task 5 — connect real icon renderer
Replace the `Icon` placeholder with the repo’s actual icon system.

### Task 6 — add tests
Add basic smoke tests for:
- Button variants
- Card variants
- SectionHeader rendering
- token imports
- theme object integrity

---

## Acceptance criteria

Implementation is complete when:

1. `packages/design-system` exists and exports a coherent shared API
2. No primitive component hardcodes random spacing/hex values beyond temporary placeholders explicitly noted
3. Light theme is usable on web and app
4. Buttons, Cards, Text, Heading, Container, and SectionHeader render without platform-specific breakage
5. Storefront sections can consume these primitives/composites without new token duplication
6. Fonts and icons are wired through a shared abstraction
7. Existing homepage sections can gradually migrate to the new shared system

---

## Important notes

### About exactness
The structure and visible token families are grounded in the inspected Figma design-system page. Some token ramps and typography metrics may need final adjustment after direct extraction from Figma because the MCP plan hit tool limits.

### About branding
This file should be treated as a **foundation implementation**, not the final brand language for Real Cosmetics unless you explicitly decide to adopt the placeholder palette.

### About future dark mode
Do not implement dark mode now. Keep theme boundaries clean so dark mode can be added later with a separate `dark.ts`.

---

## Suggested next step after file creation

After these files are added, the next Codex task should be:

1. map the existing homepage sections to these primitives/composites
2. normalize repeated section shells using `Container` + `SectionHeader`
3. replace hardcoded spacing/colors in product rails and banners
4. create real icon bindings
5. align typography with actual loaded fonts

