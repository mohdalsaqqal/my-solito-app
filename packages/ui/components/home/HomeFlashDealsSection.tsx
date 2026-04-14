import React from 'react'
import { Platform, ScrollView } from 'react-native'
import {
  colors,
  fontFamilies,
  letterSpacing,
  radius,
  spacing,
  typography,
} from '@real/tokens'
import { Box, Text } from '../../primitives'
import { CountdownTimer } from '../home-v2/CountdownTimer'
import { ProductCard } from '../ProductCard'
import { ProductCardModel } from '../ProductCard.types'
import { useThemeColors } from '../../responsive'

type HomeFlashDealsSectionProps = {
  offerText?: string
  preLabel?: string
  endsAtIso?: string
  products: ProductCardModel[]
  onPressProduct?: (item: ProductCardModel) => void
  loading?: boolean
}

export function HomeFlashDealsSection({
  offerText,
  preLabel,
  endsAtIso,
  products,
  onPressProduct,
  loading = false,
}: HomeFlashDealsSectionProps) {
  const c = useThemeColors()
  const cardWidth = spacing['48'] * 3.5 // ~168px for denser display
  const cardGap = spacing.space3

  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: colors.roseDark,
          paddingHorizontal: spacing.pageX,
          paddingVertical: spacing.space6,
          gap: spacing.space6,
        }}
      >
        <Box style={{ alignItems: 'center', gap: spacing.space2 }}>
          {preLabel ? (
            <Text
              style={{
                fontSize: typography.subheadline,
                fontWeight: 500,
                color: c.textInverted,
                letterSpacing: letterSpacing.caps,
                textTransform: 'uppercase',
              }}
            >
              {preLabel}
            </Text>
          ) : null}
          {offerText ? (
            <Text
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: c.white,
                fontFamily: fontFamilies.serif,
                lineHeight: 32,
              }}
            >
              {offerText}
            </Text>
          ) : null}
        </Box>
        <ScrollView
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: cardGap }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Box
              key={i}
              style={{
                width: cardWidth,
                height: 280,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceMuted,
              }}
            />
          ))}
        </ScrollView>
      </Box>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <Box
      style={{
        backgroundColor: colors.roseDark,
        paddingHorizontal: spacing.pageX,
        paddingVertical: spacing.space6,
        gap: spacing.space6,
      }}
    >
      {/* Header row */}
      <Box
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.space4,
        }}
      >
        <Box style={{ gap: spacing.space1 }}>
          {preLabel ? (
            <Text
              style={{
                fontSize: typography.subheadline,
                fontWeight: 500,
                color: c.textInverted,
                letterSpacing: letterSpacing.caps,
                textTransform: 'uppercase',
                opacity: 0.85,
              }}
            >
              {preLabel}
            </Text>
          ) : null}
          {offerText ? (
            <Text
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: c.white,
                fontFamily: fontFamilies.serif,
                lineHeight: 32,
                letterSpacing: -0.3,
              }}
            >
              {offerText}
            </Text>
          ) : null}
        </Box>
        {endsAtIso ? (
          <CountdownTimer targetIso={endsAtIso} loading={false} />
        ) : null}
      </Box>

      {/* Product rail */}
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: cardGap }}
      >
        {products.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            variant='compact'
            width={cardWidth}
            onPress={() => onPressProduct?.(item)}
          />
        ))}
      </ScrollView>
    </Box>
  )
}
