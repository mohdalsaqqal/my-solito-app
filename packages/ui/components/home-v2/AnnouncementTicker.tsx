import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Platform } from 'react-native'
import { borderWidth, colors, spacing, zIndex } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import { Button as ReusableButton } from '../../reusables/button'

export type AnnouncementTickerItem = {
  id: string
  label: string
  href?: string
  badgeLabel?: string
  ctaLabel?: string
}

type AnnouncementTickerProps = {
  items: AnnouncementTickerItem[]
  speedMs?: number
  variant?: 'utility' | 'campaign'
  onPressItem?: (href?: string) => void
}

function TickerSequence({
  items,
  onPressItem,
  onMeasure,
}: {
  items: AnnouncementTickerItem[]
  onPressItem?: (href?: string) => void
  onMeasure?: (width: number) => void
}) {
  return (
    <Box
      onLayout={(event) => onMeasure?.(event.nativeEvent.layout.width)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {items.map((item, index) => (
        <Box
          key={item.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.sm,
          }}
        >
          <ReusableButton
            onPress={item.href ? () => onPressItem?.(item.href) : undefined}
            variant='link'
            size='sm'
            style={{ paddingHorizontal: 0, minHeight: spacing['24'] }}
          >
            <Text variant='nav' tone='muted' weight='500' style={item.href ? { textDecorationLine: 'underline' } : undefined}>
              {item.label}
            </Text>
          </ReusableButton>
          {index < items.length - 1 ? (
            <Text
              variant='nav'
              tone='muted'
              style={{
                marginHorizontal: spacing.sm,
              }}
            >
              {'·'}
            </Text>
          ) : null}
          <Box style={{ width: spacing.lg }} />
        </Box>
      ))}
    </Box>
  )
}

export const AnnouncementTicker = React.memo(function AnnouncementTicker({
  items,
  speedMs = 22000,
  onPressItem,
}: AnnouncementTickerProps) {
  const [trackWidth, setTrackWidth] = useState(0)
  const [paused, setPaused] = useState(false)
  const translateX = useRef(new Animated.Value(0)).current
  const isWeb = Platform.OS === 'web'
  const supportsNativeDriver = !isWeb
  const prefersReducedMotion = usePrefersReducedMotion()

  const validItems = useMemo(() => items.filter((item) => item.label.trim().length > 0), [items])

  useEffect(() => {
    if (validItems.length === 0 || trackWidth <= 0 || paused || prefersReducedMotion) {
      return
    }

    translateX.setValue(0)
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -trackWidth,
        duration: Math.max(12000, speedMs),
        easing: Easing.linear,
        useNativeDriver: supportsNativeDriver,
      })
    )

    loop.start()
    return () => loop.stop()
  }, [paused, speedMs, supportsNativeDriver, trackWidth, translateX, validItems.length, prefersReducedMotion])

  if (validItems.length === 0) {
    return null
  }

  if (prefersReducedMotion) {
    return (
      <Box
        role='marquee'
        aria-label='Announcements'
        aria-live='off'
        aria-atomic='false'
        style={{
          borderTopWidth: borderWidth.thin,
          borderBottomWidth: borderWidth.thin,
          borderColor: colors.border,
          backgroundColor: colors.background,
          zIndex: zIndex.base,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          paddingVertical: spacing.sm,
        }}
      >
        {validItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <ReusableButton
              onPress={item.href ? () => onPressItem?.(item.href) : undefined}
              variant='link'
              size='sm'
              style={{ paddingHorizontal: 0, minHeight: spacing['24'] }}
            >
              <Text variant='nav' tone='muted' weight='500' style={item.href ? { textDecorationLine: 'underline' } : undefined}>
                {item.label}
              </Text>
            </ReusableButton>
            {index < validItems.length - 1 ? (
              <Text variant='nav' tone='muted' style={{ marginHorizontal: spacing.sm }}>
                {'·'}
              </Text>
            ) : null}
          </React.Fragment>
        ))}
      </Box>
    )
  }

  return (
    <Box
      role='marquee'
      aria-label='Announcements'
      aria-live='off'
      aria-atomic='false'
      style={{
        borderTopWidth: borderWidth.thin,
        borderBottomWidth: borderWidth.thin,
        borderColor: colors.border,
        overflow: 'hidden',
        backgroundColor: colors.background,
        zIndex: zIndex.base,
      }}
      onPointerEnter={isWeb ? () => setPaused(true) : undefined}
      onPointerLeave={isWeb ? () => setPaused(false) : undefined}
      onFocus={isWeb ? () => setPaused(true) : undefined}
      onBlur={isWeb ? () => setPaused(false) : undefined}
    >
      <Animated.View
        style={{
          flexDirection: 'row',
          width: 'max-content',
          transform: [{ translateX }],
        } as any}
      >
        <TickerSequence items={validItems} onPressItem={onPressItem} onMeasure={setTrackWidth} />
        <TickerSequence items={validItems} onPressItem={onPressItem} />
      </Animated.View>
    </Box>
  )
})
