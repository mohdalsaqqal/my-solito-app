"use client"

import React from 'react'
import { Image, Platform, type TextStyle } from 'react-native'
import {
  borderWidth,
  componentTokens,
  fontFamilies,
  fontWeights,
  layout,
  letterSpacing,
  motionDuration,
  radius,
  spacing,
  typography,
  boxShadowStrings,
} from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { useBreakpoint, useThemeColors } from '../../responsive'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PromoDealBannerItem = {
  id: string
  /** Brand name shown in top-right, e.g. "CALLA MAKEUP" */
  brandName: string
  /** Big discount label, e.g. "DEALS UP TO" */
  preLabel?: string
  /** Prominent percentage, e.g. "60%" */
  discountLabel: string
  /** Background color — use brand-appropriate palette token or hex from CMS */
  backgroundColor?: string
  /** Optional image/logo on the right side */
  imageUrl?: string
  /** Navigation href */
  href?: string
}

type PromoDealBannerRowProps = {
  title?: string
  items: PromoDealBannerItem[]
  onNavigate?: (href: string) => void
}

// ─── Palette fallbacks (NiceOne-style) ───────────────────────────────────────

function getPromoBgPalette(c: ReturnType<typeof useThemeColors>) {
  return [
    c.roseBlush,
    c.coralSubtle,
    c.amberSubtle,
    c.backgroundSecondary,
  ]
}

// ─── Single banner ────────────────────────────────────────────────────────────

function PromoDealBanner({
  item,
  isDesktop,
  onNavigate,
}: {
  item: PromoDealBannerItem
  isDesktop: boolean
  onNavigate?: (href: string) => void
}) {
  const c = useThemeColors()
  const promoBgPalette = getPromoBgPalette(c)
  const bg = item.backgroundColor ?? promoBgPalette[0]!
  const bannerHeight = isDesktop ? 120 : 100

  return (
    <ReusableButton
      accessibilityRole='button'
      accessibilityLabel={`${item.brandName} — ${item.discountLabel}`}
      onPress={item.href ? () => onNavigate?.(item.href!) : undefined}
      variant='ghost'
      style={({ hovered, focused }) => {
        const active = hovered || focused
        return {
          flex: 1,
          minWidth: isDesktop ? 320 : '100%',
          transform: [{ translateY: active ? -1 : 0 }],
          transitionProperty: 'transform,box-shadow',
          transitionDuration: `${motionDuration.interactive}ms`,
          ...(Platform.OS === 'web' && active
            ? { boxShadow: boxShadowStrings.md }
            : {}),
        } as any
      }}
    >
      {() => (
        <Box
          style={{
            height: bannerHeight,
            borderRadius: radius.sm,
            backgroundColor: bg,
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden',
            borderWidth: borderWidth.thin,
            borderColor: c.stroke,
          }}
        >
          {/* Left: text content */}
          <Box
            style={{
              flex: 1,
              paddingStart: spacing.space5,
              paddingVertical: spacing.space4,
              gap: spacing.space1,
              justifyContent: 'center',
            }}
          >
            {item.preLabel ? (
              <Text
                style={{
                  fontSize: typography.caption,
                  fontWeight: fontWeights.semibold,
                  color: c.textSecondary,
                  letterSpacing: letterSpacing.caps,
                  textTransform: 'uppercase',
                }}
                numberOfLines={1}
              >
                {item.preLabel}
              </Text>
            ) : null}
            <Text
              style={{
                fontSize: isDesktop ? 28 : 22,
                fontWeight: fontWeights.black,
                color: c.textPrimary,
                letterSpacing: -0.5,
                lineHeight: isDesktop ? 32 : 26,
              }}
              numberOfLines={1}
            >
              {item.discountLabel}
            </Text>
          </Box>

          {/* Right: brand name + optional image */}
          <Box
            style={{
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingEnd: spacing.space4,
              gap: spacing.space2,
              minWidth: isDesktop ? 140 : 110,
            }}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                alt={item.brandName}
                resizeMode='contain'
                style={{
                  width: isDesktop ? 96 : 80,
                  height: isDesktop ? 64 : 56,
                }}
              />
            ) : null}
            <Text
              style={{
                fontSize: typography.caption,
                fontWeight: fontWeights.black,
                color: c.textPrimary,
                letterSpacing: letterSpacing.caps,
                textTransform: 'uppercase',
                textAlign: 'end' as TextStyle['textAlign'],
              }}
              numberOfLines={2}
            >
              {item.brandName}
            </Text>
          </Box>
        </Box>
      )}
    </ReusableButton>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const PromoDealBannerRow = React.memo(function PromoDealBannerRow({
  title,
  items,
  onNavigate,
}: PromoDealBannerRowProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const isDesktop = profile.breakpoint === 'desktop'
  const contentPaddingX = isDesktop
    ? componentTokens.storefrontHome.contentPaddingXDesktop
    : componentTokens.storefrontHome.contentPaddingXMobile

  if (!items || items.length === 0) return null

  return (
    <Box
      data-ect-node='PromoDealBannerRow'
      role='region'
      aria-label={title ?? 'Brand deals'}
      style={{
        width: '100%',
        maxWidth: layout.containerMaxWidth,
        alignSelf: 'center',
        paddingHorizontal: contentPaddingX,
        gap: spacing.space3,
      }}
    >
      {title ? (
        <Text
          variant='h2'
          weight='700'
          {...(Platform.OS === 'web' ? { accessibilityRole: 'heading' as any, 'aria-level': 2 } : {})}
          style={{ fontFamily: fontFamilies.serif, letterSpacing: -0.3 }}
        >
          {title}
        </Text>
      ) : null}

      <Box
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          flexWrap: isDesktop ? 'wrap' : undefined,
          gap: spacing.space3,
        }}
      >
        {items.map((item, index) => {
          const promoBgPalette = getPromoBgPalette(c)
          // Assign palette color by index when no backgroundColor provided
          const itemWithBg: PromoDealBannerItem = item.backgroundColor
            ? item
            : { ...item, backgroundColor: promoBgPalette[index % promoBgPalette.length] }
          return (
            <Box
              key={item.id}
              style={{ flex: isDesktop ? 1 : undefined, minWidth: isDesktop ? 280 : undefined }}
            >
              <PromoDealBanner
                item={itemWithBg}
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
