import React from 'react'
import { Platform, Pressable, ScrollView } from 'react-native'
import { borderWidth, colors, motionDuration, motionEasing, radius, spacing, zIndex } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button } from '../Button'
import { Card } from '../Card'
import { ProductCard, ProductCardSkeleton } from '../ProductCard'
import type { ProductCardModel } from '../ProductCard.types'

function shopProductToCardModel(product: ShopProductCardItem): ProductCardModel {
  return {
    id: product.id,
    slug: product.id,
    href: `/product/${product.id}`,
    title: product.name,
    brand: { name: product.brand },
    image: { url: product.imageUrl ?? '', alt: product.name },
    price: { amount: product.price, currency: 'USD', formatted: `$${product.price.toFixed(2)}` },
    badges: product.badge ? [{ kind: 'discount' as const, label: product.badge }] : [],
    inStock: !product.outOfStock,
    requiresVariantSelection: false,
  }
}

export type ShopSortKey = 'best_selling' | 'newest' | 'price_asc' | 'price_desc'
export type ShopPriceBucket = 'all' | 'under_25' | '25_50' | '50_100' | 'over_100'

export type ShopQueryState = {
  page: number
  sort: ShopSortKey
  categories: string[]
  brands: string[]
  priceBucket: ShopPriceBucket
  saleOnly: boolean
  bundleOnly: boolean
}

export type ShopProductCardItem = {
  id: string
  name: string
  brand: string
  price: number
  imageUrl?: string
  badge?: string
  urgencyLabel?: string
  rating?: number
  reviews?: number
  isNew?: boolean
  isLimited?: boolean
  stock?: number
  outOfStock?: boolean
}

type ShopCatalogViewProps = {
  disabled?: boolean
  isDesktop: boolean
  mobileFiltersOpen: boolean
  setMobileFiltersOpen: (open: boolean) => void
  bannerTitle: string
  bannerSubtitle: string
  bannerBadge?: string
  bannerTimerLabel?: string
  filteredCount: number
  availableCategories: string[]
  availableBrands: string[]
  queryState: ShopQueryState
  safePage: number
  totalPages: number
  products: ShopProductCardItem[]
  cardWidth: number
  onToggleCategory: (category: string) => void
  onToggleBrand: (brand: string) => void
  onSetPriceBucket: (bucket: ShopPriceBucket) => void
  onToggleSaleOnly: () => void
  onToggleBundleOnly: () => void
  onClearAll: () => void
  onSetSort: (sort: ShopSortKey) => void
  onSetPage: (page: number) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  copy?: {
    productsSuffix?: string
    filtersButtonLabel?: string
    filterPanelTitle?: string
    filterCategoryTitle?: string
    filterBrandTitle?: string
    filterPriceTitle?: string
    filterSpecialTitle?: string
    saleOnlyLabel?: string
    bundleOnlyLabel?: string
    clearAllLabel?: string
    clearFiltersLabel?: string
    noProductsMessage?: string
    closeLabel?: string
    sortLabels?: {
      bestSelling?: string
      newest?: string
      priceAsc?: string
      priceDesc?: string
    }
    chipPrefixes?: {
      category?: string
      brand?: string
      price?: string
    }
    priceBucketLabels?: {
      all?: string
      under25?: string
      between25And50?: string
      between50And100?: string
      over100?: string
    }
  }
}

export const ShopCatalogView = React.memo(function ShopCatalogView({
  disabled = false,
  isDesktop,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  bannerTitle,
  bannerSubtitle,
  bannerBadge,
  bannerTimerLabel,
  filteredCount,
  availableCategories,
  availableBrands,
  queryState,
  safePage,
  totalPages,
  products,
  cardWidth,
  onToggleCategory,
  onToggleBrand,
  onSetPriceBucket,
  onToggleSaleOnly,
  onToggleBundleOnly,
  onClearAll,
  onSetSort,
  onSetPage,
  onSelectProduct,
  onAddToCart,
  copy,
}: ShopCatalogViewProps) {
  const productsSuffix = copy?.productsSuffix ?? 'products'
  const filtersButtonLabel = copy?.filtersButtonLabel ?? 'Filters'
  const filterPanelTitle = copy?.filterPanelTitle ?? 'Filters'
  const filterCategoryTitle = copy?.filterCategoryTitle ?? 'Category'
  const filterBrandTitle = copy?.filterBrandTitle ?? 'Brand'
  const filterPriceTitle = copy?.filterPriceTitle ?? 'Price'
  const filterSpecialTitle = copy?.filterSpecialTitle ?? 'Special'
  const saleOnlyLabel = copy?.saleOnlyLabel ?? 'Sale only'
  const bundleOnlyLabel = copy?.bundleOnlyLabel ?? 'Bundle only'
  const clearAllLabel = copy?.clearAllLabel ?? 'Clear all'
  const clearFiltersLabel = copy?.clearFiltersLabel ?? 'Clear filters'
  const noProductsMessage = copy?.noProductsMessage ?? 'No products match your filters.'
  const closeLabel = copy?.closeLabel ?? 'Close'
  const sortBestSelling = copy?.sortLabels?.bestSelling ?? 'Best selling'
  const sortNewest = copy?.sortLabels?.newest ?? 'Newest'
  const sortPriceAsc = copy?.sortLabels?.priceAsc ?? 'Price low-high'
  const sortPriceDesc = copy?.sortLabels?.priceDesc ?? 'Price high-low'
  const chipPrefixCategory = copy?.chipPrefixes?.category ?? 'Category'
  const chipPrefixBrand = copy?.chipPrefixes?.brand ?? 'Brand'
  const chipPrefixPrice = copy?.chipPrefixes?.price ?? 'Price'
  const priceLabelAll = copy?.priceBucketLabels?.all ?? 'All'
  const priceLabelUnder25 = copy?.priceBucketLabels?.under25 ?? 'Under $25'
  const priceLabel25To50 = copy?.priceBucketLabels?.between25And50 ?? '$25 - $50'
  const priceLabel50To100 = copy?.priceBucketLabels?.between50And100 ?? '$50 - $100'
  const priceLabelOver100 = copy?.priceBucketLabels?.over100 ?? 'Over $100'

  const hasActiveFilters =
    queryState.categories.length > 0 ||
    queryState.brands.length > 0 ||
    queryState.priceBucket !== 'all' ||
    queryState.saleOnly ||
    queryState.bundleOnly
  const selectedFiltersCount =
    queryState.categories.length +
    queryState.brands.length +
    (queryState.priceBucket !== 'all' ? 1 : 0) +
    (queryState.saleOnly ? 1 : 0) +
    (queryState.bundleOnly ? 1 : 0)
  const filtersButtonText =
    selectedFiltersCount > 0 ? `${filtersButtonLabel} (${selectedFiltersCount})` : filtersButtonLabel

  const activeFilterChips = [
    ...queryState.categories.map((item) => ({
      id: `cat-${item}`,
      label: `${chipPrefixCategory}: ${item}`,
      onRemove: () => onToggleCategory(item),
    })),
    ...queryState.brands.map((item) => ({
      id: `brand-${item}`,
      label: `${chipPrefixBrand}: ${item}`,
      onRemove: () => onToggleBrand(item),
    })),
    ...(queryState.priceBucket !== 'all'
      ? [
          {
            id: `price-${queryState.priceBucket}`,
            label:
              queryState.priceBucket === 'under_25'
                ? `${chipPrefixPrice}: ${priceLabelUnder25}`
                : queryState.priceBucket === '25_50'
                  ? `${chipPrefixPrice}: ${priceLabel25To50}`
                  : queryState.priceBucket === '50_100'
                    ? `${chipPrefixPrice}: ${priceLabel50To100}`
                    : `${chipPrefixPrice}: ${priceLabelOver100}`,
            onRemove: () => onSetPriceBucket('all'),
          },
        ]
      : []),
    ...(queryState.saleOnly
      ? [{ id: 'sale-only', label: saleOnlyLabel, onRemove: () => onToggleSaleOnly() }]
      : []),
    ...(queryState.bundleOnly
      ? [{ id: 'bundle-only', label: bundleOnlyLabel, onRemove: () => onToggleBundleOnly() }]
      : []),
  ]

  const renderFilterPanel = (showClearAction = true) => (
    <Card radiusKey='xs' style={{ borderWidth: borderWidth.thin, borderColor: colors.border }}>
      <Box gap='2'>
        <Text variant='title'>{filterPanelTitle}</Text>

        <Box style={{ gap: spacing['8'] }}>
          <Text variant='label'>{filterCategoryTitle}</Text>
        {availableCategories.map((category) => (
          <Pressable
            key={category}
            disabled={disabled}
            onPress={() => onToggleCategory(category)}
          >
            <Box
              style={{
                minHeight: spacing['40'],
                justifyContent: 'center',
                paddingHorizontal: spacing['16'],
                borderRadius: radius.xs,
                borderWidth: borderWidth.thin,
                  borderColor: queryState.categories.includes(category) ? colors.primary : colors.border,
                  backgroundColor: queryState.categories.includes(category) ? colors.brandPrimarySubtle : colors.surface,
              }}
            >
              <Text variant='bodySm'>{category}</Text>
            </Box>
          </Pressable>
        ))}
        </Box>

        <Box style={{ gap: spacing['8'] }}>
          <Text variant='label'>{filterBrandTitle}</Text>
        {availableBrands.slice(0, 8).map((brand) => (
          <Pressable
            key={brand}
            disabled={disabled}
            onPress={() => onToggleBrand(brand)}
          >
            <Box
              style={{
                minHeight: spacing['40'],
                justifyContent: 'center',
                paddingHorizontal: spacing['16'],
                borderRadius: radius.xs,
                borderWidth: borderWidth.thin,
                  borderColor: queryState.brands.includes(brand) ? colors.primary : colors.border,
                  backgroundColor: queryState.brands.includes(brand) ? colors.brandPrimarySubtle : colors.surface,
              }}
            >
              <Text variant='bodySm'>{brand}</Text>
            </Box>
          </Pressable>
        ))}
        </Box>

        <Box style={{ gap: spacing['8'] }}>
          <Text variant='label'>{filterPriceTitle}</Text>
        {[
          { id: 'all', label: priceLabelAll },
          { id: 'under_25', label: priceLabelUnder25 },
          { id: '25_50', label: priceLabel25To50 },
          { id: '50_100', label: priceLabel50To100 },
          { id: 'over_100', label: priceLabelOver100 },
        ].map((item) => (
          <Pressable
            key={item.id}
            disabled={disabled}
            onPress={() => onSetPriceBucket(item.id as ShopPriceBucket)}
          >
            <Box
              style={{
                minHeight: spacing['40'],
                justifyContent: 'center',
                paddingHorizontal: spacing['16'],
                borderRadius: radius.xs,
                borderWidth: borderWidth.thin,
                  borderColor: queryState.priceBucket === item.id ? colors.primary : colors.border,
                  backgroundColor: queryState.priceBucket === item.id ? colors.brandPrimarySubtle : colors.surface,
              }}
            >
              <Text variant='bodySm'>{item.label}</Text>
            </Box>
          </Pressable>
        ))}
        </Box>

        <Box style={{ gap: spacing['8'] }}>
          <Text variant='label'>{filterSpecialTitle}</Text>
        <Pressable disabled={disabled} onPress={onToggleSaleOnly}>
          <Box
            style={{
              minHeight: spacing['40'],
              justifyContent: 'center',
              paddingHorizontal: spacing['16'],
              borderRadius: radius.xs,
              borderWidth: borderWidth.thin,
              borderColor: queryState.saleOnly ? colors.primary : colors.border,
              backgroundColor: queryState.saleOnly ? colors.brandPrimarySubtle : colors.surface,
            }}
          >
            <Text variant='bodySm'>{saleOnlyLabel}</Text>
          </Box>
        </Pressable>
        <Pressable disabled={disabled} onPress={onToggleBundleOnly}>
          <Box
            style={{
              minHeight: spacing['40'],
              justifyContent: 'center',
              paddingHorizontal: spacing['16'],
              borderRadius: radius.xs,
              borderWidth: borderWidth.thin,
              borderColor: queryState.bundleOnly ? colors.primary : colors.border,
              backgroundColor: queryState.bundleOnly ? colors.brandPrimarySubtle : colors.surface,
            }}
          >
            <Text variant='bodySm'>{bundleOnlyLabel}</Text>
          </Box>
        </Pressable>
        </Box>

        {showClearAction ? (
          <Button variant='outline' onPress={onClearAll}>
            {clearAllLabel}
          </Button>
        ) : null}
      </Box>
    </Card>
  )

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.pageX, paddingVertical: spacing.sectionY, gap: spacing['24'] }}>
      <Card
        radiusKey='xs'
        style={{
          borderWidth: borderWidth.thin,
          borderColor: colors.primary,
          backgroundColor: colors.brandPrimarySubtle,
        }}
      >
        <Box gap='2'>
          {(bannerBadge || bannerTimerLabel) ? (
            <Box style={{ flexDirection: 'row', gap: spacing['8'], flexWrap: 'wrap' }}>
              {bannerBadge ? (
                <Box
                  style={{
                    borderWidth: borderWidth.thin,
                    borderColor: colors.primary,
                    backgroundColor: colors.surface,
                    borderRadius: radius.xs,
                    paddingHorizontal: spacing['8'],
                    paddingVertical: spacing.xs,
                  }}
                >
                  <Text variant='caption' tone='danger' style={{ textTransform: 'uppercase' }}>
                    {bannerBadge}
                  </Text>
                </Box>
              ) : null}
              {bannerTimerLabel ? (
                <Text variant='caption' tone='danger' style={{ textTransform: 'uppercase' }}>
                  {bannerTimerLabel}
                </Text>
              ) : null}
            </Box>
          ) : null}
          <Text variant='headline'>{bannerTitle}</Text>
          <Text variant='bodySm' tone='default'>{bannerSubtitle}</Text>
        </Box>
      </Card>

      <Box style={{ gap: spacing['16'] }}>
        <Box
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: isDesktop ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: spacing['16'],
          }}
        >
          <Text variant='bodySm' tone='default'>
            {filteredCount} {productsSuffix}
          </Text>
          <Box style={{ flexDirection: 'row', gap: spacing['8'], alignItems: 'center', flexWrap: 'wrap' }}>
            {!isDesktop ? (
              <Button variant='outline' onPress={() => setMobileFiltersOpen(true)}>
                {filtersButtonText}
              </Button>
            ) : null}
            {[
              { id: 'best_selling', label: sortBestSelling },
              { id: 'newest', label: sortNewest },
              { id: 'price_asc', label: sortPriceAsc },
              { id: 'price_desc', label: sortPriceDesc },
            ].map((item) => (
              <Pressable
                key={item.id}
                disabled={disabled}
                onPress={() => onSetSort(item.id as ShopSortKey)}
                style={{
                  minHeight: spacing['40'],
                  paddingHorizontal: spacing['16'],
                  justifyContent: 'center',
                  borderRadius: radius.xs,
                  borderWidth: borderWidth.thin,
                  borderColor: queryState.sort === item.id ? colors.primary : colors.border,
                  backgroundColor: queryState.sort === item.id ? colors.primary : colors.surface,
                  transitionProperty: 'background-color, border-color',
                  transitionDuration: `${motionDuration.microInteraction}ms`,
                  transitionTimingFunction: motionEasing.standard,
                } as any}
              >
                <Text variant='caption' tone={queryState.sort === item.id ? 'inverse' : 'default'} style={{ textTransform: 'uppercase' }}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Box>
        </Box>

        <Box style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: 'flex-start', gap: spacing['24'] }}>
          {isDesktop ? (
            <Box style={{ width: spacing.xxl * 5, position: 'sticky' as any, top: spacing['24'] }}>
              {renderFilterPanel()}
            </Box>
          ) : null}

          <Box style={{ flex: 1, width: '100%', gap: spacing['24'] }}>
            {hasActiveFilters ? (
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'], alignItems: 'center' }}>
                {activeFilterChips.map((chip) => (
                  <Pressable key={chip.id} onPress={chip.onRemove}>
                    <Box
                      style={{
                        minHeight: spacing['40'],
                        paddingHorizontal: spacing['16'],
                        borderRadius: radius.xs,
                        borderWidth: borderWidth.thin,
                        borderColor: colors.border,
                        backgroundColor: colors.surface,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing['8'],
                      }}
                    >
                      <Text variant='caption' style={{ textTransform: 'uppercase' }}>{chip.label}</Text>
                      <Text variant='caption' tone='muted'>x</Text>
                    </Box>
                  </Pressable>
                ))}
                <Button variant='ghost' onPress={onClearAll}>
                  {clearFiltersLabel}
                </Button>
              </Box>
            ) : null}

            {products.length === 0 ? (
              <Card tone='subtle' radiusKey='xs'>
                <Box gap='2'>
                  <Text tone='muted'>{noProductsMessage}</Text>
                  <Box style={{ width: spacing['128'] }}>
                    <Button variant='outline' onPress={onClearAll}>
                      {clearFiltersLabel}
                    </Button>
                  </Box>
                </Box>
              </Card>
            ) : (
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    width={cardWidth}
                    item={shopProductToCardModel(product)}
                    onPress={() => onSelectProduct?.(product.id)}
                    onPressAdd={() => onAddToCart?.(product.id)}
                  />
                ))}
              </Box>
            )}

            <Box style={{ flexDirection: 'row', gap: spacing['8'], alignItems: 'center', flexWrap: 'wrap' }}>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1
                const active = page === safePage
                return (
                  <Pressable
                    key={`page-${page}`}
                    disabled={disabled}
                    onPress={() => onSetPage(page)}
                    style={{
                      minHeight: spacing['40'],
                      minWidth: spacing['40'],
                      paddingHorizontal: spacing['16'],
                      borderRadius: radius.xs,
                      borderWidth: borderWidth.thin,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text variant='caption' tone={active ? 'inverse' : 'default'}>{String(page)}</Text>
                  </Pressable>
                )
              })}
            </Box>
          </Box>
        </Box>
      </Box>

      {!isDesktop && mobileFiltersOpen ? (
        <Box
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: colors.black,
            opacity: 0.25,
            zIndex: zIndex.overlay,
          } as any}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setMobileFiltersOpen(false)} />
          <Box
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: '78%' as any,
              borderTopLeftRadius: radius.xs,
              borderTopRightRadius: radius.xs,
              backgroundColor: colors.surface,
              padding: spacing['16'],
              gap: spacing['16'],
            }}
            accessibilityRole={Platform.OS === 'web' ? 'dialog' : undefined}
          >
            <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant='title'>{filterPanelTitle}</Text>
              <Button variant='ghost' onPress={() => setMobileFiltersOpen(false)}>{closeLabel}</Button>
            </Box>
            <ScrollView contentContainerStyle={{ gap: spacing['16'], paddingBottom: spacing['8'] }}>
              {renderFilterPanel(false)}
            </ScrollView>
            <Box style={{ flexDirection: 'row', gap: spacing['8'] }}>
              <Box style={{ flex: 1 }}>
                <Button variant='outline' onPress={onClearAll}>
                  {clearAllLabel}
                </Button>
              </Box>
              <Box style={{ flex: 1 }}>
                <Button onPress={() => setMobileFiltersOpen(false)}>
                  {filteredCount} {productsSuffix}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}
    </ScrollView>
  )
})
