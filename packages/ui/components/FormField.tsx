import React, { ReactNode } from 'react'
import { View, ViewStyle } from 'react-native'
import { spacing } from '@real/tokens'
import { Text } from '../primitives/Text'

type FormFieldProps = {
  label: string
  children: ReactNode
  hint?: string
  error?: string
  required?: boolean
  tone?: 'default' | 'trust' | 'admin'
  style?: ViewStyle
}

export const FormField = React.memo(function FormField({
  label,
  children,
  hint,
  error,
  required = false,
  tone = 'default',
  style,
}: FormFieldProps) {
  const labelTone = tone === 'trust' ? 'default' : tone === 'admin' ? 'muted' : 'primary'
  const hintTone = tone === 'admin' ? 'default' : 'muted'

  return (
    <View style={[{ gap: spacing.xxs }, style]}>
      <Text variant="label" tone={labelTone} weight="600">
        {label}
        {required && (
          <Text variant="label" tone="danger"> *</Text>
        )}
      </Text>

      {children}

      {hint && !error && (
        <Text variant="caption" tone={hintTone}>
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
})
