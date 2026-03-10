import { ReactNode } from 'react'
import { Pressable, View, ViewStyle } from 'react-native'
import { borderWidth, colors, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'

type AlertTone = 'success' | 'warning' | 'error' | 'info'

type AlertProps = {
  tone?: AlertTone
  title?: string
  children: ReactNode
  onDismiss?: () => void
  style?: ViewStyle
}

// Subtle backgrounds — derived from status.ts subtle values (HSL strings, not hex)
const subtleBg: Record<AlertTone, string> = {
  success: 'hsl(144 45% 94%)',
  warning: 'hsl(40 100% 95%)',
  error:   'hsl(355 70% 95%)',
  info:    'hsl(214 78% 95%)',
}

const accentColor: Record<AlertTone, string> = {
  success: colors.success,
  warning: colors.warning,
  error:   colors.error,
  info:    colors.info,
}

const textTone: Record<AlertTone, 'success' | 'warning' | 'danger' | 'info'> = {
  success: 'success',
  warning: 'warning',
  error:   'danger',
  info:    'info',
}

export function Alert({ tone = 'info', title, children, onDismiss, style }: AlertProps) {
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
          borderStartColor: accentColor[tone],
          borderWidth: borderWidth.thin,
          borderColor: accentColor[tone],
          backgroundColor: subtleBg[tone],
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
}
