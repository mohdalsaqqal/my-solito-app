"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { I18nManager, Platform, Image } from 'react-native'
import {
  buttonTokens,
  borderWidth,
  breakpoints,
  elevation,
  iconButtonTokens,
  motionDuration,
  radius,
  shadows,
  spacing,
} from '@real/tokens'
import { Box, Text } from '../primitives'
import { Button as ReusableButton } from '../reusables/button'
import { Badge } from './Badge'
import { Icon } from './Icon'
import { IconButton } from './IconButton'
import { StarRating } from './StarRating'
import { StockBadge } from './StockBadge'
import { PriceTag } from './PriceTag'
import { Button } from './Button'
import { HomeProductItem } from './home/types'
import { useBreakpoint, useThemeColors } from '../responsive'

type QuickViewModalProps = {
  item: HomeProductItem | null
  open: boolean
  onClose: () => void
  onAddToCart: (item: HomeProductItem, quantity: number) => void
  onSelectProduct: (productId: string) => void
}

export const QuickViewModal = React.memo(function QuickViewModal({
  item,
  open,
  onClose,
  onAddToCart,
  onSelectProduct,
}: QuickViewModalProps) {
  const c = useThemeColors()
  const profile = useBreakpoint()
  const dialogRef = useRef<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [mediaIndex, setMediaIndex] = useState(0)

  const isDesktop = profile.breakpoint === 'desktop'

  const handleAddToCart = async () => {
    if (!item || addingToCart) return
    setAddingToCart(true)
    try {
      await onAddToCart(item, quantity)
      setQuantity(1)
      onClose()
    } finally {
      setAddingToCart(false)
    }
  }

  useEffect(() => {
    if (open) {
      setQuantity(1)
      setAddingToCart(false)
      setMediaIndex(0)
    }
  }, [item?.id, open])

  useEffect(() => {
    if (Platform.OS !== 'web' || !open) {
      return
    }
    const doc = (globalThis as { document?: Document }).document
    if (!doc) {
      return
    }
    const previousActiveElement = doc.activeElement as HTMLElement | null
    const previousOverflow = doc.body.style.overflow
    doc.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    doc.addEventListener('keydown', handleEscape)
    requestAnimationFrame(() => {
      dialogRef.current?.focus?.()
    })

    return () => {
      doc.removeEventListener('keydown', handleEscape)
      doc.body.style.overflow = previousOverflow
      previousActiveElement?.focus?.()
    }
  }, [open, onClose])

  const isOutOfStock = item?.stock === 0 || item?.outOfStock === true
  const stockLevel: 'in-stock' | 'low-stock' | 'out-of-stock' = isOutOfStock
    ? 'out-of-stock'
    : typeof item?.stock === 'number' && item.stock > 0 && item.stock <= 5
      ? 'low-stock'
      : 'in-stock'
  const mediaItems = useMemo(() => {
    const swatchImages = (item?.swatches ?? [])
      .map((swatch) => swatch.imageUrl)
      .filter((value): value is string => Boolean(value))
    const primary = swatchImages[0] || item?.imageUrl || FALLBACK_IMAGE
    const secondary = swatchImages[1] || item?.hoverImageUrl || undefined
    const candidates = [primary, secondary, ...swatchImages].filter((value): value is string => Boolean(value))
    return Array.from(new Set(candidates))
  }, [item?.hoverImageUrl, item?.imageUrl, item?.swatches])
  const hasMediaNavigation = mediaItems.length > 1
  const safeMediaIndex = Math.min(mediaIndex, Math.max(0, mediaItems.length - 1))
  const currentMedia = mediaItems[safeMediaIndex] || FALLBACK_IMAGE
  const canDecreaseQuantity = quantity > 1
  const canIncreaseQuantity = quantity < 10
  const detailArrowIcon = I18nManager.isRTL ? 'caretLeft' : 'caretRight'
  const titleText = item?.displayTitle || item?.name || ''

  useEffect(() => {
    setMediaIndex(0)
  }, [item?.id, mediaItems.length])

  if (!open || !item) return null

  return (
    <Box
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: c.black,
        opacity: 0.6,
        ...(Platform.OS === 'web'
          ? ({ position: 'fixed' as any } as const)
          : ({ position: 'absolute' } as const)),
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={
        Platform.OS === 'web'
          ? ((event: any) => {
              if (event.target === event.currentTarget) {
                onClose()
              }
            })
          : undefined
      }
      onTouchStart={Platform.OS !== 'web' ? onClose : undefined}
    >
      <Box
        ref={dialogRef}
        accessibilityRole='dialog'
        aria-modal={Platform.OS === 'web' ? true : undefined}
        tabIndex={Platform.OS === 'web' ? -1 : undefined}
        style={{
          backgroundColor: c.surface,
          borderRadius: radius.lg,
          maxWidth: 860,
          width: '90%',
          maxHeight: Platform.OS === 'web' ? '90vh' : '90%',
          overflow: 'hidden',
          ...(Platform.OS === 'web'
            ? ({
                boxShadow: elevation.lg,
              } as any)
            : shadows.lg),
        }}
        onClick={Platform.OS === 'web' ? (event: any) => event.stopPropagation() : undefined}
        onTouchStart={Platform.OS !== 'web' ? (event: any) => event.stopPropagation() : undefined}
      >
        {/* Close button */}
        <Box
          style={{
            position: 'absolute',
            top: spacing['12'],
            right: spacing['12'],
            zIndex: 10,
          }}
        >
          <IconButton
            icon='close'
            label='Close quick view'
            tone='ghost'
            onPress={onClose}
            size='lg'
          />
        </Box>

        <Box
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            gap: isDesktop ? spacing['16'] : spacing['12'],
            padding: isDesktop ? spacing['16'] : spacing['12'],
          }}
        >
          {/* Product Image */}
          <Box
            style={{
              flex: isDesktop ? 1 : undefined,
              width: isDesktop ? 'auto' : '100%',
              borderEndWidth: isDesktop ? borderWidth.thin : borderWidth.none,
              borderColor: c.stroke,
              paddingEnd: isDesktop ? spacing['16'] : spacing.none,
            }}
          >
            <Box
              style={{
                aspectRatio: 1,
                borderRadius: radius.lg,
                overflow: 'hidden',
                backgroundColor: c.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={{ uri: currentMedia }}
                alt={item.name}
                resizeMode='contain'
                style={{ width: '100%', height: '100%' }}
              />
              {item.badge ? (
                <Badge
                  tone='outline'
                  style={{
                    position: 'absolute',
                    top: spacing['12'],
                    end: spacing['12'],
                    backgroundColor: c.surface,
                  }}
                >
                  {item.badge}
                </Badge>
              ) : null}
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  start: spacing['8'],
                  transform: [{ translateY: -spacing['24'] }],
                }}
              >
                <IconCircleButton
                  icon={I18nManager.isRTL ? 'caretRight' : 'caretLeft'}
                  label='Previous image'
                  disabled={!hasMediaNavigation}
                  onPress={
                    hasMediaNavigation
                      ? () =>
                          setMediaIndex((current) => (current === 0 ? mediaItems.length - 1 : current - 1))
                      : undefined
                  }
                />
              </Box>
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  end: spacing['8'],
                  transform: [{ translateY: -spacing['24'] }],
                }}
              >
                <IconCircleButton
                  icon={I18nManager.isRTL ? 'caretLeft' : 'caretRight'}
                  label='Next image'
                  disabled={!hasMediaNavigation}
                  onPress={
                    hasMediaNavigation
                      ? () => setMediaIndex((current) => (current + 1) % mediaItems.length)
                      : undefined
                  }
                />
              </Box>
            </Box>
          </Box>

          {/* Product Info */}
          <Box
            style={{
              flex: isDesktop ? 1 : undefined,
              width: isDesktop ? 'auto' : '100%',
              gap: spacing['20'],
            }}
          >
            {/* Brand */}
            <Text
              variant='caption'
              weight='600'
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                color: c.textSecondary,
              }}
            >
              {item.brand}
            </Text>

            {/* Title */}
            <Text
              variant='title'
              weight='700'
              numberOfLines={2}
            >
              {titleText}
            </Text>

            {/* Rating */}
            {typeof item.rating === 'number' && (
              <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
                <StarRating value={item.rating} reviewCount={item.reviews} size={14} />
                {typeof item.reviews === 'number' && item.reviews > 0 && (
                  <Text variant='bodySm' tone='muted'>
                    ({item.reviews} reviews)
                  </Text>
                )}
              </Box>
            )}

            {/* Price */}
            <PriceTag
              price={item.price}
              currency={item.currency}
              compareAt={item.compareAtPrice}
            />

            <Text variant='caption' tone='muted'>
              Tax included.
            </Text>

            {/* Stock Status */}
            <StockBadge level={stockLevel} quantity={item.stock} />

            {/* Description */}
            {item.description && (
              <Text variant='bodySm' tone='default' numberOfLines={3}>
                {item.description}
              </Text>
            )}

            <Box style={{ gap: spacing['8'] }}>
              <Text variant='bodySm' tone='default'>
                Earn <Text weight='700'>Glow Points</Text> by purchasing this product
              </Text>
              <ReusableButton
                accessibilityLabel='Sign in to earn points'
                variant='link'
                size='sm'
                style={{
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  justifyContent: 'flex-start',
                  alignSelf: 'flex-start',
                }}
              >
                <Text
                  variant='bodySm'
                  weight='600'
                  tone='muted'
                  style={{ textDecorationLine: 'underline' }}
                >
                  Sign In or create an account to earn points
                </Text>
              </ReusableButton>
            </Box>

            {/* Quantity Selector */}
            {/* Actions */}
            <Box style={{ gap: spacing['12'] }}>
              {!isOutOfStock ? (
                <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
                  <Box
                    style={{
                      height: buttonTokens.height.sm,
                      minWidth: spacing['80'],
                      borderRadius: radius.full,
                      borderWidth: borderWidth.thin,
                      borderColor: c.stroke,
                      backgroundColor: c.surface,
                      paddingHorizontal: spacing['6'],
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: spacing['8'],
                    }}
                  >
                    <ReusableButton
                      onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                      disabled={!canDecreaseQuantity || addingToCart}
                      accessibilityLabel='Decrease quantity'
                      variant='ghost'
                      size='icon'
                      style={{
                        width: spacing['24'],
                        height: spacing['24'],
                        minWidth: spacing['24'],
                        minHeight: spacing['24'],
                        paddingHorizontal: 0,
                        paddingVertical: 0,
                        borderRadius: radius.full,
                        backgroundColor: c.surface,
                      }}
                    >
                      <Icon
                        name={I18nManager.isRTL ? 'caretRight' : 'caretLeft'}
                        size={spacing['16']}
                        color={c.textPrimary}
                      />
                    </ReusableButton>
                      <Text variant='bodySm' weight='700'>
                        {quantity}
                      </Text>
                    <ReusableButton
                      onPress={() => setQuantity((current) => Math.min(10, current + 1))}
                      disabled={!canIncreaseQuantity || addingToCart}
                      accessibilityLabel='Increase quantity'
                      variant='ghost'
                      size='icon'
                      style={{
                        width: spacing['24'],
                        height: spacing['24'],
                        minWidth: spacing['24'],
                        minHeight: spacing['24'],
                        paddingHorizontal: 0,
                        paddingVertical: 0,
                        borderRadius: radius.full,
                        backgroundColor: c.surface,
                      }}
                    >
                      <Icon
                        name={I18nManager.isRTL ? 'caretLeft' : 'caretRight'}
                        size={spacing['16']}
                        color={c.textPrimary}
                      />
                    </ReusableButton>
                  </Box>
                  <Box style={{ flex: isDesktop ? undefined : 1, width: isDesktop ? 220 : undefined }}>
                    <Button
                      variant='solid'
                      size='sm'
                      onPress={handleAddToCart}
                      disabled={addingToCart}
                      fullWidth
                    >
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </Box>
                  <IconCircleButton icon='wishlist' label='Add to wishlist' />
                  <IconCircleButton icon='trendArrow' label='Share product' />
                </Box>
              ) : (
                <Button variant='solid' size='lg' disabled fullWidth>
                  Out of Stock
                </Button>
              )}

              <ReusableButton
                onPress={() => {
                  onSelectProduct(item.id)
                  onClose()
                }}
                accessibilityLabel='View full details'
                variant='ghost'
                size='default'
                style={{
                  paddingHorizontal: 0,
                  paddingVertical: spacing['12'],
                  justifyContent: 'center',
                }}
              >
                <Box
                  style={{
                    flexDirection: 'row',
                    gap: spacing['6'],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    variant='bodySm'
                    weight='600'
                    style={{
                      color: c.textSecondary,
                      textDecorationLine: 'underline',
                    }}
                    >
                    View Full Details
                  </Text>
                  <Icon name={detailArrowIcon} size={spacing['16']} color={c.textSecondary} />
                </Box>
              </ReusableButton>
            </Box>
            <Text variant='meta' tone='muted'>
              SKU: {item.id}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
})

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

function IconCircleButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: 'wishlist' | 'trendArrow' | 'caretLeft' | 'caretRight'
  label: string
  onPress?: () => void
  disabled?: boolean
}) {
  const c = useThemeColors()
  return (
    <ReusableButton
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      variant='ghost'
      size='icon'
      style={{
        width: iconButtonTokens.size.lg,
        height: iconButtonTokens.size.lg,
        minWidth: iconButtonTokens.size.lg,
        minHeight: iconButtonTokens.size.lg,
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderRadius: radius.full,
        borderWidth: borderWidth.thin,
        borderColor: c.stroke,
        backgroundColor: c.surface,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Icon name={icon} size={iconButtonTokens.icon.lg} color={c.textPrimary} />
    </ReusableButton>
  )
}
