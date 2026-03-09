import { ReactNode } from 'react'
import { View, ViewProps } from 'react-native'
import { borderWidth, colors, radius, shadows, spacing } from '@real/tokens'

type CardProps = ViewProps & {
  children?: ReactNode
  variant?: 'flat' | 'raised'
  tone?: 'default' | 'subtle'
  borderTone?: 'border' | 'divider'
  radiusKey?: keyof typeof radius
}

export function Card({
  children,
  variant = 'flat',
  tone = 'default',
  borderTone = 'border',
  radiusKey = 'md',
  style,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: tone === 'subtle' ? colors.backgroundSecondary : colors.surface,
          borderColor: borderTone === 'divider' ? colors.divider : colors.border,
          borderWidth: borderWidth.thin,
          borderRadius: radius[radiusKey],
          padding: spacing.md,
          ...(variant === 'raised' ? shadows.sm : null),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}
