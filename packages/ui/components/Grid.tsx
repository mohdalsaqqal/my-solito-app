"use client"

import { Children, ReactNode } from 'react'
import { View } from 'react-native'
import { grid, spacing } from '@real/tokens'
import { useBreakpoint } from '../responsive'

type GridProps = {
  children?: ReactNode
  mode?: 'product' | 'brand'
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
  gap?: number
}

export function Grid({
  children,
  mode = 'product',
  columns = mode === 'brand' ? grid.brandColumns : grid.productColumns,
  gap = spacing.md,
}: GridProps) {
  const profile = useBreakpoint()
  const columnCount =
    profile.breakpoint === 'mobile'
      ? columns.mobile
      : profile.breakpoint === 'tablet'
        ? columns.tablet
        : columns.desktop

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -(gap / 2),
      }}
    >
      {Children.map(children, (child, index) => (
        <View
          key={index}
          style={{
            width: `${100 / columnCount}%`,
            paddingHorizontal: gap / 2,
            marginBottom: gap,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  )
}
