import { ActivityIndicator, View, ViewStyle } from 'react-native'
import { colors, spacing } from '@real/tokens'

type SpinnerTone = 'primary' | 'inverse' | 'muted'
type SpinnerSize = 'sm' | 'md' | 'lg'

type SpinnerProps = {
  tone?: SpinnerTone
  size?: SpinnerSize
  style?: ViewStyle
}

const spinnerColor: Record<SpinnerTone, string> = {
  primary: colors.brandPrimary,
  inverse: colors.white,
  muted: colors.textMuted,
}

const spinnerSize: Record<SpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
}

export function Spinner({ tone = 'primary', size = 'md', style }: SpinnerProps) {
  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.sm,
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <ActivityIndicator color={spinnerColor[tone]} size={spinnerSize[size]} />
    </View>
  )
}
