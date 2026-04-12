import React, { useEffect, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import { borderWidth, breakpoints, layout, motionDuration, spacing } from '@real/tokens'
import { Box, Container, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { useBreakpoint, useThemeColors } from '../../responsive'

type UtilityBarItem = {
  id: string
  label: string
  href?: string
  highlight?: boolean
}

type TopPromoBarProps = {
  items?: UtilityBarItem[]
  message?: string
  secondaryMessage?: string
  tertiaryMessage?: string
  socialItems?: Array<{ id: string; label: string; href: string }>
  onPressSocial?: (id: string) => void
  rotateMs?: number
  onPressItem?: (item: UtilityBarItem) => void
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export const TopPromoBar = React.memo(function TopPromoBar({
  items,
  message,
  secondaryMessage,
  tertiaryMessage,
  rotateMs = 5000,
  onPressItem,
  state = 'default',
}: TopPromoBarProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const [activeIndex, setActiveIndex] = useState(0)
  const isDesktop = profile.breakpoint === 'desktop'
  const promoBarHeight = layout.header.topBarHeight

  const resolvedItems = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) {
      return items
    }

    return [
      message
        ? {
            id: 'promo-primary',
            label: message,
          }
        : null,
      secondaryMessage
        ? {
            id: 'promo-secondary',
            label: secondaryMessage,
          }
        : null,
      tertiaryMessage
        ? {
            id: 'promo-tertiary',
            label: tertiaryMessage,
          }
        : null,
    ].filter((item): item is UtilityBarItem => item !== null)
  }, [items, message, secondaryMessage, tertiaryMessage])

  const visibleItems = useMemo(
    () => resolvedItems.filter((item) => item.label.trim().length > 0).slice(0, 3),
    [resolvedItems],
  )
  const mobileItems = visibleItems
  const fallbackHref = visibleItems.find((item) => item.href)?.href
  const mobileItem = mobileItems[activeIndex % Math.max(1, mobileItems.length)] ?? visibleItems[0]

  useEffect(() => {
    if (isDesktop || mobileItems.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % mobileItems.length)
    }, rotateMs)
    return () => clearInterval(timer)
  }, [isDesktop, mobileItems.length, rotateMs])

  if (state === 'empty' || visibleItems.length === 0) {
    return null
  }

  if (state === 'loading') {
    return (
      <Box style={{ minHeight: promoBarHeight, backgroundColor: c.inkBlack }} />
    )
  }

  if (!isDesktop && mobileItem) {
    const row = (
      <Box
        style={{
          minHeight: promoBarHeight,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing['8'],
        }}
      >
        <Box
          style={{
            width: spacing['8'],
            height: spacing['8'],
            borderRadius: spacing['8'],
            backgroundColor: c.brandPrimary,
          }}
        />
        <Text
          variant='caption'
          weight='700'
          tone='inverse'
          numberOfLines={1}
          style={{
            fontSize: 12,
            lineHeight: 16,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {state === 'error' ? 'Promotion unavailable' : mobileItem.label}
        </Text>
        <Text
          variant='caption'
          weight='700'
          tone='inverse'
          style={{
            fontSize: 12,
            lineHeight: 16,
          }}
        >
          {'>'}
        </Text>
      </Box>
    )

    return (
      <Box data-ect-node='TopPromoBar' style={{ backgroundColor: c.inkBlack }}>
        <Container paddingX={spacing.pageX}>
          {mobileItem.href || fallbackHref ? (
            <ReusableButton
              href={mobileItem.href || fallbackHref}
              disabled={state === 'disabled'}
              onPress={() => onPressItem?.({ ...mobileItem, href: mobileItem.href || fallbackHref })}
              variant='ghost'
              style={{ width: '100%' }}
            >
              {row}
            </ReusableButton>
          ) : row}
        </Container>
      </Box>
    )
  }

  return (
    <Box
      data-ect-node='TopPromoBar'
      style={{
        minHeight: promoBarHeight,
        backgroundColor: c.inkBlack,
        borderBottomWidth: borderWidth.none,
      }}
    >
      <Container paddingX={spacing.pageX}>
        <Box
          style={{
            minHeight: promoBarHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing['12'],
          }}
        >
          {visibleItems.map((item, index) => {
            const content = (
              <Text
                variant='caption'
                weight='700'
                tone='inverse'
                style={{
                  fontSize: item.highlight ? 13 : 12,
                  lineHeight: 16,
                  textTransform: 'uppercase',
                  letterSpacing: 0.7,
                  color: item.highlight ? c.brandPrimary : c.textInverted,
                }}
              >
                {item.label}
                {item.highlight ? ' >' : ''}
              </Text>
            )

            return (
              <Box key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['12'] }}>
                {item.href && item.highlight ? (
                  <ReusableButton
                    href={item.href}
                    disabled={state === 'disabled'}
                    onPress={() => onPressItem?.(item)}
                    variant='ghost'
                    style={({ hovered, focused }) => ({
                      opacity: hovered || focused ? 0.9 : 1,
                      transitionProperty: Platform.OS === 'web' ? 'opacity' : undefined,
                      transitionDuration: Platform.OS === 'web' ? `${motionDuration.microInteraction}ms` : undefined,
                    })}
                  >
                    {content}
                  </ReusableButton>
                ) : (
                  content
                )}
                {index < visibleItems.length - 1 ? (
                  <Text variant='caption' tone='inverse' style={{ opacity: 0.5 }}>
                    |
                  </Text>
                ) : null}
              </Box>
            )
          })}
        </Box>
      </Container>
    </Box>
  )
})
