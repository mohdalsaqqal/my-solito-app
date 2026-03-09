/**
 * ProductCard.tsx
 * Universal product card — web (Next.js) and native (Expo)
 * Stack: Solito v5 · Uniwind · React Native Reusables
 *
 * Usage:
 *   <ProductCard product={product} onAddToCart={handleAdd} onWishlist={handleWishlist} />
 *
 * On web:  renders as a CSS grid item with hover states
 * On native: renders in a FlatList with touch interactions
 */

import React, { useState, useCallback } from 'react'
import { Pressable, View, Text } from 'react-native'
import { Link } from 'solito/link'
import { SolitoImage } from 'solito/image'
import { Badge } from '~/ui/components/badge'
import { Skeleton } from '~/ui/components/skeleton'
import { cn } from '~/ui/lib/utils'

// ─── Types ────────────────────────────────────────────────────

export interface Product {
  id: string
  slug: string
  name: string
  brand?: string
  price: number
  compareAtPrice?: number   // original price before sale
  images: { url: string; alt: string }[]
  rating?: number
  reviewCount?: number
  isNew?: boolean
  isBestSeller?: boolean
  isLowStock?: boolean
  isSoldOut?: boolean
  variants?: { color?: string; swatchHex?: string }[]
  availableSizes?: string[]
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onWishlist?: (product: Product) => void
  isWishlisted?: boolean
  loading?: boolean
  className?: string
}

// ─── Skeleton Loading State ────────────────────────────────────

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <View className={cn('flex-1', className)}>
      <Skeleton className="aspect-product w-full rounded-2xl" />
      <View className="mt-3 gap-2">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/4 rounded" />
        <Skeleton className="h-5 w-1/3 rounded" />
      </View>
    </View>
  )
}

// ─── Star Rating ───────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  return (
    <View
      className="flex-row items-center gap-1"
      accessibilityLabel={`${rating} out of 5 stars, ${count} reviews`}
    >
      <Text className="text-rating text-xs tracking-tight">
        {'★'.repeat(full)}{'½'.repeat(half)}{'☆'.repeat(empty)}
      </Text>
      <Text className="text-muted-foreground text-xs">({count})</Text>
    </View>
  )
}

// ─── Color Swatches ────────────────────────────────────────────

function ColorSwatches({ variants, max = 4 }: { variants: Product['variants']; max?: number }) {
  if (!variants?.length) return null
  const visible = variants.slice(0, max)
  const overflow = variants.length - max

  return (
    <View className="flex-row gap-1 mt-1">
      {visible.map((v, i) => (
        <View
          key={i}
          className="w-[18px] h-[18px] rounded-full border border-border"
          style={v.swatchHex ? { backgroundColor: v.swatchHex } : undefined}
          accessibilityLabel={v.color}
        />
      ))}
      {overflow > 0 && (
        <View className="w-[18px] h-[18px] rounded-full bg-muted items-center justify-center">
          <Text className="text-[9px] font-semibold text-muted-foreground">+{overflow}</Text>
        </View>
      )}
    </View>
  )
}

// ─── Price Display ─────────────────────────────────────────────

function PriceDisplay({ price, compareAtPrice, isSoldOut }: {
  price: number
  compareAtPrice?: number
  isSoldOut?: boolean
}) {
  const isOnSale = compareAtPrice && compareAtPrice > price
  const savings  = isOnSale ? compareAtPrice - price : 0

  if (isSoldOut) {
    return (
      <Text className="text-sm font-semibold text-muted-foreground line-through">
        ${price.toFixed(2)}
      </Text>
    )
  }

  return (
    <View className="flex-row items-baseline gap-2 flex-wrap">
      <Text className={cn(
        'text-sm font-bold text-foreground',
        isOnSale && 'text-sale'
      )}>
        ${price.toFixed(2)}
      </Text>
      {isOnSale && (
        <>
          <Text className="text-xs text-muted-foreground line-through">
            ${compareAtPrice!.toFixed(2)}
          </Text>
          <Text className="text-xs font-semibold text-success">
            Save ${savings.toFixed(2)}
          </Text>
        </>
      )}
    </View>
  )
}

// ─── Product Badges ────────────────────────────────────────────

function ProductBadges({ product }: { product: Product }) {
  return (
    <View className="absolute top-2 left-2 gap-1 z-10">
      {product.isSoldOut && (
        <View className="badge-out px-2 py-0.5 rounded">
          <Text className="text-[10px] font-bold uppercase tracking-wide">Sold Out</Text>
        </View>
      )}
      {!product.isSoldOut && product.compareAtPrice && (
        <View className="badge-sale px-2 py-0.5 rounded">
          <Text className="text-[10px] font-bold uppercase tracking-wide">
            -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
          </Text>
        </View>
      )}
      {!product.isSoldOut && product.isNew && (
        <View className="badge-new px-2 py-0.5 rounded">
          <Text className="text-[10px] font-bold uppercase tracking-wide">New</Text>
        </View>
      )}
      {!product.isSoldOut && product.isBestSeller && (
        <View className="badge-popular px-2 py-0.5 rounded">
          <Text className="text-[10px] font-bold uppercase tracking-wide">Best Seller</Text>
        </View>
      )}
      {!product.isSoldOut && product.isLowStock && (
        <View className="bg-warning-bg px-2 py-0.5 rounded">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-warning-foreground">Low Stock</Text>
        </View>
      )}
    </View>
  )
}

// ─── Main Component ────────────────────────────────────────────

export const ProductCard = React.memo(function ProductCard({
  product,
  onAddToCart,
  onWishlist,
  isWishlisted = false,
  loading = false,
  className,
}: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0)

  const handleWishlist = useCallback(() => {
    onWishlist?.(product)
  }, [onWishlist, product])

  const handleAddToCart = useCallback(() => {
    onAddToCart?.(product)
  }, [onAddToCart, product])

  if (loading) return <ProductCardSkeleton className={className} />

  const href = `/product/${product.slug}`

  return (
    <View className={cn('flex-1', className)}>
      {/* ── Image Area ── */}
      <View className="relative">
        <Link href={href} className="block">
          <View
            className={cn(
              'aspect-product w-full rounded-2xl overflow-hidden bg-muted',
              product.isSoldOut && 'opacity-60'
            )}
          >
            <SolitoImage
              src={product.images[imageIndex]?.url ?? 'https://placehold.co/400x533'}
              alt={product.images[imageIndex]?.alt ?? product.name}
              fill
              contentFit="cover"
              // Web: show secondary image on hover
              className="w-full h-full object-cover transition-opacity duration-200"
            />
          </View>
        </Link>

        {/* Badges */}
        <ProductBadges product={product} />

        {/* Wishlist button */}
        <Pressable
          onPress={handleWishlist}
          accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          accessibilityRole="button"
          accessibilityState={{ checked: isWishlisted }}
          className={cn(
            'absolute top-2 right-2 z-10',
            'w-9 h-9 rounded-full items-center justify-center',
            'bg-background/80 web:backdrop-blur-sm'
          )}
        >
          <Text className={cn(
            'text-base',
            isWishlisted ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {isWishlisted ? '♥' : '♡'}
          </Text>
        </Pressable>

        {/* Quick Add — web: hover overlay, native: long press (handled by parent) */}
        {!product.isSoldOut && onAddToCart && (
          <Pressable
            onPress={handleAddToCart}
            accessibilityLabel={`Quick add ${product.name} to cart`}
            accessibilityRole="button"
            className={cn(
              'absolute bottom-0 left-0 right-0',
              'bg-foreground py-3 items-center justify-center',
              'rounded-b-2xl',
              // On web: hidden by default, shown on hover via group
              // On native: always visible as a simpler overlay
              'native:hidden' // Hide on native (use Sheet for quick-add on native)
            )}
          >
            <Text className="text-background text-xs font-semibold uppercase tracking-widest">
              Add to Cart
            </Text>
          </Pressable>
        )}

        {/* Sold out overlay */}
        {product.isSoldOut && (
          <View className="absolute inset-0 items-center justify-center rounded-2xl">
            <View className="bg-background/80 web:backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sold Out
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Product Info ── */}
      <View className="mt-3 gap-0.5">
        {product.brand && (
          <Text className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
            {product.brand}
          </Text>
        )}

        <Link href={href}>
          <Text
            className="text-sm font-medium text-foreground leading-snug"
            numberOfLines={2}
          >
            {product.name}
          </Text>
        </Link>

        {product.rating && product.reviewCount ? (
          <StarRating rating={product.rating} count={product.reviewCount} />
        ) : null}

        <ColorSwatches variants={product.variants} />

        <PriceDisplay
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          isSoldOut={product.isSoldOut}
        />

        {/* Sold out: notify me button */}
        {product.isSoldOut && (
          <Pressable className="mt-1 border border-border rounded-lg py-1.5 items-center">
            <Text className="text-xs font-medium text-foreground">Notify Me</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
})
