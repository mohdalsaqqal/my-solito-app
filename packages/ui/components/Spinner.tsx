import React from 'react'
import { ActivityIndicator, View, ViewStyle } from 'react-native'
import { colors, spacing } from '@real/tokens'
import { useThemeColors } from '../responsive'

type SpinnerTone = 'primary' | 'inverse' | 'muted'
type SpinnerSize = 'sm' | 'md' | 'lg'

type SpinnerProps = {
  tone?: SpinnerTone
  size?: SpinnerSize
  style?: ViewStyle
}

// Map to native ActivityIndicator sizes
const nativeSize: Record<SpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
}

// Constrain the container so sm/md are visually distinct
const containerSize: Record<SpinnerSize, number> = {
  sm: spacing['24'],
  md: spacing['32'],
  lg: spacing['48'],
}

export const Spinner = React.memo(function Spinner({ tone = 'primary', size = 'md', style }: SpinnerProps) {
  const c = useThemeColors()
  const resolvedColor =
    tone === 'primary' ? c.brandPrimary : tone === 'inverse' ? c.white : c.textMuted

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
      <ActivityIndicator color={resolvedColor} size={nativeSize[size]} />
    </View>
  )
})
