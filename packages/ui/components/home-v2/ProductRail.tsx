"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Platform, ScrollView } from 'react-native'
import {
  breakpoints,
  componentTokens,
  fontFamilies,
  layout,
  opacity,
  radius,
  spacing,
} from '@real/tokens'
import type { ProductCardModel, ProductCardVariant } from '../ProductCard.types'
import { Box, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { ProductCardSkeleton } from '../ProductCard'
import { ProductCardV2 } from '../ProductCardV2'
import { useRailAutoplay } from '../useRailAutoplay'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import { useBreakpoint, useThemeColors } from '../../responsive'
import { useRovingTabIndex } from '../../hooks/useRovingTabIndex'

type DiscoveryRailFilter = 'all' | 'topRated' | 'bestDeals'

type ProductRailProps = {
  title?: string
  actionLabel?: string
  actionHref?: string
  items: ProductCardModel[]
  cardVariant?: ProductCardVariant
  showFilterChips?: boolean
  autoplay?: boolean
  autoplayMs?: number
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressAction?: () => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

const PRODUCT_RAIL_LOADING_SKELETON_STYLE = {
  height: 280,
  borderRadius: radius.xs,
} as const

const RAIL_FILTER_OPTIONS: { id: DiscoveryRailFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'topRated', label: 'Top Rated' },
  { id: 'bestDeals', label: 'Best Deals' },
]

function isBestDealItem(item: ProductCardModel) {
  return typeof item.compareAtPrice?.amount === 'number' && item.compareAtPrice.amount > item.price.amount
}

function applyFilter(items: ProductCardModel[], filter: DiscoveryRailFilter) {
  if (filter === 'topRated') return items.filter((item) => (item.rating?.average ?? 0) >= 4)
  if (filter === 'bestDeals') return items.filter(isBestDealItem)
  return items
}

function scrollRailBy(
  railRef: React.MutableRefObject<ScrollView | null>,
  offsetRef: React.MutableRefObject<number>,
  viewportRef: React.MutableRefObject<number>,
  contentRef: React.MutableRefObject<number>,
  distance: number,
  direction: 'prev' | 'next',
) {
  const maxOffset = Math.max(0, contentRef.current - viewportRef.current)
  const target = direction === 'prev'
    ? Math.max(0, offsetRef.current - distance)
    : Math.min(maxOffset, offsetRef.current + distance)
  railRef.current?.scrollTo({ x: target, animated: true })
  offsetRef.current = target
}

function RailEdgeFade({ edge, color }: { edge: 'start' | 'end'; color: string }) {
  const direction = edge === 'start' ? 'to right' : 'to left'

  return (
    <Box
      style={
        {
          position: 'absolute',
          pointerEvents: 'none',
          top: 0,
          bottom: 0,
          [edge]: 0,
          width: spacing['32'],
          ...(Platform.OS === 'web'
            ? { backgroundImage: `linear-gradient(${direction}, ${color} 0%, transparent 100%)` }
            : { backgroundColor: color, opacity: opacity.overlayDark }),
        } as const
      }
    />
  )
}

function ProductRailNavButton({
  direction,
  top,
  edge,
  onPress,
}: {
  direction: 'prev' | 'next'
  top: number
  edge: number
  onPress: () => void
}) {
  const productTokens = componentTokens.storefrontHome.product

  return (
    <Box
      style={{
        position: 'absolute',
        top,
        transform: [{ translateY: -Math.round(productTokens.navButtonSize / 2) }],
        [direction === 'prev' ? 'start' : 'end']: edge,
      } as const}
    >
      <IconButton
        icon={direction === 'prev' ? 'caretLeft' : 'caretRight'}
        label={direction === 'prev' ? 'Previous products' : 'Next products'}
        onPress={onPress}
        tone='soft'
        size='lg'
      />
    </Box>
  )
}

function FilterChips({
  active,
  onChange,
}: {
  active: DiscoveryRailFilter
  onChange: (value: DiscoveryRailFilter) => void
}) {
  const discoveryTokens = componentTokens.storefrontHome.discovery

  return (
    <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: discoveryTokens.railFilterGap }}>
      {RAIL_FILTER_OPTIONS.map((option) => {
        const isActive = option.id === active

        return (
          <Button
            key={option.id}
            onPress={() => onChange(option.id)}
            size='sm'
            shape='pill'
            variant={isActive ? 'outline' : 'secondaryQuiet'}
            aria-pressed={isActive}
          >
            {option.label}
          </Button>
        )
      })}
    </Box>
  )
}

export const ProductRail = React.memo(function ProductRail({
  title = 'New Arrivals',
  actionLabel,
  actionHref = '/shop',
  items,
  cardVariant = 'default',
  showFilterChips = false,
  autoplay,
  autoplayMs,
  loading = false,
  error = null,
  onRetry,
  onPressAction,
  onSelectProduct,
  onAddToCart,
}: ProductRailProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const [railFilter, setRailFilter] = useState<DiscoveryRailFilter>('all')
  const railRef = useRef<ScrollView | null>(null)
  const offsetRef = useRef(0)
  const viewportRef = useRef(0)
  const contentRef = useRef(0)
  const productTokens = componentTokens.storefrontHome.product
  const layoutTokens = componentTokens.storefrontHome.layout
  const prefersReducedMotion = usePrefersReducedMotion()

  const isDesktop = profile.breakpoint === 'desktop'
  const contentPaddingX = isDesktop
    ? componentTokens.storefrontHome.contentPaddingXDesktop
    : componentTokens.storefrontHome.contentPaddingXMobile

  const shellContentWidth = Math.max(280, Math.min(profile.containerWidth, layout.containerMaxWidth) - spacing.pageX * 2)
  const productColumns = isDesktop
    ? productTokens.columns.desktop
    : profile.breakpoint === 'tablet'
      ? productTokens.columns.tablet
      : productTokens.columns.mobile

  const baseCardWidth = isDesktop
    ? componentTokens.storefrontHome.productCard.defaultWidth
    : Math.max(
        productTokens.desktopMinWidth,
        Math.floor((shellContentWidth - productTokens.railGap * (productColumns - 1)) / productColumns),
      )
  const productCardWidth = cardVariant === 'compact'
    ? Math.max(productTokens.desktopMinWidth, baseCardWidth - spacing['24'])
    : cardVariant === 'featured'
      ? baseCardWidth + spacing['16']
      : baseCardWidth

  const railDistance = productCardWidth + productTokens.railGap
  const navTop = Math.max(96, Math.round(productCardWidth * productTokens.navTopFactor))

  const visibleItems = useMemo(
    () => applyFilter(items, railFilter).slice(0, 12),
    [items, railFilter],
  )
  const hasAction = Boolean(actionLabel && onPressAction)
  const getRovingProps = useRovingTabIndex({ itemCount: visibleItems.length, orientation: 'horizontal' })

  useRailAutoplay({
    enabled: autoplay && !prefersReducedMotion,
    autoplayMs,
    railRef,
    offsetRef,
    viewportRef,
    contentRef,
    stepDistance: railDistance,
    itemCount: visibleItems.length,
  })

  if (loading) {
    return <Box style={[PRODUCT_RAIL_LOADING_SKELETON_STYLE, { backgroundColor: c.surfaceMuted }]} />
  }

  if (error) {
    return (
      <Box
        style={{
          padding: spacing['24'],
          gap: spacing['12'],
        }}
      >
        <Text variant='bodySm' tone='danger'>{error}</Text>
        {onRetry ? (
          <Button onPress={onRetry} size='sm' variant='outline'>
            Retry
          </Button>
        ) : null}
      </Box>
    )
  }

  if (!visibleItems.length) return null

  return (
      <Box
        data-ect-node='ProductRail'
        role='region'
        aria-label={title}
        style={{
        width: '100%',
        maxWidth: layout.containerMaxWidth,
        alignSelf: 'center',
        paddingHorizontal: contentPaddingX,
        gap: layoutTokens.sectionGap,
      }}
    >
      <Box
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: spacing['40'],
          gap: spacing['12'],
        }}
      >
        <Text
          variant='h2'
          weight='700'
          {...(Platform.OS === 'web' ? { accessibilityRole: 'heading' as any, 'aria-level': 2 } : {})}
          style={[{ color: c.textPrimary, fontFamily: fontFamilies.serif, letterSpacing: -0.3 }]}
        >
          {title}
        </Text>
        {hasAction ? (
          <ReusableButton
            onPress={onPressAction}
            accessibilityRole='button'
            accessibilityLabel={actionLabel}
            variant='ghost'
            size='default'
          >
            <Text
              variant='caption'
              weight='700'
              style={[
                {
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                },
                { color: c.brandPrimary },
              ]}
            >
              {actionLabel}
            </Text>
          </ReusableButton>
        ) : null}
      </Box>

      {showFilterChips ? (
        <FilterChips active={railFilter} onChange={setRailFilter} />
      ) : null}

      <Box style={{ position: 'relative' }}>
        <ScrollView
          ref={railRef}
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          onLayout={(event) => { viewportRef.current = event.nativeEvent.layout.width }}
          onContentSizeChange={(contentWidth) => { contentRef.current = contentWidth }}
          onScroll={(event) => { offsetRef.current = event.nativeEvent.contentOffset.x }}
          scrollEventThrottle={16}
          contentContainerStyle={{ gap: productTokens.railGap, paddingBottom: spacing['4'] }}
          {...(Platform.OS === 'web' ? { role: 'listbox' as any, 'aria-label': title } : {})}
        >
          {loading
            ? Array.from({ length: productColumns }, (_, index) => (
                <ProductCardSkeleton
                  key={`rail-skeleton-${index}`}
                  width={productCardWidth}
                  variant={cardVariant}
                />
              ))
            : visibleItems.map((item, index) => {
                const rovingProps = getRovingProps(index)
                return (
                  <Box
                    key={item.id}
                    {...(Platform.OS === 'web'
                      ? ({ ref: rovingProps.ref, tabIndex: rovingProps.tabIndex, onKeyDown: rovingProps.onKeyDown, role: 'option', 'aria-label': item.title } as any)
                      : {})}
                  >
                    <ProductCardV2
                      item={item}
                      width={productCardWidth}
                      onPress={() => onSelectProduct?.(item.id)}
                      onPressAdd={() => onAddToCart?.(item.id)}
                    />
                  </Box>
                )
              })}
        </ScrollView>

        {visibleItems.length > productColumns ? (
          <>
            <RailEdgeFade edge='start' color={c.surface} />
            <RailEdgeFade edge='end' color={c.surface} />
          </>
        ) : null}

        {isDesktop && visibleItems.length > productColumns ? (
          <>
            <ProductRailNavButton
              direction='prev'
              top={navTop}
              edge={-productTokens.navEdgeOffset}
              onPress={() => scrollRailBy(railRef, offsetRef, viewportRef, contentRef, railDistance, 'prev')}
            />
            <ProductRailNavButton
              direction='next'
              top={navTop}
              edge={-productTokens.navEdgeOffset}
              onPress={() => scrollRailBy(railRef, offsetRef, viewportRef, contentRef, railDistance, 'next')}
            />
          </>
        ) : null}
      </Box>
    </Box>
  )
})
