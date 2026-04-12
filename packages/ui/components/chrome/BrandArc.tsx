import React from 'react'
import { View, ViewStyle } from 'react-native'
import { colors } from '@real/tokens'
import { useThemeColors } from '../../responsive'

type BrandArcProps = {
  width?: number
  height?: number
  color?: string
  opacity?: number
  style?: ViewStyle
}

export const BrandArc = React.memo(function BrandArc({
  width = 180,
  height = 16,
  color,
  opacity = 0.6,
  style,
}: BrandArcProps) {
  const c = useThemeColors()
  const resolvedColor = color ?? c.brandPrimary
  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -height,
          height: height * 2,
          borderWidth: 1.5,
          borderColor: resolvedColor,
          borderRadius: width,
          opacity,
        }}
      />
    </View>
  )
})
