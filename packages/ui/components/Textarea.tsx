import { TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing, typography } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'

type TextareaProps = Omit<TextInputProps, 'multiline' | 'style'> & {
  rows?: number
  error?: string
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
}

export function Textarea({
  rows = 4,
  error,
  disabled = false,
  loading = false,
  style,
  ...props
}: TextareaProps) {
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
          borderColor: error ? colors.error : colors.border,
          borderRadius: radius.md,
          backgroundColor: disabled ? colors.backgroundSecondary : colors.background,
          color: disabled ? colors.textMuted : colors.text,
          fontSize: typography.bodyMd,
          opacity: disabled ? opacity.disabled : 1,
        }}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && (
        <Text variant="caption" tone="danger" style={{ marginTop: spacing.xxs }}>
          {error}
        </Text>
      )}
    </View>
  )
}
