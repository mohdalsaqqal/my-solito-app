import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Platform } from 'react-native'
import { borderWidth, colors, spacing, zIndex } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'

export type AnnouncementTickerItem = {
  id: string
  label: string
  href?: string
}

type AnnouncementTickerProps = {
  items: AnnouncementTickerItem[]
  speedMs?: number
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
          <Touchable onPress={item.href ? () => onPressItem?.(item.href) : undefined}>
            <Text variant='nav' tone={item.href ? 'primary' : 'muted'} weight={item.href ? '600' : '500'}>
              {item.label}
            </Text>
          </Touchable>
          {index < items.length - 1 ? (
            <Text
              variant='nav'
              tone='muted'
              style={{
                marginHorizontal: spacing.sm,
              }}
            >
              {'|'}
            </Text>
          ) : null}
          <Box style={{ width: spacing.lg }} />
        </Box>
      ))}
    </Box>
  )
}

export function AnnouncementTicker({
  items,
  speedMs = 22000,
  onPressItem,
}: AnnouncementTickerProps) {
  const [trackWidth, setTrackWidth] = useState(0)
  const [paused, setPaused] = useState(false)
  const translateX = useRef(new Animated.Value(0)).current
  const isWeb = Platform.OS === 'web'

  const validItems = useMemo(() => items.filter((item) => item.label.trim().length > 0), [items])

  useEffect(() => {
    if (validItems.length === 0 || trackWidth <= 0 || paused) {
      return
    }

    translateX.setValue(0)
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -trackWidth,
        duration: Math.max(12000, speedMs),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )

    loop.start()
    return () => loop.stop()
  }, [paused, speedMs, trackWidth, translateX, validItems.length])

  if (validItems.length === 0) {
    return null
  }

  return (
    <Box
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
}
