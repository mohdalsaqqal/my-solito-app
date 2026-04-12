import React from 'react'
import { TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import { borderWidth, opacity, radius, spacing, typography } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'
import { useThemeColors } from '../responsive'

type TextareaProps = Omit<TextInputProps, 'multiline' | 'style'> & {
  rows?: number
  error?: string
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
}

export const Textarea = React.memo(function Textarea({
  rows = 4,
  error,
  disabled = false,
  loading = false,
  style,
  ...props
}: TextareaProps) {
  const c = useThemeColors()

  if (loading) {
    const height = rows * 24 + spacing.md * 2
    return <Skeleton width="100%" height={height} radius="md" style={style} />
  }

  return (
    <View style={[{ width: '100%' }, style]}>
      <TextInput
        multiline
        numberOfLines={rows}
        editable={!disabled}
        textAlignVertical="top"
        accessibilityState={{ disabled }}
        style={{
          minHeight: rows * 24,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderWidth: borderWidth.thin,
          borderColor: error ? c.error : c.border,
          borderRadius: radius.md,
          backgroundColor: disabled ? c.backgroundSecondary : c.background,
          color: disabled ? c.textMuted : c.text,
          fontSize: typography.bodyMd,
          opacity: disabled ? opacity.disabled : 1,
        }}
        placeholderTextColor={c.textMuted}
        {...props}
      />
      {error && (
        <Text variant="caption" tone="danger" style={{ marginTop: spacing.xxs }}>
          {error}
        </Text>
      )}
    </View>
  )
})
