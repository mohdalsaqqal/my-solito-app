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

// Text tone map — uses Text primitive's tone prop to avoid inline color styles
type TextTone = 'inverse' | 'default' | 'muted'

const stockConfig: Record<
  StockLevel,
  { backgroundColor: string; textTone: TextTone; defaultLabel: string }
> = {
  'in-stock': {
    backgroundColor: colors.success,
    textTone: 'inverse',
    defaultLabel: 'In Stock',
  },
  'low-stock': {
    backgroundColor: colors.warning,
    textTone: 'default',
    defaultLabel: 'Low Stock',
  },
  'out-of-stock': {
    backgroundColor: colors.backgroundSecondary,
    textTone: 'muted',
    defaultLabel: 'Out of Stock',
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
    return <Skeleton width={80} height={24} radius="full" style={style} />
  }

  const config = stockConfig[level]
  const label =
    level === 'low-stock' && quantity !== undefined
      ? `Only ${quantity} left`
      : config.defaultLabel

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
      <Text variant="caption" tone={config.textTone} weight="600">
        {label}
      </Text>
    </View>
  )
}
