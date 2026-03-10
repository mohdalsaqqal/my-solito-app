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
        <Skeleton width={20} height={20} radius="sm" />
        {label && <Skeleton width={80} height={14} radius="sm" />}
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
          <Text variant="caption" tone="inverse" weight="700">
            ✓
          </Text>
        )}
      </View>

      {label && (
        <Text variant="body" tone={disabled ? 'muted' : 'default'}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}
