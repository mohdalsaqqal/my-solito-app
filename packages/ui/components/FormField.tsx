import { ReactNode } from 'react'
import { View, ViewStyle } from 'react-native'
import { spacing } from '@real/tokens'
import { Text } from '../primitives/Text'

type FormFieldProps = {
  label: string
  children: ReactNode
  hint?: string
  error?: string
  required?: boolean
  style?: ViewStyle
}

export function FormField({
  label,
  children,
  hint,
  error,
  required = false,
  style,
}: FormFieldProps) {
  return (
    <View style={[{ gap: spacing.xxs }, style]}>
      <Text variant="label" tone="primary" weight="600">
        {label}
        {required && (
          <Text variant="label" tone="danger"> *</Text>
        )}
      </Text>

      {children}

      {hint && !error && (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      )}

      {error && (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      )}
    </View>
  )
}
