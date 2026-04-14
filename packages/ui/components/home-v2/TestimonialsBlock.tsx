import React from 'react'
import { Image, Platform } from 'react-native'
import {
  borderWidth,
  componentTokens,
  layout,
  radius,
  shadows,
  spacing,
} from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Icon } from '../Icon'
import { HomeUgcItem } from '../home/types'
import { buildTestimonials } from './figmaHomeData'
import { Button as ReusableButton } from '../../reusables/button'
import { useThemeColors } from '../../responsive'

// ─── Types ────────────────────────────────────────────────────────────────────

type TestimonialsBlockProps = {
  ugcItems: HomeUgcItem[]
  isDesktop?: boolean
  onNavigate?: (href: string) => void
}

// ─── Surface CTA button ───────────────────────────────────────────────────────

function SurfaceButton({
  label,
  onPress,
}: {
  label: string
  onPress?: () => void
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
          borderRadius: sharedCtaTokens.secondaryRadius,
          borderWidth: borderWidth.none,
          borderColor: sharedCtaTokens.secondaryBorderColor,
          backgroundColor: active ? sharedCtaTokens.secondaryBackgroundHover : sharedCtaTokens.secondaryBackground,
          paddingHorizontal: sharedCtaTokens.paddingX,
          paddingVertical: sharedCtaTokens.paddingY,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: sharedCtaTokens.gap,
        }
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
        {label}
      </Text>
      <Icon name='trendArrow' size={sharedCtaTokens.iconSize} color={sharedCtaTokens.secondaryTextColor} />
    </ReusableButton>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const TestimonialsBlock = React.memo(function TestimonialsBlock({
  ugcItems,
  isDesktop = false,
  onNavigate,
}: TestimonialsBlockProps) {
  const c = useThemeColors()
  const layoutTokens = componentTokens.storefrontHome.layout
  const contentPaddingX = isDesktop
    ? componentTokens.storefrontHome.contentPaddingXDesktop
    : componentTokens.storefrontHome.contentPaddingXMobile

  const testimonials = buildTestimonials(ugcItems)
  const ugcColumns = isDesktop ? 8 : 4
  const ugcStrip = ugcItems.slice(0, ugcColumns)

  // Show dots for testimonials carousel indicator
  const dotItems = testimonials.length > 0
    ? testimonials
    : [{ id: 'fallback-1', name: '', role: '', quote: '' }]

  const testimonialsHeadingStyle = {
    color: c.textPrimary,
  } as const

  return (
    <Box
      data-ect-node="TestimonialsBlock"
      role="region"
      aria-label="Customer testimonials"
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
          flexDirection: isDesktop ? 'row' : 'column',
          gap: layoutTokens.sectionGap,
        }}
      >
        {/* Left: rating summary */}
        <Box style={{ width: isDesktop ? 300 : undefined, gap: layoutTokens.sectionGap }}>
          <Text variant='h2' weight='700' style={testimonialsHeadingStyle}>
            See What Shoppers Say
          </Text>
          <Box style={{ gap: spacing.space2 }}>
            <Text variant='bodySm' tone='default'>★★★★★</Text>
            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.space2 }}>
              <Text variant='title' weight='700'>4.9</Text>
              <Text variant='bodySm' tone='muted'>(1200+ Reviews)</Text>
            </Box>
          </Box>
        </Box>

        {/* Right: testimonial cards + dots */}
          <Box style={{ flex: 1, gap: spacing.space5 }}>
          <Box
            style={{
              position: 'relative',
              flexDirection: isDesktop ? 'row' : 'column',
              gap: spacing.space4,
            }}
          >
            {testimonials.map((item, index) => (
              <Box
                key={item.id}
                style={{
                  flex: index === 0 && isDesktop ? 1.3 : 1,
                  borderRadius: radius.lg,
                  borderWidth: borderWidth.thin,
                  borderColor: c.border,
                  backgroundColor: c.surface,
                  padding: spacing.space6,
                  gap: spacing.space4,
                  ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as any) : shadows.none),
                }}
              >
                <Box style={{ flexDirection: 'row', gap: spacing.space4, alignItems: 'flex-start' }}>
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: radius.full,
                      overflow: 'hidden',
                      backgroundColor: c.surfaceMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                  alt={item.name}
                        resizeMode='cover'
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Text variant='subtitle' weight='700'>
                        {item.name.slice(0, 1)}
                      </Text>
                    )}
                  </Box>
                  <Box style={{ flex: 1, gap: spacing.space2 }}>
                    <Box style={{ gap: spacing.space2 }}>
                      <Text variant='title' weight='700'>{item.name}</Text>
                      <Text
                        variant='caption'
                        tone='muted'
                        style={{ textTransform: 'uppercase', letterSpacing: 1.4 }}
                      >
                        {item.role}
                      </Text>
                    </Box>
                    <Text variant='bodySm' tone='default'>{item.quote}</Text>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Dot indicators */}
          <Box style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.space2 }}>
            {dotItems.map((item, index) => (
              <Box
                key={item.id}
                style={{
                  width: index === 0 ? spacing['16'] : spacing['8'],
                  height: spacing['8'],
                  borderRadius: radius.full,
                  backgroundColor: index === 0 ? c.textPrimary : c.stroke,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* UGC image strip */}
      {ugcStrip.length > 0 && (
        <Box
          style={{
            position: 'relative',
            borderWidth: borderWidth.thin,
            borderColor: c.border,
            overflow: 'hidden',
            borderRadius: radius.lg,
          }}
        >
          <Box style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {ugcStrip.map((item) => (
              <Box
                key={item.id}
                style={{
                  width: `${100 / ugcColumns}%`,
                  height: isDesktop ? 112 : 88,
                  overflow: 'hidden',
                  backgroundColor: c.surfaceMuted,
                }}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  alt={item.caption || 'User generated content'}
                  resizeMode='cover'
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            ))}
          </Box>
          <Box
            style={{
              position: 'absolute',
              pointerEvents: 'box-none',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SurfaceButton
              label='Instagram'
              onPress={() => onNavigate?.('/account')}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
})
