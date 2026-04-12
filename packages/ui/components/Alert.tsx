import React, { ReactNode } from 'react'
import { Pressable, View, ViewStyle } from 'react-native'
import { borderWidth, radius, spacing, statusTone } from '@real/tokens'
import { Text } from '../primitives/Text'
import { useThemeColors } from '../responsive'

type AlertTone = 'success' | 'warning' | 'error' | 'info'

type AlertProps = {
  tone?: AlertTone
  title?: string
  children: ReactNode
  onDismiss?: () => void
  style?: ViewStyle
}

const textTone: Record<AlertTone, 'success' | 'warning' | 'danger' | 'info'> = {
  success: 'success',
  warning: 'warning',
  error:   'danger',
  info:    'info',
}

export const Alert = React.memo(function Alert({ tone = 'info', title, children, onDismiss, style }: AlertProps) {
  const c = useThemeColors()
  const accent =
    tone === 'success' ? c.success : tone === 'warning' ? c.warning : tone === 'error' ? c.error : c.info
  const bg =
    tone === 'success' ? statusTone.success.subtle : tone === 'warning' ? statusTone.warning.subtle : tone === 'error' ? statusTone.error.subtle : statusTone.info.subtle

  return (
    <View
      accessibilityRole="alert"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.md,
          borderStartWidth: 3,
          borderStartColor: accent,
          borderWidth: borderWidth.thin,
          borderColor: accent,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, gap: spacing.xxs }}>
        {title && (
          <Text variant="body" tone={textTone[tone]} weight="600">
            {title}
          </Text>
        )}
        <Text variant="body" tone="default">
          {children}
        </Text>
      </View>

      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          accessibilityLabel="Dismiss alert"
          accessibilityRole="button"
          style={{
            padding: spacing.xxs,
          }}
        >
          <Text variant="caption" tone="muted">✕</Text>
        </Pressable>
      )}
    </View>
  )
})
