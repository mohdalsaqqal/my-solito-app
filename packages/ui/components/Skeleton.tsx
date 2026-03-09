import { ReactNode } from 'react'
import { ViewStyle } from 'react-native'
import { MotiView } from 'moti'
import { colors, radius } from '@real/tokens'

type SkeletonProps = {
  width: number | `${number}%`
  height: number
  radius?: keyof typeof radius
  style?: ViewStyle
}

function SkeletonItem({ width, height, radius: radiusKey = 'xs', style }: SkeletonProps) {
  return (
    <MotiView
      from={{ opacity: 1 }}
      animate={{ opacity: 0.4 }}
      transition={{
        type: 'timing',
        duration: 800,
        loop: true,
        repeatReverse: true,
      }}
      style={[
        {
          width,
          height,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: radius[radiusKey],
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
