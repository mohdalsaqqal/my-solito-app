'use client'

import React, { ReactNode, useEffect, useRef } from 'react'
import { ScrollView } from 'react-native'
import { spacing } from '@real/tokens'
import { Box, Text } from '../primitives'
import { Card } from './Card'
import { Button } from './Button'

type HorizontalRailStateProps = {
  loading?: boolean
  error?: string | null
  isEmpty?: boolean
  onRetry?: () => void
  emptyMessage: string
  loadingCount: number
  loadingItem: (key: number) => ReactNode
  children: ReactNode
  autoplay?: boolean
  autoplayMs?: number
  itemCount?: number
  stepDistance?: number
}

export const HorizontalRailState = React.memo(function HorizontalRailState({
  loading = false,
  error,
  isEmpty = false,
  onRetry,
  emptyMessage,
  loadingCount,
  loadingItem,
  children,
  autoplay = false,
  autoplayMs = 4200,
  itemCount = 0,
  stepDistance = 240,
}: HorizontalRailStateProps) {
  const railRef = useRef<ScrollView | null>(null)
  const offsetRef = useRef(0)
  const viewportRef = useRef(0)
  const contentRef = useRef(0)

  useEffect(() => {
    if (!autoplay || itemCount <= 1) return
    const timer = setInterval(() => {
      const maxOffset = Math.max(0, contentRef.current - viewportRef.current)
      const next = offsetRef.current + stepDistance
      const target = next > maxOffset ? 0 : next
      railRef.current?.scrollTo({ x: target, animated: true })
      offsetRef.current = target
    }, Math.max(1800, autoplayMs))

    return () => clearInterval(timer)
  }, [autoplay, autoplayMs, itemCount, stepDistance])

  if (loading) {
    return (
      <ScrollView
        ref={railRef}
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}
      >
        {Array.from({ length: loadingCount }, (_, key) => loadingItem(key))}
      </ScrollView>
    )
  }

  if (error) {
    return (
      <Card tone='subtle' radiusKey='xs'>
        <Box style={{ gap: spacing.sm }}>
          <Text tone='danger' variant='bodySm'>
            {error}
          </Text>
          <Button onPress={onRetry} size='sm' variant='ghost'>
            Retry
          </Button>
        </Box>
      </Card>
    )
  }

  if (isEmpty) {
    return (
      <Card tone='subtle' radiusKey='xs'>
        <Text tone='muted'>{emptyMessage}</Text>
      </Card>
    )
  }

  return (
    <ScrollView
      ref={railRef}
      horizontal
      nestedScrollEnabled
      directionalLockEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.xs }}
      onLayout={(event) => {
        viewportRef.current = event.nativeEvent.layout.width
      }}
      onContentSizeChange={(width) => {
        contentRef.current = width
      }}
      onMomentumScrollEnd={(event) => {
        offsetRef.current = event.nativeEvent.contentOffset?.x ?? 0
      }}
    >
      {children}
    </ScrollView>
  )
})
