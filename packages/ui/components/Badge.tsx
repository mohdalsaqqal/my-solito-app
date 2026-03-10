import { ReactNode } from 'react'
import { View, ViewProps } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'

type BadgeProps = ViewProps & {
  children?: ReactNode
  tone?: 'neutral' | 'accent' | 'outline'
  disabled?: boolean
}

export function Badge({ children, tone = 'neutral', disabled, style, ...props }: BadgeProps) {
  const backgroundColor =
    tone === 'accent' ? colors.brandPrimary : tone === 'outline' ? 'transparent' : colors.backgroundSecondary
  const borderColor = tone === 'outline' ? colors.border : tone === 'accent' ? colors.brandPrimary : 'transparent'
  const textTone = tone === 'accent' ? 'inverse' : tone === 'outline' ? 'default' : 'muted'

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
      <Text variant='caption' tone={textTone}>
        {children}
      </Text>
    </View>
  )
}
