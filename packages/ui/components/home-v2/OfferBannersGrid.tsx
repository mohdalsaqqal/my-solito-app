import React, { useMemo } from 'react'
import { Image, Platform } from 'react-native'
import {
  borderWidth,
  boxShadowStrings,
  breakpoints,
  componentTokens,
  fontFamilies,
  layout,
  motionDuration,
  radius,
  scrim,
  spacing,
} from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Icon } from '../Icon'
import { Button as ReusableButton } from '../../reusables/button'
import { useBreakpoint, useThemeColors } from '../../responsive'

// ─── Types ────────────────────────────────────────────────────────────────────

export type OfferBannerBlock = {
  title?: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
}

type OfferBannersGridProps = {
  title?: string
  actionLabel?: string
  blocks: OfferBannerBlock[]
  onNavigate?: (href: string) => void
  onPressAction?: () => void
  isDesktop?: boolean
}

// ─── Single banner card ───────────────────────────────────────────────────────

function OfferBannerCard({
  block,
  isDesktop,
  onNavigate,
}: {
  block: OfferBannerBlock
  isDesktop: boolean
  onNavigate?: (href: string) => void
}) {
  const c = useThemeColors()
  const offerTokens = componentTokens.storefrontHome.offers
  const sharedCtaTokens = componentTokens.storefrontHome.cta
  const cardTokens = componentTokens.card
  const isWeb = Platform.OS === 'web'

  const cardMinHeight = isDesktop ? offerTokens.cardMinHeightDesktop : offerTokens.cardMinHeightMobile
  const cardPadding = isDesktop ? offerTokens.cardPaddingDesktop : offerTokens.cardPaddingMobile
  const cardPaddingBottom = isDesktop ? offerTokens.cardPaddingBottomDesktop : offerTokens.cardPaddingBottomMobile
  const titleFontSize = isDesktop ? offerTokens.titleFontSizeDesktop : offerTokens.titleFontSizeMobile
  const titleLineHeight = isDesktop ? offerTokens.titleLineHeightDesktop : offerTokens.titleLineHeightMobile

  const imageDrivenBorderColor = useMemo(
    () => (block.imageUrl ? c.stroke : c.border),
    [block.imageUrl, c.border, c.stroke],
  )

  return (
    <ReusableButton
      accessibilityRole='button'
      accessibilityLabel={block.title ?? block.ctaLabel ?? 'Offer banner'}
      onPress={block.href ? () => onNavigate?.(block.href!) : undefined}
      variant='ghost'
    >
      {({ hovered, focused }) => {
        const active = hovered || focused
        return (
          <Box
            style={{
              width: '100%',
              height: cardMinHeight,
              borderRadius: radius.md,
              overflow: 'hidden',
              borderWidth: borderWidth.thin,
              borderColor: imageDrivenBorderColor,
              transform: [{ translateY: active ? -3 : 0 }],
              transitionProperty: 'transform,box-shadow,border-color',
              transitionDuration: `${motionDuration.hoverScale}ms`,
              ...(isWeb ? ({ boxShadow: active ? boxShadowStrings.md : 'none' } as any) : null),
            }}
          >
            {/* Background image */}
            {block.imageUrl ? (
              <Image
                source={{ uri: block.imageUrl }}
                alt={block.title || ''}
                resizeMode='cover'
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            ) : (
              <Box style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: c.backgroundSecondary }} />
            )}

            {/* Gradient overlay — single layer */}
            <Box
              style={{
                position: 'absolute', width: '100%', height: '100%',
                backgroundImage: offerTokens.imageOverlayGradient,
              } as any}
            />

            {/* Content */}
            <Box
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                paddingTop: cardPadding,
                paddingStart: cardPadding,
                paddingEnd: cardPadding,
                paddingBottom: isDesktop ? 20 : cardPaddingBottom,
                gap: offerTokens.contentGap,
              }}
            >
              <Box style={{ maxWidth: offerTokens.copyMaxWidth, gap: spacing.space2 }}>
                {block.title ? (
                  <Text
                    variant='h2'
                    weight='700'
                    numberOfLines={1}
                    style={{
                      color: c.white,
                      fontSize: isDesktop ? 20 : offerTokens.titleFontSizeMobile,
                      fontWeight: '600',
                      lineHeight: isDesktop ? 24 : titleLineHeight,
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
                      color: c.white,
                      opacity: offerTokens.subtitleOpacity,
                      fontSize: offerTokens.subtitleFontSize,
                      lineHeight: offerTokens.subtitleLineHeight,
                    }}
                  >
                    {block.subtitle}
                  </Text>
                ) : null}
              </Box>

              {block.ctaLabel ? (
                <Box
                  style={{
                    alignSelf: 'flex-start',
                    minHeight: sharedCtaTokens.minHeight,
                    borderRadius: sharedCtaTokens.secondaryRadius,
                    backgroundColor: active ? sharedCtaTokens.secondaryBackgroundHover : sharedCtaTokens.secondaryBackground,
                    paddingHorizontal: sharedCtaTokens.paddingX,
                    paddingVertical: sharedCtaTokens.paddingY,
                    borderWidth: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: sharedCtaTokens.gap,
                    transitionProperty: 'background-color,transform',
                    transitionDuration: `${motionDuration.interactive}ms`,
                    transform: [{ translateY: active ? -1 : 0 }],
                  }}
                >
                  <Text
                    variant='caption'
                    weight='700'
                    style={{
                      color: sharedCtaTokens.secondaryTextColor,
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
                    color={sharedCtaTokens.secondaryTextColor}
                  />
                </Box>
              ) : null}
            </Box>
          </Box>
        )
      }}
    </ReusableButton>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

const OFFER_BANNERS_HEADING_STYLE = {} as const

function SectionHeader({
  title,
  actionLabel,
  onPressAction,
}: {
  title: string
  actionLabel?: string
  onPressAction?: () => void
}) {
  const c = useThemeColors()
  return (
    <Box
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: spacing['40'],
        gap: spacing.space3,
      }}
    >
      <Text variant='h2' weight='700' style={[OFFER_BANNERS_HEADING_STYLE, { color: 'hsl(0 0% 15%)', fontFamily: fontFamilies.heading, letterSpacing: 0 }]}>
        {title}
      </Text>
      {actionLabel ? (
        <ReusableButton onPress={onPressAction} variant='ghost' size='default' accessibilityRole='button' accessibilityLabel={actionLabel}>
          <Text
            variant='caption'
            weight='400'
            style={[
              { color: c.inkDeep },
            ]}
            numberOfLines={1}
          >
            {actionLabel}
          </Text>
        </ReusableButton>
      ) : null}
    </Box>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const OfferBannersGrid = React.memo(function OfferBannersGrid({
  title = 'Today\'s Deals',
  actionLabel = 'Shop deals',
  blocks,
  onNavigate,
  onPressAction,
  isDesktop: isDesktopProp,
}: OfferBannersGridProps) {
  const profile = useBreakpoint()
  const offersTokens = componentTokens.storefrontHome.offers
  const isDesktop = isDesktopProp ?? profile.breakpoint === 'desktop'
  const contentPaddingX = isDesktop
    ? componentTokens.storefrontHome.contentPaddingXDesktop
    : componentTokens.storefrontHome.contentPaddingXMobile

  const visibleBlocks = blocks.filter((b) => b.imageUrl).slice(0, 4)

  if (visibleBlocks.length === 0) return null

  const columns = isDesktop ? 2 : 1

  return (
    <Box
      data-ect-node="OfferBannersGrid"
      role="region"
      aria-label={title}
      style={{
        width: '100%',
        maxWidth: layout.containerMaxWidth,
        alignSelf: 'center',
        paddingHorizontal: contentPaddingX,
        gap: offersTokens.sectionGap,
      }}
    >
      <SectionHeader
        title={title}
        actionLabel={actionLabel}
        onPressAction={onPressAction}
      />
      <Box
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          gap: offersTokens.rowGap,
        }}
      >
        {visibleBlocks.map((block, index) => {
          const key = block.href ?? `offer-${index}`
          return (
            <Box key={key} style={{ width: isDesktop ? '48.5%' : '100%' }}>
              <OfferBannerCard
                block={block}
                isDesktop={isDesktop}
                onNavigate={onNavigate}
              />
            </Box>
          )
        })}
      </Box>
    </Box>
  )
})
