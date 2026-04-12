import React, { useEffect, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import { layout, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Text } from '@real/ui/primitives'
import { Button, ProductCard, ProductCardSkeleton, ShopCatalogView, ShopPriceBucket, ShopQueryState, ShopSortKey } from '@real/ui/components'
import { Product } from '@real/app/lib/types'
import { applyProductFilter } from '@real/app/lib/product-filter'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { useBreakpoint } from '@real/ui/responsive'

type ShopScreenProps = {
  products: Product[]
  loading: boolean
  error: string | null
  disabled?: boolean
  initialCategoryFilters?: string[]
  initialBrandFilters?: string[]
  bannerTitle?: string
  bannerSubtitle?: string
  bannerBadge?: string
  bannerTimerEndsAt?: string
  copy?: {
    loadingLabel?: string
    loadErrorTitle?: string
    retryLabel?: string
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
  onReload: () => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  productCardUrgencyLabel?: string
  productCardUrgencyEnabled?: boolean
  lowStockThreshold?: number
  lowStockLabel?: string
}

const DEFAULT_QUERY: ShopQueryState = {
  page: 1,
  sort: 'best_selling',
  categories: [],
  brands: [],
  priceBucket: 'all',
  saleOnly: false,
  bundleOnly: false,
}

function serializeQueryState(state: ShopQueryState) {
  const params = new URLSearchParams()
  params.set('page', String(state.page))
  params.set('sort', state.sort)
  if (state.categories.length > 0) {
    params.set('categories', state.categories.join(','))
  }
  if (state.brands.length > 0) {
    params.set('brands', state.brands.join(','))
  }
  if (state.priceBucket !== 'all') {
    params.set('price', state.priceBucket)
  }
  if (state.saleOnly) {
    params.set('sale', '1')
  }
  if (state.bundleOnly) {
    params.set('bundle', '1')
  }
  return params.toString()
}

function parseQueryState(search: string): ShopQueryState {
  const params = new URLSearchParams(search)
  const pageValue = Number(params.get('page') ?? '1')
  const sortValue = (params.get('sort') ?? DEFAULT_QUERY.sort) as ShopSortKey
  const priceValue = (params.get('price') ?? DEFAULT_QUERY.priceBucket) as ShopPriceBucket
  const categories = (params.get('categories') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const brands = (params.get('brands') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return {
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    sort: ['best_selling', 'newest', 'price_asc', 'price_desc'].includes(sortValue)
      ? sortValue
      : DEFAULT_QUERY.sort,
    categories,
    brands,
    priceBucket: ['all', 'under_25', '25_50', '50_100', 'over_100'].includes(priceValue)
      ? priceValue
      : DEFAULT_QUERY.priceBucket,
    saleOnly: params.get('sale') === '1',
    bundleOnly: params.get('bundle') === '1',
  }
}

function writeQueryState(state: ShopQueryState) {
  if (Platform.OS !== 'web') {
    return
  }
  const nextSearch = serializeQueryState(state)
  const currentSearch = globalThis.location.search.startsWith('?')
    ? globalThis.location.search.slice(1)
    : globalThis.location.search
  if (currentSearch === nextSearch) {
    return
  }
  const next = `${globalThis.location.pathname}?${nextSearch}`
  globalThis.history.replaceState(null, '', next)
}

function hasBundleTag(name: string) {
  const normalized = name.toLowerCase()
  return normalized.includes('bundle') || normalized.includes('set') || normalized.includes('kit') || normalized.includes('routine')
}

function isOutOfStockProduct(product: Product) {
  if (typeof product.stock === 'number') {
    return product.stock <= 0
  }
  if (passThroughPricingService.getProductPrice(product).unitPrice <= 0) {
    return true
  }
  const normalized = product.name.toLowerCase()
  return normalized.includes('out of stock') || normalized.includes('sold out')
}

function matchesPrice(price: number, bucket: ShopPriceBucket) {
  if (bucket === 'under_25') return price < 25
  if (bucket === '25_50') return price >= 25 && price <= 50
  if (bucket === '50_100') return price > 50 && price <= 100
  if (bucket === 'over_100') return price > 100
  return true
}

function toggleItem(items: string[], value: string) {
  if (items.includes(value)) {
    return items.filter((item) => item !== value)
  }
  return [...items, value]
}

export const ShopScreen = React.memo(function ShopScreen({
  products,
  loading,
  error,
  disabled = false,
  initialCategoryFilters,
  initialBrandFilters,
  bannerTitle = 'Flash offers and best sellers',
  bannerSubtitle = 'Discover active deals, trending picks, and high-conversion routines.',
  bannerBadge,
  bannerTimerEndsAt,
  copy,
  onReload,
  onSelectProduct,
  onAddToCart,
  productCardUrgencyLabel,
  productCardUrgencyEnabled = true,
  lowStockThreshold,
  lowStockLabel,
}: ShopScreenProps) {
  const profile = useBreakpoint()
  const isDesktop = profile.breakpoint === 'desktop'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [queryState, setQueryState] = useState<ShopQueryState>(DEFAULT_QUERY)

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return
    }
    const handlePopState = () => {
      setQueryState(parseQueryState(globalThis.location.search))
    }
    setQueryState(parseQueryState(globalThis.location.search))
    globalThis.addEventListener('popstate', handlePopState)
    return () => {
      globalThis.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    writeQueryState(queryState)
  }, [queryState])

  useEffect(() => {
    if (Platform.OS === 'web') {
      return
    }

    const nextCategories = (initialCategoryFilters ?? []).filter(Boolean)
    const currentCategories = queryState.categories

    if (
      nextCategories.length === currentCategories.length &&
      nextCategories.every((value, index) => value === currentCategories[index])
    ) {
      return
    }

    setQueryState((current) => ({
      ...current,
      page: 1,
      categories: nextCategories,
    }))
  }, [initialCategoryFilters, queryState.categories])

  useEffect(() => {
    if (Platform.OS === 'web') {
      return
    }

    const nextBrands = (initialBrandFilters ?? []).filter(Boolean)
    const currentBrands = queryState.brands

    if (
      nextBrands.length === currentBrands.length &&
      nextBrands.every((value, index) => value === currentBrands[index])
    ) {
      return
    }

    setQueryState((current) => ({
      ...current,
      page: 1,
      brands: nextBrands,
    }))
  }, [initialBrandFilters, queryState.brands])

  const availableBrands = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.brand).filter((value): value is string => Boolean(value)))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [products]
  )
  const availableCategories = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.category).filter((value): value is string => Boolean(value)))
      ).sort((a, b) => a.localeCompare(b)),
    [products]
  )

  const filteredProducts = useMemo(() => {
    const filtered = applyProductFilter(products, {
      brand: queryState.brands.length > 0 ? queryState.brands : undefined,
      category: queryState.categories.length > 0 ? queryState.categories : undefined,
      onSale: queryState.saleOnly || undefined,
      sort:
        queryState.sort === 'newest' || queryState.sort === 'price_asc' || queryState.sort === 'price_desc'
          ? queryState.sort
          : 'bestseller',
    })
    const withPrice = filtered.filter((item) =>
      matchesPrice(passThroughPricingService.getProductPrice(item).unitPrice, queryState.priceBucket)
    )
    return queryState.bundleOnly ? withPrice.filter((item) => hasBundleTag(item.name)) : withPrice
  }, [products, queryState])

  const pageSize = isDesktop ? 16 : 8
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safePage = Math.min(queryState.page, totalPages)
  const currentPageProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize)
  const containerWidth = Math.max(Math.min(profile.containerWidth - layout.gutterX.md * 2, layout.maxWidth.commerce), spacing.xxl * 4)
  const productGridGap = spacing['16']
  const desktopFilterWidth = spacing.xxl * 5
  const desktopPanelGap = spacing['24']
  const desktopContentWidth = Math.max(containerWidth - desktopFilterWidth - desktopPanelGap, spacing.xxl * 8)
  const desktopCardWidth = Math.floor((desktopContentWidth - productGridGap * 3) / 4)
  const mobileCardWidth = Math.floor((containerWidth - productGridGap) / 2)
  const cardWidth = Math.max(isDesktop ? desktopCardWidth : mobileCardWidth, spacing.xxl * 3)
  const bannerTimerLabel = useMemo(() => {
    if (!bannerTimerEndsAt) return undefined
    const end = new Date(bannerTimerEndsAt).getTime()
    const delta = end - Date.now()
    if (Number.isNaN(end) || delta <= 0) return undefined
    const hours = Math.floor(delta / (1000 * 60 * 60))
    const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60))
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m left`
  }, [bannerTimerEndsAt])

  useEffect(() => {
    if (safePage !== queryState.page) {
      setQueryState((current) => ({ ...current, page: safePage }))
    }
  }, [queryState.page, safePage])

  const apply = (patch: Partial<ShopQueryState>, resetPage = true) => {
    setQueryState((current) => ({
      ...current,
      ...patch,
      page: resetPage ? 1 : (patch.page ?? current.page),
    }))
  }

  if (loading) {
    return (
      <PageScaffold variant='commerce' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='12'>
              <Text variant='title' tone='muted'>{copy?.loadingLabel ?? 'Loading shop...'}</Text>
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['16'] }}>
                {Array.from({ length: isDesktop ? 8 : 4 }, (_, idx) => (
                  <ProductCardSkeleton key={`shop-loading-${idx}`} width={cardWidth} />
                ))}
              </Box>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (error) {
    return (
      <PageScaffold variant='commerce' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='8'>
              <Text variant='title' tone='danger'>{copy?.loadErrorTitle ?? 'Unable to load products.'}</Text>
              <Text variant='bodySm' tone='muted'>{error}</Text>
              <Box>
                <Button onPress={onReload}>{copy?.retryLabel ?? 'Retry'}</Button>
              </Box>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  return (
    <PageScaffold variant='commerce' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <ShopCatalogView
            disabled={disabled}
            isDesktop={isDesktop}
            mobileFiltersOpen={mobileFiltersOpen}
            setMobileFiltersOpen={setMobileFiltersOpen}
            bannerTitle={bannerTitle}
            bannerSubtitle={bannerSubtitle}
            bannerBadge={bannerBadge}
            bannerTimerLabel={bannerTimerLabel}
            filteredCount={filteredProducts.length}
            availableCategories={availableCategories}
            availableBrands={availableBrands}
            queryState={queryState}
            safePage={safePage}
            totalPages={totalPages}
            products={currentPageProducts.map((product) => {
              const resolvedPrice = passThroughPricingService.getProductPrice(product)
              return {
                id: product.id,
                name: product.name,
                brand: product.brand ?? 'Brand',
                price: resolvedPrice.unitPrice,
                imageUrl: product.image,
                badge: product.isNew ? 'NEW' : hasBundleTag(product.name) ? 'NEW' : undefined,
                urgencyLabel:
                  typeof product.stock === 'number' &&
                  product.stock > 0 &&
                  typeof lowStockThreshold === 'number' &&
                  product.stock <= lowStockThreshold &&
                  lowStockLabel
                    ? lowStockLabel
                    : productCardUrgencyEnabled
                      ? productCardUrgencyLabel
                      : undefined,
                rating: product.rating,
                reviews: product.reviews,
                isNew: product.isNew,
                isLimited: product.isLimited,
                stock: product.stock,
                outOfStock: isOutOfStockProduct(product),
              }
            })}
            cardWidth={cardWidth}
            onToggleCategory={(category) => apply({ categories: toggleItem(queryState.categories, category) })}
            onToggleBrand={(brand) => apply({ brands: toggleItem(queryState.brands, brand) })}
            onSetPriceBucket={(priceBucket) => apply({ priceBucket })}
            onToggleSaleOnly={() => apply({ saleOnly: !queryState.saleOnly })}
            onToggleBundleOnly={() => apply({ bundleOnly: !queryState.bundleOnly })}
            onClearAll={() => apply(DEFAULT_QUERY)}
            onSetSort={(sort) => apply({ sort })}
            onSetPage={(page) => apply({ page }, false)}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            copy={copy}
          />
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
})
