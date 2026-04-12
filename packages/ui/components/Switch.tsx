import React from 'react'
import { Pressable, View, ViewStyle } from 'react-native'
import { opacity, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'
import { useThemeColors } from '../responsive'

const TRACK_WIDTH = 44
const TRACK_HEIGHT = 24
const THUMB_SIZE = 18
const THUMB_OFFSET = (TRACK_HEIGHT - THUMB_SIZE) / 2
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_OFFSET * 2

type SwitchProps = {
  value?: boolean
  label?: string
  disabled?: boolean
  loading?: boolean
  onChange?: (value: boolean) => void
  style?: ViewStyle
}

export const Switch = React.memo(function Switch({
  value = false,
  label,
  disabled = false,
  loading = false,
  onChange,
  style,
}: SwitchProps) {
  const c = useThemeColors()

  if (loading) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, style]}>
        <Skeleton width={TRACK_WIDTH} height={TRACK_HEIGHT} radius="full" />
        {label && <Skeleton width={80} height={14} radius="sm" />}
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
          backgroundColor: value ? c.brandPrimary : c.border,
          justifyContent: 'center',
          paddingHorizontal: THUMB_OFFSET,
        }}
      >
        <View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: radius.full,
            backgroundColor: c.white,
            transform: [{ translateX: value ? THUMB_TRAVEL : 0 }],
          }}
        />
      </View>

      {label && (
        <Text variant="body" tone={disabled ? 'muted' : 'default'}>
          {label}
        </Text>
      )}
    </Pressable>
  )
})
