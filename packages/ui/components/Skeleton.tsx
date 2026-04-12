import { ReactNode } from 'react'
import { View, ViewStyle } from 'react-native'
import { colors, opacity, radius } from '@real/tokens'
import { useThemeColors } from '../responsive'

type SkeletonProps = {
  width: number | `${number}%`
  height: number
  radius?: keyof typeof radius
  style?: ViewStyle
}

function SkeletonItem({ width, height, radius: radiusKey = 'xs', style }: SkeletonProps) {
  const c = useThemeColors()
  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: c.backgroundSecondary,
          borderRadius: radius[radiusKey],
          opacity: opacity.disabled,
        },
        style,
      ]}
    />
  )
}

function SkeletonGroup({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

export const Skeleton = Object.assign(SkeletonItem, {
  Group: SkeletonGroup,
})
