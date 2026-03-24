import { ReactNode } from 'react'
import { View, ViewProps } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'

type BadgeProps = ViewProps & {
  children?: ReactNode
  tone?: 'neutral' | 'accent' | 'outline' | 'ink' | 'warning' | 'premium'
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function Badge({ children, tone = 'neutral', size = 'sm', disabled, style, ...props }: BadgeProps) {
  const backgroundColor =
    tone === 'accent'
      ? colors.urgencyBadge
      : tone === 'ink'
        ? colors.inkBlack
        : tone === 'warning'
          ? colors.warning
          : tone === 'premium'
            ? colors.goldSubtle
          : tone === 'outline'
            ? colors.surfaceMuted
            : colors.backgroundSecondary
  const borderColor =
    tone === 'outline'
      ? 'transparent'
      : tone === 'accent'
        ? colors.urgencyBadge
        : tone === 'ink'
          ? colors.inkBlack
          : tone === 'warning'
            ? colors.warning
            : tone === 'premium'
              ? colors.goldPrimary
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

  return (
    <View
      accessibilityState={{ disabled }}
      style={[
        {
          minHeight,
          paddingHorizontal,
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
      <Text variant={size === 'md' ? 'label' : 'caption'} tone={textTone} style={{ textTransform: 'uppercase' }}>
        {children}
      </Text>
    </View>
  )
}
