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
  muted:   colors.textMuted,
}

// Map to native ActivityIndicator sizes
const nativeSize: Record<SpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
}

// Constrain the container so sm/md are visually distinct
const containerSize: Record<SpinnerSize, number> = {
  sm: spacing['24'],  // 24px container
  md: spacing['32'],  // 32px container
  lg: spacing['48'],  // 48px container
}

export function Spinner({ tone = 'primary', size = 'md', style }: SpinnerProps) {
  return (
    <View
      style={[
        {
          width: containerSize[size],
          height: containerSize[size],
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <ActivityIndicator color={spinnerColor[tone]} size={nativeSize[size]} />
    </View>
  )
}
