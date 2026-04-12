import { ReactNode } from 'react'
import { ViewProps } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Badge as ReusableBadge } from '../reusables/badge'
import { useThemeColors } from '../responsive'

// Phase 2 migration layer: keep existing badge tone/size props stable while
// routing through the RNR badge primitive. Avoid inventing new badge-only tones
// that do not belong in the target RNR contract set.
type BadgeProps = ViewProps & {
  children?: ReactNode
  tone?: 'neutral' | 'accent' | 'outline' | 'ink' | 'warning' | 'premium'
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function Badge({ children, tone = 'neutral', size = 'sm', disabled, style, ...props }: BadgeProps) {
  const c = useThemeColors()
  const backgroundColor =
    tone === 'accent'
      ? c.commercePrimary  // Burgundy for sale/urgency badges - more premium than bright red
      : tone === 'ink'
        ? c.inkBlack
        : tone === 'warning'
          ? c.warning
          : tone === 'premium'
            ? c.amberSubtle
          : tone === 'outline'
            ? c.surfaceMuted
            : c.backgroundSecondary
  const borderColor =
    tone === 'outline'
      ? 'transparent'
      : tone === 'accent'
        ? c.commercePrimary  // Match burgundy
        : tone === 'ink'
          ? c.inkBlack
          : tone === 'warning'
            ? c.warning
            : tone === 'premium'
              ? c.coralPrimary
            : 'transparent'
  const textTone =
    tone === 'accent' || tone === 'ink'
      ? 'inverse'
      : tone === 'warning'
        ? 'default'
        : tone === 'premium'
          ? 'default'
        : tone === 'outline'
          ? 'default'
          : 'muted'
  const minHeight = size === 'md' ? spacing['32'] : spacing['24']
  const paddingHorizontal = size === 'md' ? spacing['12'] : spacing.sm

  // Distinctive border radius + padding by tone for visual differentiation
  const borderRadius =
    tone === 'accent'
      ? radius.sm  // Sharp square for urgency/sale badges
      : tone === 'ink'
        ? radius.md  // Rounded square for brand/bestseller
        : tone === 'warning'
          ? radius.sm  // Sharp square for warnings
          : radius.full  // Pill for neutral/outline/premium
  
  const extraPaddingVertical = tone === 'accent' ? spacing['4'] : spacing.none

  return (
    <ReusableBadge
      accessibilityState={{ disabled }}
      variant={
        tone === 'accent'
          ? 'default'
          : tone === 'outline'
            ? 'outline'
            : tone === 'neutral'
              ? 'secondary'
              : 'secondary'
      }
      style={[
        {
          minHeight,
          paddingHorizontal,
          paddingVertical: extraPaddingVertical,
          borderRadius,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderWidth: borderWidth.thin,
          borderColor,
          alignSelf: 'flex-start',
          opacity: disabled ? opacity.medium : 1,
          // Slightly bolder presence for accent badges
          ...(tone === 'accent' ? { shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 } : {}),
        },
        style,
      ]}
      {...props}
    >
      <Text variant={size === 'md' ? 'label' : 'caption'} tone={textTone} weight='800' style={{ textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {children}
      </Text>
    </ReusableBadge>
  )
}
