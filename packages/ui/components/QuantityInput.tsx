import React from 'react'
import { Pressable, View, ViewStyle } from 'react-native'
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

export const QuantityInput = React.memo(function QuantityInput({
  value,
  min = 1,
  max = 99,
  onChange,
  loading = false,
  disabled = false,
  style,
}: QuantityInputProps) {
  if (loading) {
    return <Skeleton width={112} height={40} radius="lg" style={style} />
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
        <Text variant="body" tone="primary" weight="700">−</Text>
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
        <Text variant="body" tone={disabled ? 'muted' : 'default'} weight="600">
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
        <Text variant="body" tone="primary" weight="700">+</Text>
      </Pressable>
    </View>
  )
})
