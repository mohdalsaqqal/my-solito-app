/**
 * ⚠️  DESIGN REFERENCE ONLY — NOT FOR PRODUCTION USE ⚠️
 *
 * This file is a design exploration / prototype inspired by Sephora's homepage layout.
 * It exists purely as a visual reference and may contain:
 *   - Hardcoded values (not token-compliant)
 *   - Experimental patterns not yet in the design system
 *   - Non-RTL-safe constructs
 *
 * DO NOT import this into any production screen or package index.
 * DO NOT run guard checks against this file.
 *
 * For production home sections, see: packages/ui/components/home-v2/
 */
import { MutableRefObject, ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { I18nManager, Image, Platform, ScrollView, useWindowDimensions } from 'react-native'
import {
  borderWidth,
  breakpoints,
  colors,
  componentTokens,
  elevation,
  fontFamilies,
  layout,
  motionDuration,
  radius,
  shadows,
  spacing,
  typography,
} from '@real/tokens'
import { Box, Text, emitNativeScrollOffset } from '../../primitives'
import { Touchable } from '../../primitives/Touchable'
import { EditorialHotspotSection } from './EditorialHotspotSection'
import { ProductCard } from '../ProductCard'
import { Icon, IconName } from '../Icon'
import { HomeBrandItem, HomeCategoryItem, HomeEditorialHotspotSection, HomeHeroItem, HomeProductItem, HomeUgcItem } from '../home/types'
import {
  buildEditorialHeroTiles,
  buildTestimonials,
  EditorialHeroTile,
} from './figmaHomeData'

type TickerItem = {
  id: string
  label: string
  href?: string
}

type PromoBlock = {
  title?: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
}

type BrandSpotlightSection = {
  id: string
  bannerTitle: string
  bannerSubtitle?: string
  bannerCtaLabel?: string
  bannerHref?: string
  bannerImageUrl?: string
  railTitle: string
  items: HomeProductItem[]
}

type DiscoveryRailFilter = 'all' | 'topRated' | 'bestDeals'

type RailAutoplaySetting = {
  enabled?: boolean
  autoplayMs?: number
}

type HomeRailAutoplaySettings = {
  hero?: RailAutoplaySetting
  categories?: RailAutoplaySetting
  newArrivals?: RailAutoplaySetting
  featured?: RailAutoplaySetting
  brandSpotlights?: RailAutoplaySetting
}

type SephoraReferenceHomeProps = {
  heroItems: HomeHeroItem[]
  tickerItems: TickerItem[]
  newArrivalsTitle?: string
  newArrivalsItems: HomeProductItem[]
  featuredTitle?: string
  featuredItems: HomeProductItem[]
  topBrands: HomeBrandItem[]
  categoryItems: HomeCategoryItem[]
  editorialHotspotSection?: HomeEditorialHotspotSection | null
  ugcItems: HomeUgcItem[]
  promoBlocks: PromoBlock[]
  brandSpotlights?: BrandSpotlightSection[]
  railAutoplay?: HomeRailAutoplaySettings
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onQuickView?: (item: HomeProductItem) => void
  onAddToCart?: (productId: string) => void
}

type HeroWebGradients = {
  panelGradient?: string
  mediaOverlayGradient?: string
}

const HERO_PANEL_GRADIENT = 'linear-gradient(180deg, rgb(255,255,255) 0%, rgb(247,247,247) 100%)'
const HERO_MEDIA_OVERLAY_GRADIENT = 'linear-gradient(to top, rgba(255,255,255,0.16), transparent 64%)'

const HERO_TONE_STYLES: Record<
  EditorialHeroTile['tone'],
  {
    panelBackground: string
    panelBorder: string
    badgeBackground: string
    badgeText: string
    badgeIconBackground: string
    badgeIconColor: string
    eyebrowText: string
    titleText: string
    subtitleText: string
    ctaBackground: string
    ctaBorder: string
    ctaText: string
    ctaHoverBackground: string
    ctaHoverBorder: string
    ctaHoverText: string
    imageOverlayStrong: string
    imageOverlaySoft: string
  } & HeroWebGradients
> = {
  flash: {
    panelBackground: colors.surface,
    panelBorder: colors.stroke,
    badgeBackground: colors.inkBlack,
    badgeText: colors.white,
    badgeIconBackground: colors.brandPrimary,
    badgeIconColor: colors.white,
    eyebrowText: colors.textSecondary,
    titleText: colors.textPrimary,
    subtitleText: colors.textPrimary,
    ctaBackground: colors.inkBlack,
    ctaBorder: colors.inkBlack,
    ctaText: colors.white,
    ctaHoverBackground: colors.inkDeep,
    ctaHoverBorder: colors.inkDeep,
    ctaHoverText: colors.white,
    imageOverlayStrong: 'rgba(15,15,17,0.48)',
    imageOverlaySoft: 'rgba(255,255,255,0.02)',
    panelGradient: HERO_PANEL_GRADIENT,
    mediaOverlayGradient: HERO_MEDIA_OVERLAY_GRADIENT,
  },
  editorial: {
    panelBackground: colors.surface,
    panelBorder: colors.stroke,
    badgeBackground: colors.inkBlack,
    badgeText: colors.white,
    badgeIconBackground: colors.inkBlack,
    badgeIconColor: colors.white,
    eyebrowText: colors.textSecondary,
    titleText: colors.textPrimary,
    subtitleText: colors.textPrimary,
    ctaBackground: colors.inkBlack,
    ctaBorder: colors.inkBlack,
    ctaText: colors.white,
    ctaHoverBackground: colors.inkDeep,
    ctaHoverBorder: colors.inkDeep,
    ctaHoverText: colors.white,
    imageOverlayStrong: 'rgba(15,18,23,0.48)',
    imageOverlaySoft: 'rgba(255,255,255,0.03)',
    panelGradient: HERO_PANEL_GRADIENT,
    mediaOverlayGradient: HERO_MEDIA_OVERLAY_GRADIENT,
  },
  new: {
    panelBackground: colors.surface,
    panelBorder: colors.stroke,
    badgeBackground: colors.inkBlack,
    badgeText: colors.white,
    badgeIconBackground: 'rgba(0,0,0,0.30)',
    badgeIconColor: colors.white,
    eyebrowText: colors.textSecondary,
    titleText: colors.textPrimary,
    subtitleText: colors.textSecondary,
    ctaBackground: colors.inkBlack,
    ctaBorder: colors.inkBlack,
    ctaText: colors.white,
    ctaHoverBackground: colors.inkDeep,
    ctaHoverBorder: colors.inkDeep,
    ctaHoverText: colors.white,
    imageOverlayStrong: 'rgba(15,15,17,0.48)',
    imageOverlaySoft: 'rgba(255,255,255,0.03)',
    panelGradient: HERO_PANEL_GRADIENT,
    mediaOverlayGradient: HERO_MEDIA_OVERLAY_GRADIENT,
  },
  luxury: {
    panelBackground: colors.surface,
    panelBorder: colors.stroke,
    badgeBackground: colors.inkBlack,
    badgeText: colors.white,
    badgeIconBackground: colors.inkBlack,
    badgeIconColor: colors.white,
    eyebrowText: colors.textSecondary,
    titleText: colors.textPrimary,
    subtitleText: colors.textPrimary,
    ctaBackground: 'transparent',
    ctaBorder: colors.inkBlack,
    ctaText: colors.inkBlack,
    ctaHoverBackground: colors.inkBlack,
    ctaHoverBorder: colors.inkBlack,
    ctaHoverText: colors.white,
    imageOverlayStrong: 'rgba(15,18,23,0.46)',
    imageOverlaySoft: 'rgba(255,255,255,0.04)',
    panelGradient: HERO_PANEL_GRADIENT,
    mediaOverlayGradient: HERO_MEDIA_OVERLAY_GRADIENT,
  },
  member: {
    panelBackground: colors.surface,
    panelBorder: colors.stroke,
    badgeBackground: colors.inkBlack,
    badgeText: colors.white,
    badgeIconBackground: colors.brandPrimary,
    badgeIconColor: colors.white,
    eyebrowText: colors.textSecondary,
    titleText: colors.textPrimary,
    subtitleText: colors.textPrimary,
    ctaBackground: colors.inkBlack,
    ctaBorder: colors.inkBlack,
    ctaText: colors.white,
    ctaHoverBackground: colors.inkDeep,
    ctaHoverBorder: colors.inkDeep,
    ctaHoverText: colors.white,
    imageOverlayStrong: 'rgba(15,15,17,0.48)',
    imageOverlaySoft: 'rgba(255,255,255,0.03)',
    panelGradient: HERO_PANEL_GRADIENT,
    mediaOverlayGradient: HERO_MEDIA_OVERLAY_GRADIENT,
  },
}

const DEPARTMENT_ICONS: IconName[] = [
  'categories',
  'deals',
  'quickView',
  'wishlist',
  'trending',
]

const DEPARTMENT_BACKGROUNDS = [
  colors.backgroundSecondary,
  colors.backgroundSecondary,
  colors.backgroundSecondary,
  colors.backgroundSecondary,
  colors.backgroundSecondary,
]

const DISCOVERY_INTENTS = [
  { id: 'intent-bestsellers', label: 'Best Sellers', icon: 'trending' as IconName, href: '/shop?sort=bestseller' },
  { id: 'intent-newin', label: 'New In', icon: 'gift' as IconName, href: '/shop?sort=newest' },
  { id: 'intent-under50', label: 'Under $50', icon: 'price' as IconName, href: '/shop?maxPrice=50' },
  { id: 'intent-gifts', label: 'Gift Sets', icon: 'gift' as IconName, href: '/shop?category=gift-sets' },
] as const

const DISCOVERY_TRUST_POINTS = [
  {
    id: 'trust-authentic',
    icon: 'secure' as IconName,
    title: '100% Authentic Brands',
    meta: '15k curated products',
  },
  {
    id: 'trust-shipping',
    icon: 'shipping' as IconName,
    title: 'Fast Delivery',
    meta: '1-2 day dispatch on top items',
  },
  {
    id: 'trust-returns',
    icon: 'returns' as IconName,
    title: 'Easy Returns',
    meta: 'Hassle-free return support',
  },
] as const

const RAIL_FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'topRated', label: 'Top Rated' },
  { id: 'bestDeals', label: 'Best Deals' },
] as const

const HERO_SECTION_OVERLAY = 'transparent'
const HERO_SECTION_MIST = 'transparent'
const HERO_SECTION_FIELD_GRADIENT = 'none'
const BANNER_SECTION_OVERLAY = 'transparent'
const DARK_OVERLAY = 'rgba(255, 255, 255, 0.16)'
const DARK_OVERLAY_SOFT = 'rgba(255, 255, 255, 0.12)'
const LIGHT_GHOST = 'rgba(255,255,255,0.14)'
const BANNER_OVERLAY_STRONG = 'rgba(15, 15, 17, 0.64)'
const BANNER_MIST = 'rgba(255, 255, 255, 0.08)'
const OFFER_BANNER_TONES = [
  {
    radialOverlayGradient: 'none',
  },
  {
    radialOverlayGradient: 'none',
  },
] as const

type RgbTuple = [number, number, number]

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function mixRgb(left: RgbTuple, right: RgbTuple, weight: number): RgbTuple {
  const safeWeight = Math.max(0, Math.min(1, weight))
  return [
    clampChannel(left[0] * (1 - safeWeight) + right[0] * safeWeight),
    clampChannel(left[1] * (1 - safeWeight) + right[1] * safeWeight),
    clampChannel(left[2] * (1 - safeWeight) + right[2] * safeWeight),
  ]
}

function rgbWithAlpha([red, green, blue]: RgbTuple, alpha: number) {
  return `rgba(${red},${green},${blue},${alpha})`
}

function hashImageUrlToRgb(value: string): RgbTuple {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }

  const seed = Math.abs(hash)
  const base: RgbTuple = [
    90 + (seed % 80),
    70 + ((seed >> 3) % 70),
    60 + ((seed >> 6) % 60),
  ]

  return mixRgb(base, [244, 240, 237], 0.34)
}

async function sampleAverageImageColor(imageUrl: string): Promise<RgbTuple | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof Image === 'undefined') {
    return null
  }

  return new Promise((resolve) => {
    const probe = new globalThis.Image()
    probe.crossOrigin = 'anonymous'
    probe.decoding = 'async'

    probe.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) {
          resolve(null)
          return
        }

        const targetWidth = 24
        const aspectRatio = probe.naturalWidth > 0 ? probe.naturalHeight / probe.naturalWidth : 1
        const targetHeight = Math.max(1, Math.round(targetWidth * aspectRatio))

        canvas.width = targetWidth
        canvas.height = targetHeight
        context.drawImage(probe, 0, 0, targetWidth, targetHeight)

        const { data } = context.getImageData(0, 0, targetWidth, targetHeight)
        let red = 0
        let green = 0
        let blue = 0
        let samples = 0

        for (let index = 0; index < data.length; index += 16) {
          const alpha = data[index + 3] ?? 0
          if (alpha < 24) {
            continue
          }

          red += data[index] ?? 0
          green += data[index + 1] ?? 0
          blue += data[index + 2] ?? 0
          samples += 1
        }

        if (samples === 0) {
          resolve(null)
          return
        }

        const average: RgbTuple = [
          clampChannel(red / samples),
          clampChannel(green / samples),
          clampChannel(blue / samples),
        ]
        resolve(average)
      } catch {
        resolve(null)
      }
    }

    probe.onerror = () => resolve(null)
    probe.src = imageUrl
  })
}

function buildOfferBannerGradientFromRgb(rgb: RgbTuple) {
  const warmNeutral = mixRgb(rgb, [248, 244, 240], 0.42)
  const richerAccent = mixRgb(rgb, [112, 46, 34], 0.18)

  return `linear-gradient(135deg, ${rgbWithAlpha(warmNeutral, 0.78)} 0%, ${rgbWithAlpha(richerAccent, 0.52)} 58%, ${rgbWithAlpha(
    [255, 255, 255],
    0.16,
  )} 100%)`
}

function buildHeroPanelGradientFromRgb(rgb: RgbTuple) {
  const topWash = mixRgb(rgb, [255, 255, 255], 0.9)
  const bottomWash = mixRgb(rgb, [250, 248, 246], 0.82)

  return `linear-gradient(180deg, ${rgbWithAlpha(topWash, 0.985)} 0%, ${rgbWithAlpha(bottomWash, 0.965)} 100%)`
}

function useImageDrivenGradient(imageUrl: string | undefined, variant: 'offer' | 'hero') {
  const [gradient, setGradient] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    if (Platform.OS !== 'web' || !imageUrl) {
      setGradient(null)
      return () => {
        active = false
      }
    }

    const buildGradient =
      variant === 'offer'
        ? buildOfferBannerGradientFromRgb
        : buildHeroPanelGradientFromRgb

    setGradient(buildGradient(hashImageUrlToRgb(imageUrl)))

    void sampleAverageImageColor(imageUrl).then((sampledColor) => {
      if (!active || !sampledColor) {
        return
      }
      setGradient(buildGradient(sampledColor))
    })

    return () => {
      active = false
    }
  }, [imageUrl, variant])

  return gradient
}

function isBestDealItem(item: HomeProductItem) {
  if (typeof item.compareAtPrice === 'number' && item.compareAtPrice > item.price) {
    return true
  }
  const badge = (item.badge || '').toLowerCase()
  return /deal|save|sale|off|hot/.test(badge)
}

function applyDiscoveryRailFilter(items: HomeProductItem[], filter: DiscoveryRailFilter) {
  if (filter === 'all') {
    return items
  }
  if (filter === 'topRated') {
    const filtered = items.filter((item) => (item.rating ?? 0) >= 4.3)
    return filtered.length > 0 ? filtered : items
  }
  const filtered = items.filter((item) => isBestDealItem(item))
  return filtered.length > 0 ? filtered : items
}

function chunkIntoRows<T>(items: T[], size: number) {
  const rows: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size))
  }
  return rows
}

function isRtlLayout() {
  if (Platform.OS === 'web') {
    const doc = (globalThis as { document?: { documentElement?: { dir?: string } } }).document
    if (doc?.documentElement?.dir) {
      return doc.documentElement.dir === 'rtl'
    }
  }

  return I18nManager.isRTL
}

function scrollRailBy(
  railRef: RefObject<ScrollView | null>,
  offsetRef: MutableRefObject<number>,
  distance: number,
  direction: 'prev' | 'next',
) {
  const current = offsetRef.current || 0
  const nextOffset = direction === 'next'
    ? current + distance
    : Math.max(0, current - distance)

  railRef.current?.scrollTo({ x: nextOffset, animated: true })
  offsetRef.current = nextOffset
}

function useAutoScrollRail({
  enabled,
  autoplayMs,
  railRef,
  offsetRef,
  viewportWidthRef,
  contentWidthRef,
  stepDistance,
  itemCount,
}: {
  enabled?: boolean
  autoplayMs?: number
  railRef: RefObject<ScrollView | null>
  offsetRef: MutableRefObject<number>
  viewportWidthRef: MutableRefObject<number>
  contentWidthRef: MutableRefObject<number>
  stepDistance: number
  itemCount: number
}) {
  useEffect(() => {
    if (!enabled || itemCount <= 1) {
      return
    }

    const interval = setInterval(() => {
      const viewport = viewportWidthRef.current
      const content = contentWidthRef.current
      const maxOffset = Math.max(0, content - viewport)

      if (maxOffset <= 0) {
        return
      }

      const currentOffset = offsetRef.current || 0
      const nextOffset = currentOffset + stepDistance
      const wrappedOffset = nextOffset > maxOffset - 2 ? 0 : Math.min(nextOffset, maxOffset)
      offsetRef.current = wrappedOffset
      railRef.current?.scrollTo({ x: wrappedOffset, animated: true })
    }, Math.max(1800, autoplayMs ?? 4200))

    return () => clearInterval(interval)
  }, [autoplayMs, contentWidthRef, enabled, itemCount, offsetRef, railRef, stepDistance, viewportWidthRef])
}

function HomeContainer({
  children,
}: {
  children: ReactNode
}) {
  const { width } = useWindowDimensions()
  const [hasHydrated, setHasHydrated] = useState(Platform.OS !== 'web')
  const homeTokens = componentTokens.storefrontHome

  useEffect(() => {
    if (Platform.OS === 'web') {
      setHasHydrated(true)
    }
  }, [])

  const effectiveWidth = Platform.OS === 'web' && !hasHydrated ? 0 : width
  const viewportWidth = effectiveWidth || layout.containerMaxWidth
  const isDesktop = viewportWidth >= breakpoints.desktopMin || (Platform.OS === 'web' && effectiveWidth === 0)
  const contentPaddingX = isDesktop
    ? homeTokens.contentPaddingXDesktop
    : homeTokens.contentPaddingXMobile

  return (
    <Box
      style={{
        width: '100%',
        maxWidth: layout.containerMaxWidth,
        alignSelf: 'center',
        paddingHorizontal: contentPaddingX,
      }}
    >
      {children}
    </Box>
  )
}

function EditorialHeading({
  title,
  eyebrow,
  align = 'left',
}: {
  title: string
  eyebrow?: string
  align?: 'left' | 'center'
}) {
  const centered = align === 'center'

  return (
    <Box style={{ alignItems: centered ? 'center' : 'flex-start', gap: spacing['8'] }}>
      {eyebrow ? (
        <Text
          variant='caption'
          tone='muted'
          weight='700'
          style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Box style={{ alignItems: centered ? 'center' : 'flex-start', gap: spacing['6'] }}>
        <Text
          variant='h2'
          weight='700'
          style={{
            color: colors.textPrimary,
            textAlign: centered ? 'center' : 'left',
          }}
        >
          {title}
        </Text>
      </Box>
    </Box>
  )
}

function CommerceGridHeader({
  title,
  actionLabel,
  onPressAction,
  centered = true,
  reserveWidth: _reserveWidth,
}: {
  title: string
  actionLabel?: string
  onPressAction?: () => void
  centered?: boolean
  reserveWidth?: number
}) {
  return (
    <Box
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: centered ? 'center' : 'space-between',
        minHeight: spacing['40'],
        gap: spacing['12'],
      }}
    >
      <EditorialHeading title={title} align={centered ? 'center' : 'left'} />
      {actionLabel ? (
        <Touchable onPress={onPressAction} style={{ flexShrink: 0 }}>
          {({ hovered, focused }) => (
            <Text
              variant='caption'
              weight='700'
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                color: hovered || focused ? colors.brandPrimaryPressed : colors.brandPrimary,
                textDecorationLine: 'underline',
              }}
              numberOfLines={1}
            >
              {actionLabel}
            </Text>
          )}
        </Touchable>
      ) : null}
    </Box>
  )
}

function DiscoveryFilterChips({
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
          <Touchable key={option.id} onPress={() => onChange(option.id)}>
            {({ hovered, focused }) => {
              const interactive = hovered || focused
              const selected = isActive || interactive

              return (
                <Box
                  style={{
                    minHeight: discoveryTokens.railFilterMinHeight,
                    borderRadius: radius.full,
                    borderWidth: borderWidth.thin,
                    borderColor: selected ? colors.brandPrimary : colors.border,
                    backgroundColor: selected ? colors.brandPrimarySubtle : colors.surface,
                    paddingHorizontal: discoveryTokens.railFilterPaddingX,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transitionProperty: 'background-color,border-color,transform',
                    transitionDuration: `${motionDuration.microInteraction}ms`,
                    transform: [{ translateY: interactive ? -1 : 0 }],
                  }}
                >
                  <Text
                    variant='caption'
                    weight='700'
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: discoveryTokens.railFilterLabelTracking,
                      color: selected ? colors.brandPrimary : colors.textSecondary,
                    }}
                  >
                    {option.label}
                  </Text>
                </Box>
              )
            }}
          </Touchable>
        )
      })}
    </Box>
  )
}

function SurfaceButton({
  label,
  onPress,
  tone = 'dark',
}: {
  label: string
  onPress?: () => void
  tone?: 'dark' | 'light'
}) {
  const sharedCtaTokens = componentTokens.storefrontHome.cta

  return (
    <Touchable onPress={onPress}>
      {({ hovered, focused }) => {
        const active = hovered || focused
        const contentColor =
          tone === 'light' && active ? colors.white : tone === 'light' ? colors.textPrimary : colors.white

        return (
          <Box
            style={{
              minHeight: sharedCtaTokens.minHeight,
              borderRadius: radius.full,
              borderWidth: borderWidth.thin,
              borderColor: tone === 'light'
                ? active ? colors.brandPrimary : colors.border
                : active ? colors.brandPrimaryHover : colors.brandPrimary,
              backgroundColor: tone === 'light'
                ? active ? colors.brandPrimary : colors.surface
                : active ? colors.brandPrimaryHover : colors.brandPrimary,
              paddingHorizontal: sharedCtaTokens.paddingX,
              paddingVertical: sharedCtaTokens.paddingY,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: sharedCtaTokens.gap,
              transitionProperty: 'background-color,border-color,transform',
              transitionDuration: `${motionDuration.microInteraction}ms`,
              transform: [{ translateY: active ? -1 : 0 }],
            }}
          >
            <Text
              variant='caption'
              weight='700'
              tone={tone === 'light' && active ? 'inverse' : tone === 'light' ? 'default' : 'inverse'}
              style={{
                fontSize: sharedCtaTokens.textSize,
                textTransform: 'uppercase',
                letterSpacing: sharedCtaTokens.textTracking,
              }}
            >
              {label}
            </Text>
            <Icon
              name='trendArrow'
              size={sharedCtaTokens.iconSize}
              color={contentColor}
            />
          </Box>
        )
      }}
    </Touchable>
  )
}

function RailNavButton({
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
  const rtl = isRtlLayout()
  const symbol = direction === 'prev'
    ? rtl ? '>' : '<'
    : rtl ? '<' : '>'

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole='button'
      accessibilityLabel={direction === 'prev' ? 'Previous items' : 'Next items'}
      style={{
        position: 'absolute',
        top,
        transform: [{ translateY: -22 }],
        [direction === 'prev' ? 'start' : 'end']: edge,
      } as any}
    >
      {({ hovered, focused }) => {
        const active = hovered || focused

        return (
          <Box
            style={{
              width: spacing['40'] + spacing['4'],
              height: spacing['40'] + spacing['4'],
              borderRadius: radius.full,
              backgroundColor: active ? colors.brandPrimarySubtle : colors.surfaceMuted,
              borderWidth: borderWidth.thin,
              borderColor: active ? colors.brandPrimary : colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              transitionProperty: 'background-color,transform',
              transitionDuration: `${motionDuration.microInteraction}ms`,
              transform: [{ translateY: active ? -1 : 0 }],
            }}
          >
            <Text
              variant='title'
              weight='700'
              tone='default'
            >
              {symbol}
            </Text>
          </Box>
        )
      }}
    </Touchable>
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
  const rtl = isRtlLayout()
  const symbol = direction === 'prev'
    ? rtl ? '›' : '‹'
    : rtl ? '‹' : '›'
  const productTokens = componentTokens.storefrontHome.product

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole='button'
      accessibilityLabel={direction === 'prev' ? 'Previous products' : 'Next products'}
      style={{
        position: 'absolute',
        top,
        transform: [{ translateY: -Math.round(productTokens.navButtonSize / 2) }],
        [direction === 'prev' ? 'start' : 'end']: edge,
      } as any}
    >
      {({ hovered, focused }) => {
        const active = hovered || focused

        return (
          <Box
            style={{
              width: productTokens.navButtonSize,
              height: productTokens.navButtonSize,
              borderRadius: radius.full,
              backgroundColor: active ? colors.brandPrimarySubtle : colors.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: borderWidth.thin,
              borderColor: active ? colors.brandPrimary : colors.border,
              transitionProperty: 'color,transform,border-color,background-color',
              transitionDuration: `${motionDuration.microInteraction}ms`,
              transform: [{ translateY: active ? -1 : 0 }],
              ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as any) : shadows.none),
            }}
          >
            <Text
              variant='title'
              weight='700'
              style={{
                color: active ? colors.brandPrimary : colors.textSecondary,
                fontSize: productTokens.navIconSize,
                lineHeight: productTokens.navIconSize,
              }}
            >
              {symbol}
            </Text>
          </Box>
        )
      }}
    </Touchable>
  )
}

function RailEdgeFade({
  edge,
  color,
}: {
  edge: 'start' | 'end'
  color: string
}) {
  const rtl = isRtlLayout()
  const direction = edge === 'start'
    ? rtl ? 'to left' : 'to right'
    : rtl ? 'to right' : 'to left'

  return (
    <Box
      pointerEvents='none'
      style={
        {
          position: 'absolute',
          top: 0,
          bottom: 0,
          [edge]: 0,
          width: spacing['32'],
          ...(Platform.OS === 'web'
            ? {
                backgroundImage: `linear-gradient(${direction}, ${color} 0%, transparent 100%)`,
              }
            : {
                backgroundColor: color,
                opacity: 0.78,
              }),
        } as any
      }
    />
  )
}

function heroBadgeIconName(tone: EditorialHeroTile['tone']): IconName {
  if (tone === 'flash') return 'deals'
  if (tone === 'editorial') return 'product'
  if (tone === 'new') return 'gift'
  if (tone === 'luxury') return 'star'
  return 'secure'
}

function HeroTileCard({
  item,
  width,
  height,
  onNavigate,
}: {
  item: EditorialHeroTile
  width: number
  height: number
  onNavigate?: (href: string) => void
}) {
  const theme = HERO_TONE_STYLES[item.tone]
  const heroTokens = componentTokens.storefrontHome.hero
  const sharedCtaTokens = componentTokens.storefrontHome.cta
  const inverseCopy = theme.subtitleText === colors.white
  const imageDrivenPanelGradient = useImageDrivenGradient(item.imageUrl, 'hero')

  return (
    <Touchable onPress={item.href ? () => onNavigate?.(item.href!) : undefined}>
      {({ hovered, focused }) => {
        const active = hovered || focused
        const heroImageRatio = heroTokens.imageAreaRatio
        const imageHeight = Math.round(height * heroImageRatio)
        const panelHeight = Math.max(0, height - imageHeight)
        const compactPanel = panelHeight <= heroTokens.compactTriggerHeight

        return (
          <Box
            style={{
              width,
              height,
              borderRadius: radius.lg,
              borderWidth: borderWidth.thin,
              borderColor: colors.border,
              overflow: 'hidden',
              backgroundColor: colors.surface,
              transform: [{ translateY: active ? -1 : 0 }],
              transitionProperty: 'transform,border-color',
              transitionDuration: `${motionDuration.hoverScale}ms`,
              ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as any) : shadows.none),
            }}
          >
            <Box
              style={{
                position: 'relative',
                height: imageHeight,
                overflow: 'hidden',
              }}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  resizeMode='cover'
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: [{ scale: active ? 1.03 : 1 }],
                  }}
                />
              ) : (
                <Box style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceMuted }} />
              )}
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }}
              />
              <Box
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: Math.min(spacing['96'], Math.round(imageHeight * 0.28)),
                  ...(Platform.OS === 'web'
                    ? ({
                        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,0.12), transparent)',
                      } as any)
                    : {
                        backgroundColor: 'rgba(255,255,255,0.12)',
                      }),
                }}
              />
              {Platform.OS === 'web' && theme.mediaOverlayGradient ? (
                <Box
                  style={
                    {
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      backgroundImage: theme.mediaOverlayGradient,
                    } as any
                  }
                />
              ) : null}
            </Box>

            <Box
              style={{
                height: panelHeight,
                minHeight: panelHeight,
                maxHeight: panelHeight,
                overflow: 'hidden',
                backgroundColor: colors.white,
                borderTopWidth: borderWidth.thin,
                borderTopColor: colors.border,
                padding: compactPanel ? heroTokens.compactPanelPadding : heroTokens.panelPadding,
                gap: compactPanel ? heroTokens.compactPanelGap : heroTokens.panelGap,
                ...(Platform.OS === 'web'
                  ? ({
                      backgroundImage: imageDrivenPanelGradient ?? theme.panelGradient,
                    } as any)
                  : null),
              }}
            >
              {compactPanel ? null : (
                <Box
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: heroTokens.topRowGap,
                  }}
                >
                  <Box
                    style={{
                      minHeight: heroTokens.badgeMinHeight,
                      borderRadius: radius.full,
                      backgroundColor: colors.surface,
                      borderWidth: borderWidth.thin,
                      borderColor: colors.border,
                      paddingHorizontal: heroTokens.badgePaddingX,
                      paddingVertical: heroTokens.badgePaddingY,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: heroTokens.badgeGap,
                    }}
                  >
                    <Box
                      style={{
                        width: heroTokens.badgeIconWrapSize,
                        height: heroTokens.badgeIconWrapSize,
                        borderRadius: radius.full,
                        backgroundColor: colors.brandPrimarySubtle,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        name={heroBadgeIconName(item.tone)}
                        size={heroTokens.badgeIconSize}
                        color={colors.brandPrimary}
                        weight='fill'
                      />
                    </Box>
                    <Text
                      variant='overline'
                      weight='700'
                      style={{
                        color: colors.textPrimary,
                        textTransform: 'uppercase',
                        letterSpacing: heroTokens.badgeTracking,
                      }}
                    >
                      {item.badge}
                    </Text>
                  </Box>
                  <Text
                    variant='overline'
                    weight='700'
                    style={{
                      color: theme.eyebrowText,
                      textTransform: 'uppercase',
                      letterSpacing: heroTokens.eyebrowTracking,
                    }}
                  >
                    {item.eyebrow}
                  </Text>
                </Box>
              )}

              <Text
                variant='h1'
                weight='700'
                numberOfLines={compactPanel ? 1 : 2}
                style={{
                  fontFamily: fontFamilies.heading,
                  color: theme.titleText,
                  fontSize: compactPanel ? heroTokens.compactTitleSize : heroTokens.titleSize,
                  lineHeight: compactPanel ? heroTokens.compactTitleLineHeight : heroTokens.titleLineHeight,
                  minHeight: compactPanel ? heroTokens.compactTitleMinHeight : heroTokens.titleMinHeight,
                  letterSpacing: heroTokens.titleTracking,
                }}
              >
                {item.title}
              </Text>

              {item.subtitle ? (
                <Text
                  variant='bodySm'
                  tone={inverseCopy ? 'inverse' : 'default'}
                  numberOfLines={2}
                  style={{
                    color: theme.subtitleText,
                    opacity: heroTokens.subtitleOpacity,
                    fontSize: compactPanel ? heroTokens.compactSubtitleSize : heroTokens.subtitleSize,
                    minHeight: compactPanel ? heroTokens.compactSubtitleMinHeight : heroTokens.subtitleMinHeight,
                    lineHeight: compactPanel ? heroTokens.compactSubtitleLineHeight : heroTokens.subtitleLineHeight,
                  }}
                >
                  {item.subtitle}
                </Text>
              ) : null}

              {compactPanel ? null : (
                <Text
                  variant='overline'
                  weight='700'
                  tone={inverseCopy ? 'inverse' : 'muted'}
                  style={{
                    marginTop: heroTokens.taglineMarginTop,
                    opacity: 0.66,
                    textTransform: 'uppercase',
                    letterSpacing: heroTokens.taglineTracking,
                  }}
                >
                  endless beauty
                </Text>
              )}

              {item.ctaLabel ? (
                <Box style={{ marginTop: 'auto' }}>
                  <Touchable onPress={item.href ? () => onNavigate?.(item.href!) : undefined}>
                    {({ hovered: ctaHovered, focused: ctaFocused }) => {
                      const activeCta = ctaHovered || ctaFocused

                      return (
                        <Box
                          style={{
                            alignSelf: 'flex-start',
                            minHeight: sharedCtaTokens.minHeight,
                            borderRadius: radius.md,
                            borderWidth: borderWidth.thin,
                            borderColor: activeCta ? colors.brandPrimary : colors.border,
                            backgroundColor: activeCta ? colors.brandPrimary : colors.surfaceMuted,
                            paddingHorizontal: sharedCtaTokens.paddingX,
                            paddingVertical: sharedCtaTokens.paddingY,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: sharedCtaTokens.gap,
                            transitionProperty: 'background-color,transform',
                            transitionDuration: `${motionDuration.microInteraction}ms`,
                            transform: [{ translateY: activeCta ? -1 : 0 }],
                          }}
                        >
                          <Text
                            variant='caption'
                            weight='700'
                            style={{
                              color: activeCta ? colors.white : colors.textPrimary,
                              fontSize: sharedCtaTokens.textSize,
                              textTransform: 'uppercase',
                              letterSpacing: sharedCtaTokens.textTracking,
                            }}
                          >
                            {item.ctaLabel}
                          </Text>
                          <Icon
                            name='trendArrow'
                            size={sharedCtaTokens.iconSize}
                            color={activeCta ? colors.white : colors.textPrimary}
                          />
                        </Box>
                      )
                    }}
                  </Touchable>
                </Box>
              ) : null}
            </Box>
          </Box>
        )
      }}
    </Touchable>
  )
}

function OfferBanner({
  block,
  index,
  isDesktop,
  width,
  onNavigate,
}: {
  block: PromoBlock
  index: number
  isDesktop: boolean
  width?: number | string
  onNavigate?: (href: string) => void
}) {
  const offerTokens = componentTokens.storefrontHome.offers
  const sharedCtaTokens = componentTokens.storefrontHome.cta
  const cardTokens = componentTokens.card
  const tone = OFFER_BANNER_TONES[index % OFFER_BANNER_TONES.length]
  const cardMinHeight = isDesktop ? offerTokens.cardMinHeightDesktop : offerTokens.cardMinHeightMobile
  const cardPadding = isDesktop ? offerTokens.cardPaddingDesktop : offerTokens.cardPaddingMobile
  const cardPaddingBottom = isDesktop ? offerTokens.cardPaddingBottomDesktop : offerTokens.cardPaddingBottomMobile
  const titleFontSize = isDesktop ? offerTokens.titleFontSizeDesktop : offerTokens.titleFontSizeMobile
  const titleLineHeight = isDesktop ? offerTokens.titleLineHeightDesktop : offerTokens.titleLineHeightMobile
  const imageDrivenGradient = useImageDrivenGradient(block.imageUrl, 'offer')
  const imageDrivenBorderColor = useMemo(() => {
    if (!imageDrivenGradient) {
      return colors.border
    }

    const fallbackRgb = hashImageUrlToRgb(block.imageUrl || `${index}`)
    const borderRgb = mixRgb(fallbackRgb, [255, 255, 255], 0.38)
    return rgbWithAlpha(borderRgb, 0.7)
  }, [block.imageUrl, imageDrivenGradient, index])
  const imageOverlayStack = imageDrivenGradient
    ? `${imageDrivenGradient}, ${offerTokens.imageOverlayGradient}`
    : offerTokens.imageOverlayGradient

  return (
    <Touchable onPress={block.href ? () => onNavigate?.(block.href!) : undefined}>
      {({ hovered, focused }) => {
        const active = hovered || focused

        return (
          <Box
            style={{
              width: width ?? '100%',
              height: cardMinHeight,
              minHeight: cardMinHeight,
              maxHeight: cardMinHeight,
              flexShrink: 0,
              borderRadius: cardTokens.radius.promo,
              overflow: 'hidden',
              borderWidth: borderWidth.thin,
              borderColor: Platform.OS === 'web' ? imageDrivenBorderColor : colors.border,
              transform: [{ translateY: active ? -1 : 0 }],
              transitionProperty: 'transform,border-color',
              transitionDuration: `${motionDuration.hoverScale}ms`,
              ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as any) : shadows.none),
            }}
          >
            {block.imageUrl ? (
              <Image
                source={{ uri: block.imageUrl }}
                resizeMode='cover'
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            ) : (
              <Box style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.backgroundSecondary }} />
            )}
            <Box
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                ...(Platform.OS === 'web'
                  ? ({
                      backgroundImage: imageOverlayStack,
                    } as any)
                  : {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }),
              }}
            />
            <Box
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                ...(Platform.OS === 'web'
                  ? ({
                      backgroundImage: imageDrivenGradient ? 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' : tone.radialOverlayGradient,
                    } as any)
                  : {
                      backgroundColor: 'rgba(255,255,255,0.08)',
                    }),
              }}
            />
            <Box
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                backgroundColor: offerTokens.glossOverlay,
              }}
            />
            <Box
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                paddingTop: cardPadding,
                paddingStart: cardPadding,
                paddingEnd: cardPadding,
                paddingBottom: cardPaddingBottom,
                gap: offerTokens.contentGap,
              }}
            >
              <Box style={{ maxWidth: offerTokens.copyMaxWidth, gap: spacing['6'] }}>
                {block.title ? (
                  <Text
                    variant='h2'
                    weight='700'
                    numberOfLines={2}
                    style={{
                      color: colors.white,
                      fontSize: titleFontSize,
                      lineHeight: titleLineHeight,
                      letterSpacing: offerTokens.titleTracking,
                    }}
                  >
                    {block.title}
                  </Text>
                ) : null}
                {block.subtitle ? (
                  <Text
                    variant='bodySm'
                    numberOfLines={2}
                    style={{
                      color: `rgba(255,255,255,${offerTokens.subtitleOpacity})`,
                      fontSize: offerTokens.subtitleFontSize,
                      lineHeight: offerTokens.subtitleLineHeight,
                    }}
                  >
                    {block.subtitle}
                  </Text>
                ) : null}
              </Box>
              {block.ctaLabel ? (
                <Touchable onPress={block.href ? () => onNavigate?.(block.href!) : undefined}>
                  {({ hovered: ctaHovered, focused: ctaFocused }) => {
                    const ctaActive = ctaHovered || ctaFocused

                    return (
                      <Box
                        style={{
                          alignSelf: 'flex-start',
                          minHeight: sharedCtaTokens.minHeight,
                          borderRadius: radius.md,
                          borderWidth: borderWidth.thin,
                          borderColor: ctaActive ? colors.brandPrimary : colors.border,
                          backgroundColor: ctaActive
                            ? colors.brandPrimary
                            : colors.surface,
                          paddingHorizontal: sharedCtaTokens.paddingX,
                          paddingVertical: sharedCtaTokens.paddingY,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: sharedCtaTokens.gap,
                          transitionProperty: 'background-color,border-color,transform',
                          transitionDuration: `${motionDuration.microInteraction}ms`,
                          transform: [{ translateY: ctaActive ? -1 : 0 }],
                        }}
                      >
                        <Text
                          variant='caption'
                          weight='600'
                          style={{
                            color: ctaActive ? colors.white : colors.textPrimary,
                            fontSize: sharedCtaTokens.textSize,
                            textTransform: 'uppercase',
                            letterSpacing: sharedCtaTokens.textTracking,
                          }}
                        >
                          {block.ctaLabel}
                        </Text>
                        <Icon
                          name='trendArrow'
                          size={sharedCtaTokens.iconSize}
                          color={ctaActive ? colors.white : colors.textPrimary}
                        />
                      </Box>
                    )
                  }}
                </Touchable>
              ) : null}
            </Box>
          </Box>
        )
      }}
    </Touchable>
  )
}

function BrandSpotlightRailSection({
  section,
  isDesktop,
  productCardWidth,
  productColumns,
  autoplay,
  onNavigate,
  onSelectProduct,
  onQuickView,
  onAddToCart,
}: {
  section: BrandSpotlightSection
  isDesktop: boolean
  productCardWidth: number
  productColumns: number
  autoplay?: RailAutoplaySetting
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onQuickView?: (item: HomeProductItem) => void
  onAddToCart?: (productId: string) => void
}) {
  const brandTokens = componentTokens.storefrontHome.brandSpotlightRail
  const productTokens = componentTokens.storefrontHome.product
  const railRef = useRef<ScrollView | null>(null)
  const offsetRef = useRef(0)
  const viewportWidthRef = useRef(0)
  const contentWidthRef = useRef(0)
  const railDistance = productCardWidth + productTokens.railGap
  const navTop = Math.max(96, Math.round(productCardWidth * productTokens.navTopFactor))
  const bannerMinHeight = isDesktop
    ? brandTokens.bannerMinHeightDesktop
    : brandTokens.bannerMinHeightMobile
  const bannerPadding = isDesktop
    ? brandTokens.bannerPaddingDesktop
    : brandTokens.bannerPaddingMobile
  const bannerTitleSize = isDesktop
    ? brandTokens.bannerTitleFontSizeDesktop
    : brandTokens.bannerTitleFontSizeMobile
  const bannerTitleLineHeight = isDesktop
    ? brandTokens.bannerTitleLineHeightDesktop
    : brandTokens.bannerTitleLineHeightMobile
  const heading = section.railTitle?.trim() || section.bannerTitle

  useAutoScrollRail({
    enabled: autoplay?.enabled,
    autoplayMs: autoplay?.autoplayMs,
    railRef,
    offsetRef,
    viewportWidthRef,
    contentWidthRef,
    stepDistance: railDistance,
    itemCount: section.items.length,
  })

  return (
    <HomeContainer>
      <Box style={{ gap: brandTokens.sectionGap }}>
        <Touchable onPress={section.bannerHref ? () => onNavigate?.(section.bannerHref!) : undefined}>
          {({ hovered, focused }) => {
            const active = hovered || focused

            return (
              <Box
                style={{
                  minHeight: bannerMinHeight,
                  borderRadius: radius.lg,
                  overflow: 'hidden',
                  borderWidth: borderWidth.thin,
                  borderColor: colors.border,
                  transform: [{ translateY: active ? -2 : 0 }],
                  transitionProperty: 'transform,border-color',
                  transitionDuration: `${motionDuration.hoverScale}ms`,
                  ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as any) : shadows.none),
                }}
              >
                {section.bannerImageUrl ? (
                  <Image
                    source={{ uri: section.bannerImageUrl }}
                    resizeMode='cover'
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                  />
                ) : (
                  <Box
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backgroundColor: colors.backgroundSecondary,
                    }}
                  />
                )}
                <Box
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    ...(Platform.OS === 'web'
                      ? ({
                          backgroundImage: brandTokens.bannerOverlayGradient,
                        } as any)
                      : {
                          backgroundColor: brandTokens.bannerOverlayFallback,
                        }),
                  }}
                />
                <Box
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    ...(Platform.OS === 'web'
                      ? ({
                          backgroundImage: brandTokens.bannerRadialGradient,
                        } as any)
                      : null),
                  }}
                />
                <Box
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    gap: spacing['10'],
                    paddingHorizontal: bannerPadding,
                    paddingVertical: bannerPadding,
                    maxWidth: brandTokens.bannerCopyMaxWidth + bannerPadding,
                  }}
                >
                  <Text
                    variant='caption'
                    weight='700'
                    tone='inverse'
                    numberOfLines={1}
                    style={{
                      opacity: brandTokens.bannerEyebrowOpacity,
                      textTransform: 'uppercase',
                      letterSpacing: brandTokens.bannerEyebrowTracking,
                    }}
                  >
                    {heading}
                  </Text>
                  <Text
                    variant='h1'
                    weight='700'
                    tone='inverse'
                    numberOfLines={2}
                    style={{
                      fontFamily: fontFamilies.display,
                      fontSize: bannerTitleSize,
                      lineHeight: bannerTitleLineHeight,
                      letterSpacing: brandTokens.bannerTitleTracking,
                    }}
                  >
                    {section.bannerTitle}
                  </Text>
                  {section.bannerSubtitle ? (
                    <Text
                      variant='body'
                      tone='inverse'
                      numberOfLines={2}
                      style={{
                        lineHeight: brandTokens.bannerSubtitleLineHeight,
                        opacity: 0.9,
                      }}
                    >
                      {section.bannerSubtitle}
                    </Text>
                  ) : null}
                  {section.bannerCtaLabel ? (
                    <SurfaceButton
                      label={section.bannerCtaLabel}
                      onPress={section.bannerHref ? () => onNavigate?.(section.bannerHref!) : undefined}
                      tone='light'
                    />
                  ) : null}
                </Box>
              </Box>
            )
          }}
        </Touchable>

        <Box style={{ gap: spacing['24'] }}>
          <EditorialHeading title={heading} />
          <Box style={{ position: 'relative' }}>
            <ScrollView
              ref={railRef}
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              onLayout={(event) => {
                viewportWidthRef.current = event.nativeEvent.layout.width
              }}
              onContentSizeChange={(contentWidth) => {
                contentWidthRef.current = contentWidth
              }}
              onScroll={(event) => {
                offsetRef.current = event.nativeEvent.contentOffset.x
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ gap: productTokens.railGap, paddingBottom: spacing['4'] }}
            >
              {section.items.slice(0, 12).map((item) => (
                <ProductCard
                  key={`${section.id}-${item.id}`}
                  item={item}
                  width={productCardWidth}
                  onPress={(selected) => onSelectProduct?.(selected.id)}
                  onQuickView={(selected) => onQuickView?.(selected)}
                  onAddToCart={(selected) => onAddToCart?.(selected.id)}
                />
              ))}
            </ScrollView>
            {isDesktop && section.items.length > productColumns ? (
              <>
                <ProductRailNavButton
                  direction='prev'
                  top={navTop}
                  edge={-productTokens.navEdgeOffset}
                  onPress={() => scrollRailBy(railRef, offsetRef, railDistance, 'prev')}
                />
                <ProductRailNavButton
                  direction='next'
                  top={navTop}
                  edge={-productTokens.navEdgeOffset}
                  onPress={() => scrollRailBy(railRef, offsetRef, railDistance, 'next')}
                />
              </>
            ) : null}
          </Box>
        </Box>
      </Box>
    </HomeContainer>
  )
}

export function SephoraReferenceHome({
  heroItems,
  tickerItems,
  newArrivalsTitle = 'New Arrivals',
  newArrivalsItems,
  featuredTitle = 'Featured Products',
  featuredItems,
  topBrands,
  categoryItems,
  editorialHotspotSection = null,
  ugcItems,
  promoBlocks,
  brandSpotlights = [],
  railAutoplay,
  loading = false,
  error,
  onRetry,
  onNavigate,
  onSelectProduct,
  onQuickView,
  onAddToCart,
}: SephoraReferenceHomeProps) {
  const { width } = useWindowDimensions()
  const [hasHydrated, setHasHydrated] = useState(Platform.OS !== 'web')
  const heroRailRef = useRef<ScrollView | null>(null)
  const departmentRailRef = useRef<ScrollView | null>(null)
  const arrivalsRailRef = useRef<ScrollView | null>(null)
  const featuredRailRef = useRef<ScrollView | null>(null)
  const heroOffsetRef = useRef(0)
  const heroViewportWidthRef = useRef(0)
  const heroContentWidthRef = useRef(0)
  const departmentOffsetRef = useRef(0)
  const departmentViewportWidthRef = useRef(0)
  const departmentContentWidthRef = useRef(0)
  const arrivalsOffsetRef = useRef(0)
  const arrivalsViewportWidthRef = useRef(0)
  const arrivalsContentWidthRef = useRef(0)
  const featuredOffsetRef = useRef(0)
  const featuredViewportWidthRef = useRef(0)
  const featuredContentWidthRef = useRef(0)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return
    }
    setHasHydrated(true)
  }, [])

  // Keep server render and first web client render deterministic to avoid hydration width drift.
  const effectiveWidth = Platform.OS === 'web' && !hasHydrated ? 0 : width
  const viewportWidth = effectiveWidth || layout.containerMaxWidth
  const isDesktop = viewportWidth >= 1025 || (Platform.OS === 'web' && effectiveWidth === 0)
  const [railFilter, setRailFilter] = useState<DiscoveryRailFilter>('all')
  const heroTokens = componentTokens.storefrontHome.hero
  const offersTokens = componentTokens.storefrontHome.offers
  const productTokens = componentTokens.storefrontHome.product
  const categoryTokens = componentTokens.storefrontHome.categoryCards
  const layoutTokens = componentTokens.storefrontHome.layout
  const shellContentWidth = Math.max(
    280,
    Math.min(viewportWidth, layout.containerMaxWidth) - spacing.pageX * 2,
  )
  const heroContentPaddingX = isDesktop
    ? heroTokens.desktopContainerPaddingX
    : heroTokens.mobileContainerPaddingX
  const heroContentWidth = Math.max(
    280,
    viewportWidth - heroContentPaddingX * 2,
  )
  const heroCardWidth = isDesktop
    ? Math.round(
      (heroContentWidth - heroTokens.railGap * (Math.ceil(heroTokens.desktopVisibleCards) - 1)) /
      heroTokens.desktopVisibleCards,
    )
    : Math.max(292, viewportWidth - spacing.pageX * 2 - spacing['16'])
  const heroCardHeight = isDesktop
    ? heroTokens.desktopCardHeight
    : viewportWidth >= 768
      ? heroTokens.tabletCardHeight
      : heroTokens.mobileCardHeight
  const productColumns = isDesktop
    ? productTokens.columns.desktop
    : viewportWidth >= 760
      ? productTokens.columns.tablet
      : productTokens.columns.mobile
  const productCardWidth = isDesktop
    ? 200
    : Math.max(
        productTokens.desktopMinWidth,
        Math.floor((shellContentWidth - productTokens.railGap * (productColumns - 1)) / productColumns),
      )
  const departmentCardWidth = isDesktop
    ? categoryTokens.desktopWidth
    : Math.min(
        categoryTokens.mobileMaxWidth,
        Math.max(categoryTokens.mobileMinWidth, viewportWidth - spacing.pageX * 2 - spacing['64']),
      )
  const ugcColumns = isDesktop ? 8 : 4

  const heroTiles = useMemo(
    () => buildEditorialHeroTiles(heroItems, promoBlocks.slice(0, 3)).slice(0, 4),
    [heroItems, promoBlocks],
  )
  const departments = useMemo(() => categoryItems, [categoryItems])
  const testimonials = useMemo(() => buildTestimonials(ugcItems), [ugcItems])
  const ratingDots =
    testimonials.length > 0
      ? testimonials
      : [{ id: 'fallback-1', name: '', role: '', quote: '' }]

  const arrivals = useMemo(
    () => applyDiscoveryRailFilter(newArrivalsItems, railFilter).slice(0, 12),
    [newArrivalsItems, railFilter],
  )
  const featured = useMemo(
    () => applyDiscoveryRailFilter(featuredItems, railFilter).slice(0, 12),
    [featuredItems, railFilter],
  )
  const ugcStrip = ugcItems.slice(0, 8)
  const showcaseBrands = topBrands.slice(0, 8)
  const showcaseImage = promoBlocks[0]?.imageUrl || heroTiles[0]?.imageUrl || ugcItems[0]?.imageUrl
  const additionalBrandSpotlights = brandSpotlights
    .filter((section) => (section.items?.length ?? 0) > 0)
    .slice(0, 2)
  const heroRailDistance = heroCardWidth + heroTokens.railGap
  const departmentRailDistance = departmentCardWidth + categoryTokens.railGap
  const productRailDistance = productCardWidth + productTokens.railGap
  const productRailNavTop = Math.max(96, Math.round(productCardWidth * productTokens.navTopFactor))
  const brandSpotlightMinHeight = isDesktop ? 452 : 320
  const brandHallColumns = isDesktop ? 4 : 2
  const offerBannerWidth = isDesktop
    ? Math.floor((shellContentWidth - offersTokens.rowGap) / 2)
    : '100%'
  const brandHallCardWidth = isDesktop
    ? Math.floor((shellContentWidth * 0.58 - spacing['24'] - spacing['16'] * (brandHallColumns - 1)) / brandHallColumns)
    : Math.floor((shellContentWidth - spacing['16']) / 2)

  useEffect(() => {
    emitNativeScrollOffset(0)
    return () => {
      emitNativeScrollOffset(0)
    }
  }, [])

  useAutoScrollRail({
    enabled: railAutoplay?.hero?.enabled,
    autoplayMs: railAutoplay?.hero?.autoplayMs ?? heroTokens.autoScrollIntervalMs,
    railRef: heroRailRef,
    offsetRef: heroOffsetRef,
    viewportWidthRef: heroViewportWidthRef,
    contentWidthRef: heroContentWidthRef,
    stepDistance: heroRailDistance,
    itemCount: heroTiles.length,
  })

  useAutoScrollRail({
    enabled: railAutoplay?.categories?.enabled,
    autoplayMs: railAutoplay?.categories?.autoplayMs,
    railRef: departmentRailRef,
    offsetRef: departmentOffsetRef,
    viewportWidthRef: departmentViewportWidthRef,
    contentWidthRef: departmentContentWidthRef,
    stepDistance: departmentRailDistance,
    itemCount: departments.length,
  })

  useAutoScrollRail({
    enabled: railAutoplay?.newArrivals?.enabled,
    autoplayMs: railAutoplay?.newArrivals?.autoplayMs,
    railRef: arrivalsRailRef,
    offsetRef: arrivalsOffsetRef,
    viewportWidthRef: arrivalsViewportWidthRef,
    contentWidthRef: arrivalsContentWidthRef,
    stepDistance: productRailDistance,
    itemCount: arrivals.length,
  })

  useAutoScrollRail({
    enabled: railAutoplay?.featured?.enabled,
    autoplayMs: railAutoplay?.featured?.autoplayMs,
    railRef: featuredRailRef,
    offsetRef: featuredOffsetRef,
    viewportWidthRef: featuredViewportWidthRef,
    contentWidthRef: featuredContentWidthRef,
    stepDistance: productRailDistance,
    itemCount: featured.length,
  })

  const handleNativeScroll = useCallback((event: any) => {
    emitNativeScrollOffset(event?.nativeEvent?.contentOffset?.y ?? 0)
  }, [])

  if (loading) {
    return (
      <Box style={{ gap: spacing['24'] }}>
        <Box
          style={{
            minHeight: heroCardHeight,
            borderRadius: radius.lg,
            backgroundColor: colors.surfaceMuted,
          }}
        />
        <Box
          style={{
            minHeight: 228,
            borderRadius: radius.lg,
            backgroundColor: colors.surfaceMuted,
          }}
        />
        <Box
          style={{
            minHeight: 320,
            borderRadius: radius.lg,
            backgroundColor: colors.surfaceMuted,
          }}
        />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        style={{
          borderRadius: radius.lg,
          borderWidth: borderWidth.thin,
          borderColor: colors.stroke,
          backgroundColor: colors.surface,
          padding: spacing['24'],
          gap: spacing['12'],
        }}
      >
        <Text variant='bodySm' tone='danger'>
          {error}
        </Text>
        {onRetry ? <SurfaceButton label='Retry' onPress={onRetry} /> : null}
      </Box>
    )
  }

  const homeContent = (
    <Box style={{ width: '100%', gap: layoutTokens.rootGap, backgroundColor: colors.background }} suppressHydrationWarning>
        <Box
          style={{
            borderTopWidth: borderWidth.none,
            borderBottomWidth: borderWidth.none,
            borderColor: 'transparent',
            backgroundColor: colors.white,
            overflow: 'hidden',
          }}
          suppressHydrationWarning
        >
        <Box
          pointerEvents='none'
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            ...(Platform.OS === 'web'
              ? ({
                  backgroundImage: HERO_SECTION_FIELD_GRADIENT,
                } as any)
              : {
                  backgroundColor: HERO_SECTION_OVERLAY,
                  opacity: 0.35,
                }),
          }}
        />
        <Box
          style={{
            width: '100%',
            paddingHorizontal: heroContentPaddingX,
          }}
        >
          <Box
            style={{
              position: 'relative',
              paddingTop: spacing['16'],
              paddingBottom: spacing['12'],
            }}
          >
            <ScrollView
              ref={heroRailRef}
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              onLayout={(event) => {
                heroViewportWidthRef.current = event.nativeEvent.layout.width
              }}
              onContentSizeChange={(contentWidth) => {
                heroContentWidthRef.current = contentWidth
              }}
              onScroll={(event) => {
                heroOffsetRef.current = event.nativeEvent.contentOffset.x
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ gap: heroTokens.railGap }}
            >
              {heroTiles.map((tile) => (
                <HeroTileCard
                  key={tile.id}
                  item={tile}
                  width={heroCardWidth}
                  height={heroCardHeight}
                  onNavigate={onNavigate}
                />
              ))}
            </ScrollView>
            {isDesktop && heroTiles.length > 3 ? (
              <>
                <RailNavButton
                  direction='prev'
                  top={Math.round(heroCardHeight / 2)}
                  edge={spacing['16']}
                  onPress={() => scrollRailBy(heroRailRef, heroOffsetRef, heroRailDistance, 'prev')}
                />
                <RailNavButton
                  direction='next'
                  top={Math.round(heroCardHeight / 2)}
                  edge={spacing['16']}
                  onPress={() => scrollRailBy(heroRailRef, heroOffsetRef, heroRailDistance, 'next')}
                />
              </>
            ) : null}
          </Box>
        </Box>
      </Box>

      <Box
        style={{
          borderTopWidth: borderWidth.thin,
          borderBottomWidth: borderWidth.thin,
          borderColor: colors.stroke,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        }}
      >
        <Box
          pointerEvents='none'
          style={{
            position: 'absolute',
            top: -spacing['40'],
            end: -spacing['20'],
            width: 180,
            height: 180,
            borderRadius: 180,
            backgroundColor: HERO_SECTION_OVERLAY,
          }}
        />
        <Box
          pointerEvents='none'
          style={{
            position: 'absolute',
            bottom: -spacing['48'],
            start: -spacing['24'],
            width: 180,
            height: 180,
            borderRadius: 180,
            backgroundColor: HERO_SECTION_MIST,
          }}
        />
        <HomeContainer>
          <Box
            style={{
              paddingVertical: layoutTokens.categorySectionPaddingY,
              gap: layoutTokens.categorySectionGap,
            }}
          >
            <EditorialHeading title='Top Categories' align='center' />
            <Box style={{ position: 'relative' }}>
            <ScrollView
              ref={departmentRailRef}
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              onLayout={(event) => {
                departmentViewportWidthRef.current = event.nativeEvent.layout.width
              }}
              onContentSizeChange={(contentWidth) => {
                departmentContentWidthRef.current = contentWidth
              }}
              onScroll={(event) => {
                departmentOffsetRef.current = event.nativeEvent.contentOffset.x
              }}
                scrollEventThrottle={16}
                contentContainerStyle={{
                  gap: categoryTokens.railGap,
                  paddingTop: categoryTokens.railTopPadding,
                  paddingBottom: categoryTokens.railBottomPadding,
                }}
              >
                {departments.map((department, index) => (
                  <Touchable key={department.id} onPress={() => onNavigate?.(department.href ?? '/shop')}>
                    {({ hovered, focused }) => {
                      const active = hovered || focused

                      return (
                        <Box
                          style={{
                            width: departmentCardWidth,
                            minHeight: categoryTokens.minHeight + spacing['12'],
                            borderRadius: radius.sm,
                            borderWidth: borderWidth.thin,
                            borderColor: active ? colors.brandPrimary : colors.border,
                            backgroundColor: active ? colors.brandPrimarySubtle : colors.surface,
                            paddingHorizontal: categoryTokens.contentPaddingX,
                            paddingVertical: spacing['12'],
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: spacing['8'],
                            overflow: 'hidden',
                            transform: [{ translateY: 0 }],
                            transitionProperty: 'border-color,background-color',
                            transitionDuration: `${motionDuration.microInteraction}ms`,
                            ...(Platform.OS === 'web'
                              ? ({
                                  boxShadow: elevation.none,
                                } as any)
                              : shadows.none),
                          }}
                        >
                          <Box
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              flex: 1,
                              gap: spacing['12'],
                            }}
                          >
                            <Box
                              style={{
                                width: categoryTokens.mediaSize,
                                height: categoryTokens.mediaSize,
                                borderRadius: radius.sm,
                                borderWidth: borderWidth.thin,
                                borderColor: active ? colors.brandPrimary : colors.border,
                                backgroundColor: active
                                  ? colors.backgroundSecondary
                                  : DEPARTMENT_BACKGROUNDS[index % DEPARTMENT_BACKGROUNDS.length],
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                              }}
                            >
                              {department.imageUrl ? (
                                <Image
                                source={{ uri: department.imageUrl }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  transform: [{ scale: 1 }],
                                  transitionProperty: 'opacity',
                                  transitionDuration: `${motionDuration.normal}ms`,
                                }}
                                resizeMode='contain'
                                />
                              ) : (
                                <Icon
                                  name={DEPARTMENT_ICONS[index % DEPARTMENT_ICONS.length]}
                                  size={spacing['22']}
                                  color={colors.textPrimary}
                                />
                              )}
                            </Box>
                            <Box style={{ flex: 1, gap: spacing['4'] }}>
                              <Text
                                variant='bodySm'
                                weight='700'
                                numberOfLines={1}
                                style={{
                                  lineHeight: categoryTokens.titleLineHeight,
                                  letterSpacing: -0.2,
                                }}
                              >
                                {department.label}
                              </Text>
                              <Text
                                variant='caption'
                                tone='muted'
                                style={{
                                  letterSpacing: 0.4,
                                  lineHeight: categoryTokens.metaLineHeight,
                                }}
                              >
                                {department.itemCount ?? 0} items
                              </Text>
                            </Box>
                          </Box>
                          <Box
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: radius.full,
                              backgroundColor: active ? colors.brandPrimary : colors.surfaceMuted,
                              borderWidth: borderWidth.thin,
                              borderColor: active ? colors.brandPrimary : colors.border,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon
                              name='trendArrow'
                              size={categoryTokens.arrowIconSize}
                              color={active ? colors.white : colors.brandPrimary}
                            />
                          </Box>
                        </Box>
                      )
                    }}
                  </Touchable>
                ))}
              </ScrollView>
              {departments.length > (isDesktop ? 4 : 2) ? (
                <>
                  <RailEdgeFade edge='start' color={colors.surface} />
                  <RailEdgeFade edge='end' color={colors.surface} />
                </>
              ) : null}
              {isDesktop && departments.length > 4 ? (
                <>
                  <RailNavButton
                    direction='prev'
                    top={38}
                    edge={-spacing['12']}
                    onPress={() =>
                      scrollRailBy(departmentRailRef, departmentOffsetRef, departmentRailDistance, 'prev')
                    }
                  />
                  <RailNavButton
                    direction='next'
                    top={38}
                    edge={-spacing['12']}
                    onPress={() =>
                      scrollRailBy(departmentRailRef, departmentOffsetRef, departmentRailDistance, 'next')
                    }
                  />
                </>
              ) : null}
            </Box>
          </Box>
        </HomeContainer>
      </Box>

      <HomeContainer>
        <Box style={{ gap: layoutTokens.sectionGap }}>
          <CommerceGridHeader
            title={newArrivalsTitle}
            actionLabel='Shop All'
            onPressAction={() => onNavigate?.('/shop')}
          />
          <DiscoveryFilterChips active={railFilter} onChange={setRailFilter} />
          <Box style={{ position: 'relative' }}>
            <ScrollView
              ref={arrivalsRailRef}
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              onLayout={(event) => {
                arrivalsViewportWidthRef.current = event.nativeEvent.layout.width
              }}
              onContentSizeChange={(contentWidth) => {
                arrivalsContentWidthRef.current = contentWidth
              }}
              onScroll={(event) => {
                arrivalsOffsetRef.current = event.nativeEvent.contentOffset.x
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ gap: productTokens.railGap, paddingBottom: spacing['4'] }}
            >
              {arrivals.map((item) => (
                <ProductCard
                  key={`arrivals-${item.id}`}
                  item={item}
                  width={productCardWidth}
                  onPress={(selected) => onSelectProduct?.(selected.id)}
                  {...(onQuickView ? { onQuickView } : {})}
                  onAddToCart={(selected) => onAddToCart?.(selected.id)}
                />
              ))}
            </ScrollView>
            {arrivals.length > productColumns ? (
              <>
                <RailEdgeFade edge='start' color={colors.surface} />
                <RailEdgeFade edge='end' color={colors.surface} />
              </>
            ) : null}
            {isDesktop && arrivals.length > productColumns ? (
              <>
                <ProductRailNavButton
                  direction='prev'
                  top={productRailNavTop}
                  edge={-productTokens.navEdgeOffset}
                  onPress={() => scrollRailBy(arrivalsRailRef, arrivalsOffsetRef, productRailDistance, 'prev')}
                />
                <ProductRailNavButton
                  direction='next'
                  top={productRailNavTop}
                  edge={-productTokens.navEdgeOffset}
                  onPress={() => scrollRailBy(arrivalsRailRef, arrivalsOffsetRef, productRailDistance, 'next')}
                />
              </>
            ) : null}
          </Box>
        </Box>
      </HomeContainer>

      {promoBlocks.length > 0 ? (
        <HomeContainer>
          <Box style={{ gap: offersTokens.sectionGap }}>
            <CommerceGridHeader
              title='Today Deals'
              actionLabel='Shop deals'
              onPressAction={() => onNavigate?.('/shop')}
              centered={false}
              reserveWidth={0}
            />
            <Box style={{ gap: offersTokens.rowGap }}>
              {chunkIntoRows(promoBlocks.slice(0, 4), isDesktop ? 2 : 1).map((row, rowIndex) => (
                <Box
                  key={`offers-row-${rowIndex}`}
                  style={{ flexDirection: isDesktop ? 'row' : 'column', gap: offersTokens.rowGap }}
                >
                  {row.map((block, columnIndex) => (
                    <OfferBanner
                      key={block.href ?? `offer-${rowIndex}-${columnIndex}`}
                      block={block}
                      index={rowIndex * 2 + columnIndex}
                      isDesktop={isDesktop}
                      width={offerBannerWidth}
                      onNavigate={onNavigate}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </HomeContainer>
      ) : null}

      {editorialHotspotSection ? (
        <HomeContainer>
          <EditorialHotspotSection
            section={editorialHotspotSection}
            onNavigate={onNavigate}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
          />
        </HomeContainer>
      ) : null}

      <HomeContainer>
        <Box
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            gap: layoutTokens.brandSpotlightGap,
          }}
        >
          <Box
            style={{
              flex: isDesktop ? 1 : undefined,
              minHeight: brandSpotlightMinHeight,
              borderRadius: radius.lg,
              overflow: 'hidden',
              borderWidth: borderWidth.thin,
              borderColor: colors.border,
            }}
          >
            {showcaseImage ? (
              <Image
                source={{ uri: showcaseImage }}
                resizeMode='cover'
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            ) : (
              <Box style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.backgroundSecondary }} />
            )}
            <Box
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.12)',
              }}
            />
            <Box
              pointerEvents='none'
              style={{
                position: 'absolute',
                top: 0,
                end: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                opacity: 0.35,
                borderTopStartRadius: 180,
              }}
            />
            <Box
              p='24'
              style={{
                flex: 1,
                justifyContent: 'center',
                gap: layoutTokens.brandPanelGap,
                paddingHorizontal: isDesktop ? spacing['32'] : spacing['24'],
                paddingVertical: isDesktop ? spacing['32'] : spacing['24'],
              }}
            >
              <Text
                variant='caption'
                tone='inverse'
                weight='700'
                style={{ textTransform: 'uppercase', letterSpacing: 1.8, opacity: 0.78 }}
              >
                Brand spotlight
              </Text>
              <Text
                variant='h1'
                weight='700'
                tone='inverse'
                style={{
                  letterSpacing: -1.6,
                  maxWidth: 320,
                }}
              >
                {showcaseBrands[0]?.name ?? 'Curology'} beauty spotlight
              </Text>
              <Text variant='bodySm' tone='inverse' style={{ opacity: 0.86, maxWidth: 340 }}>
                A department-store style feature on trusted formulas, barrier care, and daily beauty essentials.
              </Text>
              <SurfaceButton label='Shop now' onPress={() => onNavigate?.('/shop')} tone='light' />
            </Box>
          </Box>

          <Box
            style={{
              flex: isDesktop ? 1.6 : undefined,
              minHeight: brandSpotlightMinHeight,
              gap: layoutTokens.sectionGap,
              borderWidth: borderWidth.thin,
              borderColor: colors.border,
              borderRadius: radius.lg,
              backgroundColor: colors.surface,
              padding: isDesktop ? spacing['32'] : spacing['24'],
            }}
          >
            <EditorialHeading title='Trending Brands' />
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['16'] }}>
              {showcaseBrands.slice(0, brandHallColumns * 2).map((brand) => (
                <Touchable key={brand.id} onPress={() => brand.href && onNavigate?.(brand.href)}>
                  {({ hovered, focused }) => {
                    const active = hovered || focused

                    return (
                      <Box
                        style={{
                          width: brandHallCardWidth,
                          minHeight: spacing['128'],
                          borderRadius: radius.md,
                          borderWidth: borderWidth.thin,
                          borderColor: active ? colors.brandPrimary : colors.border,
                          backgroundColor: active ? colors.brandPrimarySubtle : colors.surface,
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing['10'],
                          paddingHorizontal: spacing['20'],
                          paddingVertical: spacing['20'],
                          transform: [{ translateY: active ? -2 : 0 }],
                          transitionProperty: 'transform,box-shadow,background-color',
                          transitionDuration: `${motionDuration.microInteraction}ms`,
                          ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as any) : null),
                        }}
                      >
                        {brand.logoUrl ? (
                          <Image
                            source={{ uri: brand.logoUrl }}
                            resizeMode='contain'
                            style={{ width: '80%', height: 56 }}
                          />
                        ) : null}
                        <Text
                          variant='caption'
                          weight='700'
                          numberOfLines={1}
                          style={{ textTransform: 'uppercase', letterSpacing: 1.4 }}
                        >
                          {brand.name}
                        </Text>
                      </Box>
                    )
                  }}
                </Touchable>
              ))}
            </Box>
          </Box>
        </Box>
      </HomeContainer>

      <HomeContainer>
        <Box style={{ gap: layoutTokens.sectionGap }}>
          <CommerceGridHeader
            title={featuredTitle}
            actionLabel='Shop All'
            onPressAction={() => onNavigate?.('/shop')}
          />
          <Box style={{ position: 'relative' }}>
            <ScrollView
              ref={featuredRailRef}
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              onLayout={(event) => {
                featuredViewportWidthRef.current = event.nativeEvent.layout.width
              }}
              onContentSizeChange={(contentWidth) => {
                featuredContentWidthRef.current = contentWidth
              }}
              onScroll={(event) => {
                featuredOffsetRef.current = event.nativeEvent.contentOffset.x
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ gap: productTokens.railGap, paddingBottom: spacing['4'] }}
            >
              {featured.map((item) => (
                <ProductCard
                  key={`featured-${item.id}`}
                  item={item}
                  width={productCardWidth}
                  onPress={(selected) => onSelectProduct?.(selected.id)}
                  {...(onQuickView ? { onQuickView } : {})}
                  onAddToCart={(selected) => onAddToCart?.(selected.id)}
                />
              ))}
            </ScrollView>
            {featured.length > productColumns ? (
              <>
                <RailEdgeFade edge='start' color={colors.surface} />
                <RailEdgeFade edge='end' color={colors.surface} />
              </>
            ) : null}
            {isDesktop && featured.length > productColumns ? (
              <>
                <ProductRailNavButton
                  direction='prev'
                  top={productRailNavTop}
                  edge={-productTokens.navEdgeOffset}
                  onPress={() => scrollRailBy(featuredRailRef, featuredOffsetRef, productRailDistance, 'prev')}
                />
                <ProductRailNavButton
                  direction='next'
                  top={productRailNavTop}
                  edge={-productTokens.navEdgeOffset}
                  onPress={() => scrollRailBy(featuredRailRef, featuredOffsetRef, productRailDistance, 'next')}
                />
              </>
            ) : null}
          </Box>
        </Box>
      </HomeContainer>

      {additionalBrandSpotlights.map((section) => (
        <BrandSpotlightRailSection
          key={section.id}
          section={section}
          isDesktop={isDesktop}
          productCardWidth={productCardWidth}
          productColumns={productColumns}
          autoplay={railAutoplay?.brandSpotlights}
          onNavigate={onNavigate}
          onSelectProduct={onSelectProduct}
          onQuickView={onQuickView}
          onAddToCart={onAddToCart}
        />
      ))}

      <HomeContainer>
        <Box style={{ gap: layoutTokens.sectionGap }}>
          <Box style={{ flexDirection: isDesktop ? 'row' : 'column', gap: layoutTokens.sectionGap }}>
            <Box style={{ width: isDesktop ? 300 : undefined, gap: layoutTokens.sectionGap }}>
              <EditorialHeading title='See What Shoppers Say' />
              <Box style={{ gap: spacing['8'] }}>
                <Text variant='bodySm' tone='default'>
                  ★★★★★
                </Text>
                <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
                  <Text variant='title' weight='700'>
                    4.9
                  </Text>
                  <Text variant='bodySm' tone='muted'>
                    (1200+ Reviews)
                  </Text>
                </Box>
              </Box>
            </Box>

            <Box style={{ flex: 1, gap: spacing['20'] }}>
              <Box
                style={{
                  position: 'relative',
                  flexDirection: isDesktop ? 'row' : 'column',
                  gap: spacing['16'],
                }}
              >
                {testimonials.map((item, index) => (
                  <Box
                    key={item.id}
                    style={{
                      flex: 1,
                      borderRadius: radius.lg,
                      borderWidth: borderWidth.thin,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      padding: spacing['24'],
                      gap: spacing['16'],
                      ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as any) : shadows.none),
                    }}
                  >
                    <Box style={{ flexDirection: 'row', gap: spacing['16'], alignItems: 'flex-start' }}>
                      <Box
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: radius.full,
                          overflow: 'hidden',
                          backgroundColor: colors.surfaceMuted,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.imageUrl ? (
                          <Image
                            source={{ uri: item.imageUrl }}
                            resizeMode='cover'
                            style={{ width: '100%', height: '100%' }}
                          />
                        ) : (
                          <Text variant='subtitle' weight='700'>
                            {item.name.slice(0, 1)}
                          </Text>
                        )}
                      </Box>
                      <Box style={{ flex: 1, gap: spacing['8'] }}>
                        <Box style={{ gap: spacing['8'] }}>
                          <Text variant='title' weight='700'>
                            {item.name}
                          </Text>
                          <Text
                            variant='caption'
                            tone='muted'
                            style={{ textTransform: 'uppercase', letterSpacing: 1.4 }}
                          >
                            {item.role}
                          </Text>
                        </Box>
                        <Text variant='bodySm' tone='default'>
                          {item.quote}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing['8'] }}>
                {ratingDots.map((item, index) => (
                  <Box
                    key={item.id}
                    style={{
                      width: index === 0 ? spacing['16'] : spacing['8'],
                      height: spacing['8'],
                      borderRadius: radius.full,
                      backgroundColor: index === 0 ? colors.textPrimary : colors.stroke,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {ugcStrip.length > 0 ? (
            <Box
              style={{
                position: 'relative',
                borderWidth: borderWidth.thin,
                borderColor: colors.border,
                overflow: 'hidden',
                borderRadius: radius.lg,
              }}
            >
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {ugcStrip.slice(0, ugcColumns).map((item) => (
                  <Box
                    key={item.id}
                    style={{
                      width: `${100 / ugcColumns}%`,
                      height: isDesktop ? 112 : 88,
                      overflow: 'hidden',
                      backgroundColor: colors.surfaceMuted,
                    }}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      resizeMode='cover'
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                ))}
              </Box>
              <Box
                pointerEvents='box-none'
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SurfaceButton label='Instagram' onPress={() => onNavigate?.('/account')} tone='light' />
              </Box>
            </Box>
          ) : null}
        </Box>
      </HomeContainer>
      </Box>
  )

  if (Platform.OS === 'web') {
    return homeContent
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      onScroll={handleNativeScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ width: '100%' }}
    >
      {homeContent}
    </ScrollView>
  )
}
