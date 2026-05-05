"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { I18nManager, Image, Platform } from 'react-native'
import { borderWidth, componentTokens, motionDuration, radius, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { Button } from '../Button'
import { HomeEditorialHotspotSection } from '../home/types'
import { useBreakpoint, useThemeColors } from '../../responsive'

type EditorialHotspotSectionProps = {
  section: HomeEditorialHotspotSection
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  onAddAllToCart?: (productIds: string[]) => void
  addAllToCartLabel?: string
}

const MONEY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatMoney(value: number, currency = 'USD') {
  if (currency === 'USD') return MONEY_FORMATTER.format(value)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const EditorialHotspotSection = React.memo(function EditorialHotspotSection({
  section,
  onNavigate,
  onSelectProduct,
  onAddToCart,
  onAddAllToCart,
  addAllToCartLabel = 'Add all to cart',
}: EditorialHotspotSectionProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const isRTL = I18nManager.isRTL
  const isSplitLayout = profile.breakpoint === 'tablet' || profile.breakpoint === 'desktop'
  const isDesktop = profile.breakpoint === 'desktop'
  const imagePanelSize = isDesktop
    ? componentTokens.storefrontHome.editorialHotspot.desktopImageSize
    : isSplitLayout
      ? componentTokens.storefrontHome.editorialHotspot.tabletImageSize
      : null
  const initialActiveProductId = section.products[0]?.id ?? null
  const [activeProductId, setActiveProductId] = useState<string | null>(initialActiveProductId)

  useEffect(() => {
    setActiveProductId(section.products[0]?.id ?? null)
  }, [section.products])

  const activeProduct = useMemo(
    () => section.products.find((product) => product.id === activeProductId) ?? section.products[0],
    [activeProductId, section.products],
  )
  const addAllProductIds = useMemo(
    () =>
      section.products
        .filter((product) => (typeof product.stock === 'number' ? product.stock > 0 : true))
        .map((product) => product.id),
    [section.products],
  )

  return (
    <Box
      data-ect-node="EditorialHotspotSection"
      role="region"
      aria-label={section.title || 'Editorial hotspot'}
      style={{
        flexDirection: isSplitLayout ? 'row' : 'column',
        alignItems: isSplitLayout ? 'flex-start' : 'stretch',
        gap: spacing.space4,
        padding: isSplitLayout ? spacing.space5 : spacing.space4,
      }}
    >
      <Box
        style={{
          flex: isSplitLayout ? undefined : 1,
          width: imagePanelSize ?? '100%',
          minWidth: imagePanelSize ?? undefined,
          maxWidth: imagePanelSize ?? undefined,
          minHeight: imagePanelSize ?? componentTokens.storefrontHome.hero.mobileCardHeight + spacing['48'],
          maxHeight: imagePanelSize ?? undefined,
          borderRadius: radius.lg,
          overflow: 'hidden',
          backgroundColor: c.backgroundSecondary,
          position: 'relative',
        }}
      >
        {section.imageUrl ? (
          Platform.OS === 'web' ? (
            <img
              src={section.imageUrl}
              alt={section.title ?? ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <Image source={{ uri: section.imageUrl }} alt={section.title ?? ''} resizeMode='contain' style={{ width: '100%', height: '100%' }} />
          )
        ) : null}
      </Box>

      <Box
        style={{
          flex: isSplitLayout ? 1 : undefined,
          alignSelf: 'stretch',
          gap: spacing.space2,
          justifyContent: 'flex-start',
        }}
      >
        <Box style={{ gap: spacing.space2, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          {section.title ? (
            <Text
              variant='h2'
              weight='700'
              style={{
                color: c.textPrimary,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {section.title}
            </Text>
          ) : null}
          {addAllProductIds.length > 0 && onAddAllToCart ? (
            <Button variant='primaryCommerce' size='sm' shape='pill' onPress={() => onAddAllToCart(addAllProductIds)}>
              {addAllToCartLabel}
            </Button>
          ) : null}
        </Box>

        <Box
          style={{
            gap: spacing.space1,
            padding: spacing.space1,
          }}
        >
          {section.products.map((product) => {
            const active = product.id === activeProduct?.id
            const soldOut = typeof product.stock === 'number' ? product.stock <= 0 : false

            return (
              <Box
                key={product.id}
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: spacing.space1,
                }}
              >
                <ReusableButton
                  accessibilityRole='button'
                  accessibilityLabel={product.displayTitle || product.name}
                  onPress={() => {
                    setActiveProductId(product.id)
                    onSelectProduct?.(product.id)
                    if (product.href) {
                      onNavigate?.(product.href)
                    }
                  }}
                  onPointerEnter={Platform.OS === 'web' ? () => setActiveProductId(product.id) : undefined}
                  variant='ghost'
                  style={({ hovered, focused }: any) => {
                    const interactive = active || hovered || focused
                    return {
                      flex: 1,
                      paddingHorizontal: 0,
                      paddingVertical: 0,
                      alignItems: 'stretch',
                      borderRadius: radius.md,
                      borderWidth: borderWidth.thin,
                      borderColor: interactive ? c.brandPrimary : c.border,
                      backgroundColor: interactive ? c.brandPrimarySubtle : c.surface,
                      transitionProperty: 'border-color,background-color,transform',
                      transitionDuration: `${motionDuration.interactive}ms`,
                      transform: [{ translateY: interactive ? -1 : 0 }],
                    }
                  }}
                >
                  <Box
                    style={{
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      alignItems: 'center',
                      gap: spacing.space1,
                      paddingHorizontal: spacing.space1,
                      paddingVertical: spacing['3'],
                    }}
                  >
                    <Box
                      style={{
                        width: spacing['16'],
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Text
                        variant='caption'
                        weight='700'
                        style={{
                          color: active ? c.brandPrimary : c.textSecondary,
                        }}
                      >
                        {String(section.products.findIndex((item) => item.id === product.id) + 1).padStart(2, '0')}
                      </Text>
                    </Box>
                    <Box
                      style={{
                        width: spacing['32'],
                        height: spacing['32'],
                        borderRadius: radius.sm,
                        overflow: 'hidden',
                        backgroundColor: c.backgroundSecondary,
                        borderWidth: borderWidth.thin,
                        borderColor: c.border,
                        flexShrink: 0,
                      }}
                    >
                      {product.imageUrl ? (
                        <Image
                          source={{ uri: product.imageUrl }}
                          alt={product.displayTitle || product.name}
                          resizeMode='contain'
                          style={{ width: '100%', height: '100%' }}
                          {...(Platform.OS === 'web' ? { loading: 'lazy' } : {})}
                        />
                      ) : null}
                    </Box>

                    <Box style={{ flex: 1, gap: 2, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                      <Text
                        variant='caption'
                        tone='muted'
                        weight='700'
                        numberOfLines={1}
                        style={{
                          textTransform: 'uppercase',
                          letterSpacing: 1.1,
                          textAlign: isRTL ? 'right' : 'left',
                        }}
                      >
                        {product.brand}
                      </Text>
                      <Text
                        variant='caption'
                        weight='600'
                        numberOfLines={isDesktop ? 1 : 2}
                        style={{
                          color: c.textPrimary,
                          textAlign: isRTL ? 'right' : 'left',
                        }}
                      >
                        {product.displayTitle || product.name}
                      </Text>
                      <Box style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.space1, flexWrap: 'nowrap' }}>
                        <Text
                          variant='caption'
                          weight='700'
                          style={{
                            color: c.brandPrimary,
                          }}
                        >
                          {formatMoney(product.price, product.currency)}
                        </Text>
                        {product.compareAtPrice ? (
                          <Text
                            variant='caption'
                            tone='muted'
                            style={{
                              textDecorationLine: 'line-through',
                            }}
                          >
                            {formatMoney(product.compareAtPrice, product.currency)}
                          </Text>
                        ) : null}
                      </Box>
                    </Box>
                  </Box>
                </ReusableButton>

                <ReusableButton
                  accessibilityRole='button'
                  accessibilityLabel={soldOut ? 'Out of stock' : `Add ${product.displayTitle || product.name} to cart`}
                  onPress={() => {
                    if (soldOut) return
                    onAddToCart?.(product.id)
                  }}
                  disabled={soldOut}
                  variant='ghost'
                  style={({ hovered, focused }: any) => {
                    const ctaActive = !soldOut && (hovered || focused)
                    return {
                      minHeight: spacing['20'],
                      minWidth: isDesktop ? spacing['48'] : spacing['40'],
                      borderRadius: radius.sm,
                      borderWidth: borderWidth.thin,
                      borderColor: soldOut ? c.border : ctaActive ? c.inkDeep : c.border,
                      backgroundColor: soldOut
                        ? c.backgroundSecondary
                        : ctaActive
                          ? c.surfaceMuted
                          : c.surface,
                      paddingHorizontal: spacing.space1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  }}
                >
                  <Text
                    variant='caption'
                    weight='600'
                    style={{
                      color: soldOut ? c.textSecondary : c.inkDeep,
                      textAlign: 'center',
                    }}
                  >
                    {soldOut ? 'Out of stock' : 'Add'}
                  </Text>
                </ReusableButton>
              </Box>
            )
          })}
        </Box>

        {section.ctaLabel && section.href ? (
          <ReusableButton
            onPress={() => onNavigate?.(section.href!)}
            variant='ghost'
            style={{ paddingHorizontal: 0, paddingVertical: 0, alignItems: isRTL ? 'flex-end' : 'flex-start' }}
          >
            {({ hovered, focused }: any) => {
              const active = hovered || focused
              return (
                <Text
                  variant='caption'
                  weight='700'
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: 1.4,
                    textDecorationLine: 'underline',
                    color: active ? c.brandPrimaryPressed : c.brandPrimary,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {section.ctaLabel}
                </Text>
              )
            }}
          </ReusableButton>
        ) : null}
      </Box>
    </Box>
  )
})
