import { useMemo, useState } from 'react'
import { Platform, Image } from 'react-native'
import {
  borderWidth,
  breakpoints,
  colors,
  componentTokens,
  elevation,
  motionDuration,
  radius,
  shadows,
  spacing,
  typography,
} from '@real/tokens'
import { Box, Text, Touchable } from '../primitives'
import { Icon } from './Icon'
import { StarRating } from './StarRating'
import { Badge } from './Badge'
import { StockBadge } from './StockBadge'
import { PriceTag } from './PriceTag'
import { QuantityInput } from './QuantityInput'
import { Button } from './Button'
import { HomeProductItem } from './home/types'

type QuickViewModalProps = {
  item: HomeProductItem | null
  open: boolean
  onClose: () => void
  onAddToCart: (item: HomeProductItem, quantity: number) => void
  onSelectProduct: (productId: string) => void
}

export function QuickViewModal({
  item,
  open,
  onClose,
  onAddToCart,
  onSelectProduct,
}: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  const isDesktop = Platform.OS === 'web' ? true : false

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

  if (!open || !item) return null

  const isOutOfStock = item.stock === 0 || item.outOfStock === true
  const hasDiscount = item.compareAtPrice && item.compareAtPrice > item.price

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onTouchStart={onClose}
    >
      <Box
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          maxWidth: 960,
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden',
          ...(Platform.OS === 'web'
            ? ({
                boxShadow: elevation.e08,
              } as any)
            : shadows.lg),
        }}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Touchable
          onPress={onClose}
          accessibilityRole='button'
          accessibilityLabel='Close quick view'
          style={{
            position: 'absolute',
            top: spacing.md,
            right: spacing.md,
            zIndex: 10,
          }}
        >
          {({ hovered, focused }) => (
            <Box
              style={{
                width: spacing['40'],
                height: spacing['40'],
                borderRadius: radius.full,
                backgroundColor: hovered || focused ? colors.backgroundSecondary : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                transitionProperty: 'background-color',
                transitionDuration: `${motionDuration.microInteraction}ms`,
              }}
            >
              <Icon name='close' size={24} color={colors.textPrimary} />
            </Box>
          )}
        </Touchable>

        <Box
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            gap: isDesktop ? spacing['32'] : spacing['24'],
            padding: isDesktop ? spacing['32'] : spacing['24'],
          }}
        >
          {/* Product Image */}
          <Box
            style={{
              flex: isDesktop ? 1 : undefined,
              width: isDesktop ? 'auto' : '100%',
            }}
          >
            <Box
              style={{
                aspectRatio: 1,
                borderRadius: radius.lg,
                overflow: 'hidden',
                backgroundColor: colors.backgroundSecondary,
              }}
            >
              <Image
                source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
                resizeMode='cover'
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Box>

          {/* Product Info */}
          <Box
            style={{
              flex: isDesktop ? 1 : undefined,
              width: isDesktop ? 'auto' : '100%',
              gap: spacing['16'],
            }}
          >
            {/* Brand */}
            <Text
              variant='caption'
              weight='600'
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                color: colors.textSecondary,
              }}
            >
              {item.brand}
            </Text>

            {/* Title */}
            <Text
              variant='h5'
              weight='700'
              style={{
                color: colors.textPrimary,
                lineHeight: 32,
              }}
            >
              {item.displayTitle || item.name}
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
              compareAtPrice={item.compareAtPrice}
            />

            {/* Stock Status */}
            <StockBadge inStock={!isOutOfStock} lowStockThreshold={5} />

            {/* Description */}
            {item.description && (
              <Text variant='body' tone='default'>
                {item.description}
              </Text>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <Box>
                <Text variant='bodySm' weight='600' style={{ marginBottom: spacing['8'] }}>
                  Quantity
                </Text>
                <QuantityInput
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={10}
                />
              </Box>
            )}

            {/* Actions */}
            <Box style={{ gap: spacing['12'] }}>
              <Button
                variant='solid'
                size='lg'
                onPress={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                fullWidth
              >
                {isOutOfStock ? 'Out of Stock' : addingToCart ? 'Adding...' : `Add to Cart`}
              </Button>

              <Touchable
                onPress={() => {
                  onSelectProduct(item.id)
                  onClose()
                }}
                accessibilityRole='button'
                accessibilityLabel='View full details'
              >
                {({ hovered, focused }) => (
                  <Box
                    style={{
                      paddingVertical: spacing['12'],
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      variant='body'
                      weight='600'
                      style={{
                        color: hovered || focused ? colors.brandPrimary : colors.textSecondary,
                        textDecorationLine: hovered || focused ? 'underline' : 'none',
                      }}
                    >
                      View Full Details →
                    </Text>
                  </Box>
                )}
              </Touchable>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'
