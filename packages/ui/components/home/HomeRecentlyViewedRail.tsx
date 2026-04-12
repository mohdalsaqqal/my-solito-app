import React, { useMemo } from 'react'
import type { ProductCardModel } from '../ProductCard.types'
import { HomeProductItem } from './types'
import { HomeProductRail } from './HomeProductRail'

type HomeRecentlyViewedRailProps = {
  items: HomeProductItem[]
  onPressProduct?: (item: HomeProductItem) => void
  onAddToCart?: (item: HomeProductItem) => void
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const FALLBACK_FORMATTERS = new Map<string, Intl.NumberFormat>()

function formatPrice(amount: number, currency: string) {
  if (currency === CURRENCY_FORMATTER.resolvedOptions().currency) {
    return CURRENCY_FORMATTER.format(amount)
  }
  let formatter = FALLBACK_FORMATTERS.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    })
    FALLBACK_FORMATTERS.set(currency, formatter)
  }
  return formatter.format(amount)
}

export const HomeRecentlyViewedRail = React.memo(function HomeRecentlyViewedRail({
  items,
  onPressProduct,
  onAddToCart,
}: HomeRecentlyViewedRailProps) {
  const railItems: ProductCardModel[] = useMemo(
    () =>
      items.map((item) => {
        const currency = item.currency ?? 'USD'

        return {
          id: item.id,
          slug: item.href?.split('/').filter(Boolean).pop() ?? item.id,
          href: item.href ?? `/product/${item.id}`,
          title: item.displayTitle ?? item.name,
          brand: item.brand ? { name: item.brand } : undefined,
          image: {
            url: item.imageUrl ?? '/brand-logo-placeholder.svg',
            alt: item.displayTitle ?? item.name,
          },
          price: {
            amount: item.price,
            currency,
            formatted: formatPrice(item.price, currency),
          },
          compareAtPrice: item.compareAtPrice
            ? {
                amount: item.compareAtPrice,
                formatted: formatPrice(item.compareAtPrice, currency),
              }
            : undefined,
          badges: item.badge ? [{ kind: 'discount', label: item.badge }] : undefined,
          rating: item.rating
            ? {
                average: item.rating,
                count: item.reviews ?? 0,
              }
            : undefined,
          reviewCount: item.reviews,
          wishlistEnabled: true,
          isWishlisted: false,
          requiresVariantSelection: item.requiresVariantSelection ?? false,
          inStock: item.outOfStock !== true && (item.stock ?? 1) > 0,
        }
      }),
    [items],
  )

  return (
    <HomeProductRail
      title='Recently viewed'
      items={railItems}
      onPressProduct={(item) => {
        const source = items.find((candidate) => candidate.id === item.id)
        if (source) {
          onPressProduct?.(source)
        }
      }}
      onAddToCart={(item) => {
        const source = items.find((candidate) => candidate.id === item.id)
        if (source) {
          onAddToCart?.(source)
        }
      }}
    />
  )
})
