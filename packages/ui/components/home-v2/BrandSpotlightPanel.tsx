import React from 'react'
import { Image, Platform } from 'react-native'
import {
  borderWidth,
  colors,
  componentTokens,
  fontFamilies,
  layout,
  motionDuration,
  radius,
  spacing,
} from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Icon } from '../Icon'
import { HomeBrandItem } from '../home/types'
import { Button as ReusableButton } from '../../reusables/button'
import { useBreakpoint, useThemeColors } from '../../responsive'

// ─── Types ────────────────────────────────────────────────────────────────────

type BrandSpotlightPanelProps = {
  /** Image to show in the left panel (typically first promo/hero image) */
  showcaseImageUrl?: string
  /** Feature copy for the left panel */
  featureTitle?: string
  featureSubtitle?: string
  featureCtaLabel?: string
  featureHref?: string
  /** Brands to show in the right brand hall grid */
  brands: HomeBrandItem[]
  isDesktop?: boolean
  onNavigate?: (href: string) => void
}

// ─── Surface CTA button ───────────────────────────────────────────────────────

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
    <ReusableButton
      onPress={onPress}
      variant='ghost'
      size='default'
      style={({ hovered, focused }) => {
        const active = hovered || focused
        return {
          minHeight: sharedCtaTokens.minHeight,
          borderRadius: tone === 'light' ? sharedCtaTokens.secondaryRadius : sharedCtaTokens.primaryRadius,
          borderWidth: borderWidth.none,
          borderColor: tone === 'light'
            ? sharedCtaTokens.secondaryBorderColor
            : active ? sharedCtaTokens.primaryBackgroundHover : sharedCtaTokens.primaryBackground,
          backgroundColor: tone === 'light'
            ? active ? sharedCtaTokens.secondaryBackgroundHover : sharedCtaTokens.secondaryBackground
            : active ? sharedCtaTokens.primaryBackgroundHover : sharedCtaTokens.primaryBackground,
          paddingHorizontal: sharedCtaTokens.paddingX,
          paddingVertical: sharedCtaTokens.paddingY,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: sharedCtaTokens.gap,
          transitionProperty: 'background-color,border-color,transform',
          transitionDuration: `${motionDuration.microInteraction}ms`,
          transform: [{ translateY: active ? -1 : 0 }],
        }
      }}
    >
      <Text
        variant='caption'
        weight='700'
        tone={tone === 'light' ? 'default' : 'inverse'}
        style={{
          color: tone === 'light' ? sharedCtaTokens.secondaryTextColor : sharedCtaTokens.primaryTextColor,
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
        color={tone === 'light' ? sharedCtaTokens.secondaryTextColor : sharedCtaTokens.primaryTextColor}
      />
    </ReusableButton>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

const BRAND_SPOTLIGHT_TRENDING_HEADING_STYLE = {} as const

export const BrandSpotlightPanel = React.memo(function BrandSpotlightPanel({
  showcaseImageUrl,
  featureTitle,
  featureSubtitle,
  featureCtaLabel = 'Shop now',
  featureHref,
  brands,
  isDesktop: isDesktopProp,
  onNavigate,
}: BrandSpotlightPanelProps) {
  const c = useThemeColors()
  const profile = useBreakpoint()
  const layoutTokens = componentTokens.storefrontHome.layout
  const isDesktop = isDesktopProp ?? profile.breakpoint === 'desktop'
  const minHeight = isDesktop ? 452 : 320
  const brandHallColumns = isDesktop ? 4 : 2
  const contentPaddingX = isDesktop
    ? componentTokens.storefrontHome.contentPaddingXDesktop
    : componentTokens.storefrontHome.contentPaddingXMobile

  const showcaseBrands = brands.slice(0, 8)
  const brandCardWidth = isDesktop
    ? `${100 / brandHallColumns}%`
    : `${100 / 2}%`

  if (showcaseBrands.length === 0 && !showcaseImageUrl) return null

  return (
    <Box
      data-ect-node="BrandSpotlightPanel"
      role="region"
      aria-label="Brand spotlight"
      style={{
        width: '100%',
        maxWidth: layout.containerMaxWidth,
        alignSelf: 'center',
        paddingHorizontal: contentPaddingX,
      }}
    >
      <Box
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          gap: layoutTokens.brandSpotlightGap,
        }}
      >
        {/* Left: showcase image panel */}
        <Box
          style={{
            flex: isDesktop ? 1 : undefined,
            minHeight,
            borderRadius: radius.lg,
            overflow: 'hidden',
            borderWidth: borderWidth.thin,
            borderColor: c.border,
          }}
        >
          {showcaseImageUrl ? (
              <Image
                source={{ uri: showcaseImageUrl }}
                alt={featureTitle || 'Brand spotlight'}
                resizeMode='cover'
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
          ) : (
            <Box style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: c.backgroundSecondary }} />
          )}
          <Box
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
              variant='h2'
              weight='700'
              tone='inverse'
              style={{ fontFamily: fontFamilies.serif, letterSpacing: -1.6, maxWidth: '85%' }}
            >
              {featureTitle ?? `${showcaseBrands[0]?.name ?? 'Our Brands'} beauty spotlight`}
            </Text>
            {featureSubtitle ? (
              <Text variant='bodySm' tone='inverse' style={{ opacity: 0.86, maxWidth: '80%' }}>
                {featureSubtitle}
              </Text>
            ) : (
              <Text variant='bodySm' tone='inverse' style={{ opacity: 0.86, maxWidth: '80%' }}>
                A department-store style feature on trusted formulas, barrier care, and daily beauty essentials.
              </Text>
            )}
            <SurfaceButton
              label={featureCtaLabel}
              onPress={featureHref ? () => onNavigate?.(featureHref) : undefined}
              tone='light'
            />
          </Box>
        </Box>

        {/* Right: brand hall grid */}
        {showcaseBrands.length > 0 && (
          <Box
            style={{
              flex: isDesktop ? 1.6 : undefined,
              minHeight,
              gap: layoutTokens.sectionGap,
              borderWidth: borderWidth.thin,
              borderColor: c.border,
              borderRadius: radius.lg,
              backgroundColor: c.surface,
              padding: isDesktop ? spacing['32'] : spacing['24'],
            }}
          >
            <Text
              variant='h2'
              weight='700'
              {...(Platform.OS === 'web' ? { accessibilityRole: 'heading' as any, 'aria-level': 2 } : {})}
              style={[BRAND_SPOTLIGHT_TRENDING_HEADING_STYLE, { color: c.textPrimary, fontFamily: fontFamilies.serif, letterSpacing: -0.3 }]}
            >
              Trending Brands
            </Text>
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['16'] }}>
              {showcaseBrands.slice(0, brandHallColumns * 2).map((brand) => (
                <ReusableButton
                  key={brand.id}
                  accessibilityRole='button'
                  accessibilityLabel={brand.name}
                  onPress={() => brand.href && onNavigate?.(brand.href)}
                  variant='ghost'
                >
                  {({ hovered, focused }) => {
                    const active = hovered || focused
                    return (
                      <Box
                        style={{
                          width: brandCardWidth as any,
                          minHeight: spacing['128'],
                          borderRadius: radius.md,
                          borderWidth: borderWidth.thin,
                          borderColor: active ? c.brandPrimary : c.border,
                          backgroundColor: active ? c.brandPrimarySubtle : c.surface,
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing['10'],
                          paddingHorizontal: spacing['20'],
                          paddingVertical: spacing['20'],
                          transform: [{ translateY: active ? -2 : 0 }],
                          transitionProperty: 'transform,background-color',
                          transitionDuration: `${motionDuration.microInteraction}ms`,
                          ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as any) : null),
                        }}
                      >
                        {brand.logoUrl ? (
                        <Image
                          source={{ uri: brand.logoUrl }}
                          alt={brand.name}
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
                </ReusableButton>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
})
