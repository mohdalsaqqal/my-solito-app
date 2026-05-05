"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, Platform, ScrollView } from 'react-native'
import {
  borderWidth,
  colors,
  componentTokens,
  fontFamilies,
  layout,
  motionDuration,
  radius,
  scrim,
  spacing,
} from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Icon, IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { Button as ReusableButton } from '../../reusables/button'
import { useRailAutoplay } from '../useRailAutoplay'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import { useBreakpoint, useThemeColors } from '../../responsive'
import { HomeHeroItem } from '../home/types'
import { buildEditorialHeroTiles, EditorialHeroTile, type PromoBlock } from './figmaHomeData'
import { useRovingTabIndex } from '../../hooks/useRovingTabIndex'

type HeroTileRailProps = {
  heroItems: HomeHeroItem[]
  promoBlocks?: PromoBlock[]
  autoplay?: boolean
  autoplayMs?: number
  onNavigate?: (href: string) => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

type HeroToneTheme = {
  panelBackground: string
  panelBorder: string
  eyebrowText: string
  titleText: string
  subtitleText: string
}

const HERO_TONE_STYLES: Record<EditorialHeroTile['tone'], HeroToneTheme> = {
  flash: {
    panelBackground: colors.inkBlack,
    panelBorder: colors.inkDeep,
    eyebrowText: colors.textInverted,
    titleText: colors.textInverted,
    subtitleText: colors.textInverted,
  },
  editorial: {
    panelBackground: colors.inkBlack,
    panelBorder: colors.inkDeep,
    eyebrowText: colors.textInverted,
    titleText: colors.textInverted,
    subtitleText: colors.textInverted,
  },
  new: {
    panelBackground: colors.inkBlack,
    panelBorder: colors.inkDeep,
    eyebrowText: colors.textInverted,
    titleText: colors.textInverted,
    subtitleText: colors.textInverted,
  },
  luxury: {
    panelBackground: colors.inkBlack,
    panelBorder: colors.inkDeep,
    eyebrowText: colors.textInverted,
    titleText: colors.textInverted,
    subtitleText: colors.textInverted,
  },
  member: {
    panelBackground: colors.inkBlack,
    panelBorder: colors.inkDeep,
    eyebrowText: colors.textInverted,
    titleText: colors.textInverted,
    subtitleText: colors.textInverted,
  },
}

function heroBadgeIconName(tone: EditorialHeroTile['tone']): IconName {
  if (tone === 'flash') return 'deals'
  if (tone === 'editorial') return 'product'
  if (tone === 'new') return 'gift'
  if (tone === 'luxury') return 'star'
  return 'secure'
}

// ─── Scroll helpers ───────────────────────────────────────────────────────────

function scrollRailBy(
  railRef: React.MutableRefObject<ScrollView | null>,
  offsetRef: React.MutableRefObject<number>,
  viewportRef: React.MutableRefObject<number>,
  contentRef: React.MutableRefObject<number>,
  distance: number,
  direction: 'prev' | 'next',
) {
  const current = offsetRef.current
  const maxOffset = Math.max(0, contentRef.current - viewportRef.current)
  const target = direction === 'prev'
    ? Math.max(0, current - distance)
    : Math.min(maxOffset, current + distance)
  railRef.current?.scrollTo({ x: target, animated: true })
  offsetRef.current = target
}

// ─── Sub-components ────────────────────────────────────────────────────────────

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
  // Center on edge: half of IconButton lg size (44/2 = 22)
  const navButtonHalfSize = 22
  return (
    <Box
      style={{
        position: 'absolute',
        top,
        transform: [{ translateY: -navButtonHalfSize }],
        [direction === 'prev' ? 'start' : 'end']: edge,
      } as any}
    >
      <IconButton
        icon={direction === 'prev' ? 'caretLeft' : 'caretRight'}
        label={direction === 'prev' ? 'Previous' : 'Next'}
        tone='soft'
        size='lg'
        onPress={onPress}
      />
    </Box>
  )
}

const HeroTileCard = React.memo(function HeroTileCard({
  item,
  width,
  height,
  onNavigate,
  isLead = false,
}: {
  item: EditorialHeroTile
  width: number
  height: number
  onNavigate?: (href: string) => void
  isLead?: boolean
}) {
  const c = useThemeColors()
  const theme = HERO_TONE_STYLES[item.tone]
  const heroTokens = componentTokens.storefrontHome.hero
  const sharedCtaTokens = componentTokens.storefrontHome.cta
  const imageHeight = Math.round(height * heroTokens.imageAreaRatio)
  const panelHeight = Math.max(0, height - imageHeight)
  const compactPanel = panelHeight <= heroTokens.compactTriggerHeight
  const titleSize = useMemo(
    () => compactPanel ? heroTokens.compactTitleSize : isLead ? heroTokens.titleSize + 4 : heroTokens.titleSize,
    [compactPanel, isLead, heroTokens.compactTitleSize, heroTokens.titleSize],
  )
  const titleLineHeight = useMemo(
    () => compactPanel
      ? heroTokens.compactTitleLineHeight
      : isLead
        ? heroTokens.titleLineHeight + 4
        : heroTokens.titleLineHeight,
    [compactPanel, isLead, heroTokens.compactTitleLineHeight, heroTokens.titleLineHeight],
  )
  const titleMinHeight = useMemo(
    () => compactPanel
      ? heroTokens.compactTitleMinHeight
      : isLead
        ? heroTokens.titleMinHeight + 6
        : heroTokens.titleMinHeight,
    [compactPanel, isLead, heroTokens.compactTitleMinHeight, heroTokens.titleMinHeight],
  )
  const mediaOverlayGradient = scrim.heroMedia
  const hasImage = !!item.imageUrl

  return (
    <ReusableButton
      accessibilityRole='button'
      accessibilityLabel={item.title}
      onPress={item.href ? () => onNavigate?.(item.href!) : undefined}
      variant='ghost'
    >
      {({ hovered, focused }: any) => {
        const active = hovered || focused
        return (
          <Box
            role='group'
            aria-roledescription='slide'
            style={{
              width,
              height,
              overflow: 'hidden',
              backgroundColor: c.surface,
              transform: [{ translateY: active ? -1 : 0 }],
              transitionProperty: 'transform',
              transitionDuration: `${motionDuration.hoverScale}ms`,
            }}
          >
            {/* Image area */}
            <Box style={{ position: 'relative', height: imageHeight, overflow: 'hidden' }}>
              {hasImage ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  alt={item.title}
                  resizeMode='cover'
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: [{ scale: active ? 1.03 : 1 }],
                  }}
                />
              ) : (
                <Box
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: c.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant='caption' tone='muted'>Image unavailable</Text>
                </Box>
              )}
              {hasImage && (
                <Box
                  style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0,
                    height: Math.min(spacing['96'], Math.round(imageHeight * (isLead ? 0.5 : 0.42))),
                    ...(Platform.OS === 'web'
                      ? ({ backgroundImage: scrim.heroMedia } as any)
                      : { backgroundColor: scrim.heroMediaNative }),
                  }}
                />
              )}
              {hasImage && Platform.OS === 'web' && mediaOverlayGradient ? (
                <Box
                  style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                    backgroundImage: mediaOverlayGradient,
                  } as any}
                />
              ) : null}
            </Box>

            {/* Panel area */}
            <Box
              style={{
                height: panelHeight,
                minHeight: panelHeight,
                maxHeight: panelHeight,
                overflow: 'hidden',
                backgroundColor: hasImage ? (item.panelColor ?? c.inkBlack) : c.surface,
                padding: compactPanel ? heroTokens.compactPanelPadding : heroTokens.panelPadding,
                gap: compactPanel ? heroTokens.compactPanelGap : heroTokens.panelGap,
              }}
            >
              {!compactPanel && (
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
                      borderRadius: radius.md,
                      backgroundColor: c.inkMid,
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
                        borderRadius: radius.sm,
                        backgroundColor: c.inkDeep,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        name={heroBadgeIconName(item.tone)}
                        size={heroTokens.badgeIconSize}
                        color={c.brandPrimary}
                        weight='fill'
                      />
                    </Box>
                    <Text
                      variant='overline'
                      weight='700'
                      style={{
                        color: c.textInverted,
                        textTransform: 'uppercase',
                        letterSpacing: heroTokens.badgeTracking,
                      }}
                    >
                      {item.badge}
                    </Text>
                  </Box>
                </Box>
              )}

              <Text
                variant='h1'
                weight='700'
                numberOfLines={compactPanel ? 1 : isLead ? 3 : 2}
                style={{
                  fontFamily: fontFamilies.heading,
                  color: theme.titleText,
                  fontSize: titleSize,
                  lineHeight: titleLineHeight,
                  minHeight: titleMinHeight,
                  letterSpacing: heroTokens.titleTracking,
                }}
              >
                {item.title}
              </Text>

              {item.subtitle ? (
                <Text
                  variant='bodySm'
                  numberOfLines={2}
                  style={{
                    color: theme.subtitleText,
                    opacity: 0.65,
                    fontSize: compactPanel ? heroTokens.compactSubtitleSize : heroTokens.subtitleSize,
                    minHeight: compactPanel ? heroTokens.compactSubtitleMinHeight : heroTokens.subtitleMinHeight,
                    lineHeight: compactPanel ? heroTokens.compactSubtitleLineHeight : heroTokens.subtitleLineHeight,
                  }}
                >
                  {item.subtitle}
                </Text>
              ) : null}

              {item.ctaLabel ? (
                <Box
                  style={{
                    marginTop: 'auto',
                  }}
                >
                  <Box
                    style={{
                      alignSelf: 'flex-start',
                      minHeight: isLead ? sharedCtaTokens.minHeight + spacing['4'] : sharedCtaTokens.minHeight,
                      borderRadius: sharedCtaTokens.primaryRadius,
                      backgroundColor: active ? sharedCtaTokens.primaryBackgroundHover : sharedCtaTokens.primaryBackground,
                      paddingHorizontal: sharedCtaTokens.paddingX,
                      paddingVertical: sharedCtaTokens.paddingY,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: sharedCtaTokens.gap,
                      transitionProperty: 'background-color,transform',
                      transitionDuration: `${motionDuration.microInteraction}ms`,
                      transform: [{ translateY: active ? -1 : 0 }],
                    }}
                  >
                    <Text
                      variant='caption'
                      weight='700'
                      style={{
                        color: sharedCtaTokens.primaryTextColor,
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
                      color={sharedCtaTokens.primaryTextColor}
                    />
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Box>
        )
      }}
    </ReusableButton>
  )
})

// ─── Main export ──────────────────────────────────────────────────────────────

export function HeroTileRail({
  heroItems,
  promoBlocks = [],
  autoplay = true,
  autoplayMs,
  onNavigate,
}: HeroTileRailProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const [isPaused, setIsPaused] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const heroTokens = componentTokens.storefrontHome.hero
  const railRef = useRef<ScrollView | null>(null)
  const offsetRef = useRef(0)
  const viewportRef = useRef(0)
  const contentRef = useRef(0)

  const isDesktop = profile.breakpoint === 'desktop'
  const contentPaddingX = isDesktop
    ? heroTokens.desktopContainerPaddingX
    : heroTokens.mobileContainerPaddingX

  const cardWidth = isDesktop
    ? Math.round(
        (Math.max(280, profile.containerWidth - contentPaddingX * 2) - heroTokens.railGap * (Math.ceil(heroTokens.desktopVisibleCards) - 1)) /
        heroTokens.desktopVisibleCards,
      )
    : Math.max(292, profile.containerWidth - spacing.pageX * 2 - spacing['16'])

  const cardHeight = profile.cardHeight

  const tiles = useMemo(
    () => buildEditorialHeroTiles(heroItems, promoBlocks.slice(0, 3)).slice(0, 4),
    [heroItems, promoBlocks],
  )

  const railDistance = cardWidth + heroTokens.railGap
  const effectiveAutoplay = autoplay && isDesktop && !prefersReducedMotion && !isPaused && !hasUserInteracted
  const effectiveAutoplayMs = Math.max(5600, autoplayMs ?? heroTokens.autoScrollIntervalMs)
  const getRovingProps = useRovingTabIndex({ itemCount: tiles.length, orientation: 'horizontal' })

  useRailAutoplay({
    enabled: effectiveAutoplay,
    autoplayMs: effectiveAutoplayMs,
    railRef,
    offsetRef,
    viewportRef,
    contentRef,
    stepDistance: railDistance,
    itemCount: tiles.length,
  })

  if (tiles.length === 0) return null

  return (
    <Box
      data-ect-node="HeroTileRail"
      role="region"
      aria-label="Featured collections"
      style={{
        backgroundColor: c.inkBlack,
        overflow: 'hidden',
      }}
      onPointerEnter={isDesktop ? () => setIsPaused(true) : undefined}
      onPointerLeave={isDesktop ? () => setIsPaused(false) : undefined}
    >
      <Box
        style={{
          width: '100%',
          paddingHorizontal: contentPaddingX,
        }}
      >
        <Box
          style={{
            position: 'relative',
            paddingBottom: spacing['12'],
          }}
        >
          <ScrollView
            ref={railRef}
            horizontal
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            onLayout={(e) => { viewportRef.current = e.nativeEvent.layout.width }}
            onContentSizeChange={(w) => { contentRef.current = w }}
            onScroll={(e) => { offsetRef.current = e.nativeEvent.contentOffset.x }}
            onScrollBeginDrag={() => {
              setIsPaused(true)
              setHasUserInteracted(true)
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{ gap: heroTokens.railGap }}
            {...(Platform.OS === 'web' ? { role: 'listbox' as any, 'aria-label': 'Featured collections' } : {})}
          >
            {tiles.map((tile, index) => {
              const rovingProps = getRovingProps(index)
              return (
                <Box
                  key={tile.id}
                  {...(Platform.OS === 'web'
                    ? ({ ref: rovingProps.ref, tabIndex: rovingProps.tabIndex, onKeyDown: rovingProps.onKeyDown, role: 'option', 'aria-label': tile.title } as any)
                    : {})}
                >
                  <HeroTileCard
                    item={tile}
                    width={cardWidth}
                    height={cardHeight}
                    onNavigate={onNavigate}
                    isLead={index === 0}
                  />
                </Box>
              )
            })}
          </ScrollView>

          {isDesktop && tiles.length > 3 && (
            <>
              <RailNavButton
                direction='prev'
                top={Math.round(cardHeight / 2)}
                edge={spacing['16']}
                onPress={() => {
                  setHasUserInteracted(true)
                  setIsPaused(true)
                  scrollRailBy(railRef, offsetRef, viewportRef, contentRef, railDistance, 'prev')
                }}
              />
              <RailNavButton
                direction='next'
                top={Math.round(cardHeight / 2)}
                edge={spacing['16']}
                onPress={() => {
                  setHasUserInteracted(true)
                  setIsPaused(true)
                  scrollRailBy(railRef, offsetRef, viewportRef, contentRef, railDistance, 'next')
                }}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}
