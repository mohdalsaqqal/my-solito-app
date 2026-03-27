import { useEffect, useMemo, useState } from 'react'
import { Image, Platform, useWindowDimensions, View } from 'react-native'
import { Product, Review } from '@real/app/lib/types'
import { borderWidth, breakpoints, colors, componentTokens, layout, radius, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Divider, HorizontalScroll, Text, Touchable } from '@real/ui/primitives'
import {
  Badge,
  Button,
  Card,
  Icon,
  MarketplacePromoStrip,
  PaymentBadges,
  PriceTag,
  ProductCard,
  QuantityInput,
  StockBadge,
} from '@real/ui/components'
import { applyProductFilter } from '@real/app/lib/product-filter'
import { recommendationService } from '@real/app/lib/recommendation'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { buildHomeProductItem } from '@real/app/lib/product-card-presentation'
import { HomeProductItem } from '@real/ui/components/home/types'

type ProductScreenProps = {
  product: Product | null
  products: Product[]
  locale?: 'en' | 'ar'
  completeSetTitle?: string
  relatedTitle?: string
  completeSetQuery?: {
    source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
    limit?: number
    sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
    productIds?: string[]
    brandNames?: string[]
  }
  relatedQuery?: {
    source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
    limit?: number
    sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
    productIds?: string[]
    brandNames?: string[]
  }
  relatedProductIds?: string[]
  copy?: {
    tabs?: {
      description?: string
      howToUse?: string
      ingredients?: string
    }
    labels?: {
      inStock?: string
      outOfStock?: string
      quantity?: string
      noSelectableOptions?: string
      deliveryAssurance?: string
      selectedSubtotal?: string
      reviewsTitle?: string
      loading?: string
      noReviews?: string
      reviewsLoadError?: string
      addToCart?: string
      addShort?: string
      adding?: string
      notifyMe?: string
      completeSetOutOfStock?: string
      submitError?: string
    }
    defaults?: {
      description?: string
      howToUse?: string
      ingredients?: string
    }
    deliveryHighlights?: string[]
    stockMessages?: {
      limitedStock?: string
      readyDispatch?: string
      outOfStock?: string
    }
  }
  reviews?: Review[]
  reviewsLoading?: boolean
  reviewsError?: string | null
  loading: boolean
  error: string | null
  onAddToCart?: (productId: string, quantity: number) => Promise<void> | void
  onSelectProduct?: (productId: string) => void
  onReload: () => void
}

const PLACEHOLDER_IMAGE = '/brand-logo-placeholder.svg'
type ProductTabKey = 'description' | 'how_to_use' | 'ingredients'
type ProductOptionGroup = {
  id: string
  label: string
  values: string[]
}

function deriveBrand(name: string) {
  const [left] = name.split('-')
  return left?.trim() || 'Brand'
}

function deriveProductName(name: string) {
  const split = name.split('-')
  if (split.length < 2) {
    return name
  }
  return split.slice(1).join('-').trim()
}

function resolveRailProducts(
  allProducts: Product[],
  query?: {
    source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
    limit?: number
    sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
    productIds?: string[]
    brandNames?: string[]
  }
) {
  const source = query?.source ?? 'best_sellers'
  const limit = Math.max(1, query?.limit ?? 4)
  const brandFilter = (query?.brandNames ?? []).map((name) => name.trim().toLowerCase().replace(/\s+/g, '-'))

  if (source === 'manual_ids') {
    return applyProductFilter(allProducts, {
      ids: query?.productIds ?? [],
      brand: brandFilter.length > 0 ? brandFilter : undefined,
      sort: query?.sortBy === 'price_asc' ? 'price_asc' : query?.sortBy === 'price_desc' ? 'price_desc' : undefined,
      limit,
    })
  }

  if (source === 'new_arrivals') {
    return applyProductFilter(allProducts, {
      brand: brandFilter.length > 0 ? brandFilter : undefined,
      sort: 'newest',
      limit,
    })
  }

  return applyProductFilter(allProducts, {
    brand: brandFilter.length > 0 ? brandFilter : undefined,
    sort: 'bestseller',
    limit,
  })
}

function inferOutOfStock(product: Product) {
  const price = passThroughPricingService.getProductPrice(product).unitPrice
  if (price <= 0) {
    return true
  }
  const normalized = product.name.toLowerCase()
  return normalized.includes('out of stock') || normalized.includes('sold out')
}

function inferOptionGroups(product: Product): ProductOptionGroup[] {
  const normalized = product.name.toLowerCase()
  if (normalized.includes('parfum') || normalized.includes('fragrance')) {
    return [{ id: 'size', label: 'Size', values: ['30 ml', '50 ml', '100 ml'] }]
  }
  if (normalized.includes('lip') || normalized.includes('glow')) {
    return [{ id: 'shade', label: 'Shade', values: ['Berry', 'Rose', 'Coral', 'Nude'] }]
  }
  if (normalized.includes('serum') || normalized.includes('cream') || normalized.includes('cleanser')) {
    return [{ id: 'size', label: 'Size', values: ['30 ml', '50 ml', '75 ml'] }]
  }
  return [{ id: 'size', label: 'Size', values: ['Standard'] }]
}

export function ProductScreen({
  product,
  products,
  locale = 'en',
  completeSetTitle = 'Complete the set',
  relatedTitle = 'You may also like',
  completeSetQuery,
  relatedQuery,
  relatedProductIds = [],
  copy,
  reviews = [],
  reviewsLoading = false,
  reviewsError = null,
  loading,
  error,
  onAddToCart,
  onSelectProduct,
  onReload,
}: ProductScreenProps) {
  const { width } = useWindowDimensions()
  const isCompact = width > 0 && width < breakpoints.tabletMin
  const isDesktop = width >= breakpoints.desktopMin || (Platform.OS === 'web' && width === 0)
  const pdpTokens = componentTokens.storefrontCommerce.pdp
  const loadErrorTitle = locale === 'ar' ? 'تعذر تحميل المنتج' : 'Unable to load product'
  const retryLabel = locale === 'ar' ? 'إعادة المحاولة' : 'Retry'
  const notFoundTitle = locale === 'ar' ? 'المنتج غير موجود' : 'Product not found'
  const notFoundMessage =
    locale === 'ar'
      ? 'قد يكون هذا المنتج قد تمت إزالته أو أنه غير متاح.'
      : 'This product may have been removed or is unavailable.'
  const refreshLabel = locale === 'ar' ? 'تحديث' : 'Refresh'
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<ProductTabKey>('description')
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const imageUrls = useMemo(() => {
    if (!product?.image) {
      return [PLACEHOLDER_IMAGE]
    }
    return [product.image]
  }, [product?.image])

  const optionGroups = useMemo(() => {
    if (!product) {
      return []
    }
    return inferOptionGroups(product)
  }, [product])

  const completeSetProducts = useMemo(() => {
    if (!product) {
      return []
    }
    const manual = recommendationService.getCompleteSet(product, products).filter((item) => item.id !== product.id)
    if (manual.length > 0) {
      return manual.slice(0, 4)
    }
    const fromCms = resolveRailProducts(
      products.filter((item) => item.id !== product.id),
      completeSetQuery
    )
    if (fromCms.length > 0) {
      return fromCms
    }
    const sameBrand = products.filter(
      (item) =>
        item.id !== product.id &&
        (item.brand ? item.brand === product.brand : deriveBrand(item.name) === deriveBrand(product.name))
    )
    return sameBrand.slice(0, 4)
  }, [product, products, completeSetQuery])

  const relatedProducts = useMemo(() => {
    if (!product) {
      return []
    }
    const excludedIds = new Set<string>([product.id, ...completeSetProducts.map((item) => item.id)])
    const fromCrossSellMap = relatedProductIds
      .map((id) => products.find((item) => item.id === id))
      .filter((item): item is Product => Boolean(item))
      .filter((item) => !excludedIds.has(item.id))
    if (fromCrossSellMap.length > 0) {
      return fromCrossSellMap.slice(0, 8)
    }

    const manual = recommendationService.getRelated(product, products).filter((item) => !excludedIds.has(item.id))
    if (manual.length > 0) {
      return manual.slice(0, 8)
    }

    const fromCms = resolveRailProducts(products, relatedQuery).filter((item) => !excludedIds.has(item.id))
    if (fromCms.length > 0) {
      return fromCms.slice(0, 8)
    }
    return products
      .filter(
        (item) =>
          !excludedIds.has(item.id) &&
          deriveBrand(item.name) === deriveBrand(product.name)
      )
      .slice(0, 8)
  }, [product, products, completeSetProducts, relatedQuery, relatedProductIds])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0
    }
    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
  }, [reviews])

  const completeSetSubtotal = useMemo(() => {
    const selected = completeSetProducts
      .filter((item) => selectedSetIds.includes(item.id))
      .map((item) => ({ ...item, quantity: 1 }))
    return passThroughPricingService.getCartTotals(selected).subtotal
  }, [completeSetProducts, selectedSetIds])

  useEffect(() => {
    if (!product) {
      return
    }
    setActiveImageIndex(0)
    setActiveTab('description')
    setQuantity(1)
    setSubmitError(null)

    const nextOptions: Record<string, string> = {}
    for (const group of optionGroups) {
      nextOptions[group.id] = group.values[0] ?? ''
    }
    setSelectedOptions(nextOptions)

    const firstSet = completeSetProducts[0]
    setSelectedSetIds(firstSet ? [firstSet.id] : [])
  }, [product, optionGroups, completeSetProducts])

  if (loading) {
    return (
      <PageScaffold variant='product' density='tight' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='lg'>
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 6 }} />
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 3 }} />
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (error) {
    return (
      <PageScaffold variant='product' density='tight' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Text variant='h2'>{loadErrorTitle}</Text>
              <Text tone='muted'>{error}</Text>
              <Box style={isCompact ? undefined : { width: spacing.xxl * 3 }}>
                <Button variant='outline' onPress={onReload}>{retryLabel}</Button>
              </Box>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (!product) {
    return (
      <PageScaffold variant='product' density='tight' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Text variant='h2'>{notFoundTitle}</Text>
              <Text tone='muted'>{notFoundMessage}</Text>
              <Box style={isCompact ? undefined : { width: spacing.xxl * 3 }}>
                <Button variant='outline' onPress={onReload}>{refreshLabel}</Button>
              </Box>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  const resolvedProduct = product
  const inStock = !inferOutOfStock(resolvedProduct)
  const productId = resolvedProduct.id
  const productPrice = passThroughPricingService.getProductPrice(resolvedProduct).unitPrice
  const compareAtPrice =
    resolvedProduct.compareAtPrice && resolvedProduct.compareAtPrice > productPrice
      ? resolvedProduct.compareAtPrice
      : undefined
  const savingsAmount = compareAtPrice ? compareAtPrice - productPrice : 0
  const savingsPercent = compareAtPrice ? Math.round((savingsAmount / compareAtPrice) * 100) : 0
  const brand = deriveBrand(resolvedProduct.name)
  const displayName = deriveProductName(resolvedProduct.name)
  const hasThumbnailRail = imageUrls.length > 1
  const activeImage = imageUrls[Math.min(activeImageIndex, imageUrls.length - 1)] ?? PLACEHOLDER_IMAGE
  const stickyTop = layout.header.mainRowHeight + layout.header.navRowHeight + spacing.md
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const tabLabelDescription = copy?.tabs?.description ?? (locale === 'ar' ? 'الوصف' : 'Description')
  const tabLabelHowToUse = copy?.tabs?.howToUse ?? (locale === 'ar' ? 'طريقة الاستخدام' : 'How to use')
  const tabLabelIngredients = copy?.tabs?.ingredients ?? (locale === 'ar' ? 'المكونات' : 'Ingredients')
  const inStockLabel = copy?.labels?.inStock ?? (locale === 'ar' ? 'متوفر' : 'In stock')
  const outOfStockLabel = copy?.labels?.outOfStock ?? (locale === 'ar' ? 'غير متوفر' : 'Out of stock')
  const quantityLabel = copy?.labels?.quantity ?? (locale === 'ar' ? 'الكمية' : 'Qty')
  const noSelectableOptionsLabel =
    copy?.labels?.noSelectableOptions ??
    (locale === 'ar' ? 'لا توجد خيارات تحديد لهذا المنتج.' : 'No selectable options for this product.')
  const addToCartLabel = copy?.labels?.addToCart ?? (locale === 'ar' ? 'أضف إلى السلة' : 'Add to cart')
  const addShortLabel = copy?.labels?.addShort ?? (locale === 'ar' ? 'أضف' : 'Add')
  const addingLabel = copy?.labels?.adding ?? (locale === 'ar' ? 'جاري الإضافة...' : 'Adding...')
  const notifyMeLabel = copy?.labels?.notifyMe ?? (locale === 'ar' ? 'أبلغني' : 'Notify me')
  const deliveryAssuranceLabel = copy?.labels?.deliveryAssurance ?? (locale === 'ar' ? 'التوصيل والضمان' : 'Delivery & assurance')
  const selectedSubtotalLabel = copy?.labels?.selectedSubtotal ?? (locale === 'ar' ? 'المجموع المختار' : 'Selected subtotal')
  const reviewsTitleLabel = copy?.labels?.reviewsTitle ?? (locale === 'ar' ? 'التقييمات والمراجعات' : 'Ratings & reviews')
  const bestsellerLabel = locale === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller'
  const topRatedLabel = locale === 'ar' ? 'الأعلى تقييماً' : 'Top Rated'
  const loadingLabel = copy?.labels?.loading ?? (locale === 'ar' ? 'جاري التحميل...' : 'Loading...')
  const noReviewsLabel =
    copy?.labels?.noReviews ??
    (locale === 'ar'
      ? 'لا توجد مراجعات حالياً لهذا المنتج.'
      : 'No customer reviews are available for this product yet.')
  const reviewsLoadErrorLabel =
    copy?.labels?.reviewsLoadError ??
    (locale === 'ar' ? 'تعذر تحميل المراجعات حالياً.' : 'Unable to load reviews right now.')
  const completeSetOutOfStockLabel =
    copy?.labels?.completeSetOutOfStock ?? (locale === 'ar' ? 'غير متوفر' : 'Out of stock')
  const submitErrorLabel =
    copy?.labels?.submitError ??
    (locale === 'ar' ? 'تعذر إضافة المنتجات إلى السلة.' : 'Unable to add items to cart.')
  const productDescription =
    product.description ||
    copy?.defaults?.description ||
    (locale === 'ar' ? 'تركيبة فاخرة مصممة للاستخدام اليومي.' : 'A premium formula designed for daily routines.')
  const usage =
    copy?.defaults?.howToUse ||
    (locale === 'ar'
      ? 'يُستخدم على بشرة أو شعر نظيف حسب الحاجة صباحاً ومساءً.'
      : 'Apply to clean skin or hair as needed, morning and evening.')
  const ingredients =
    copy?.defaults?.ingredients ||
    (locale === 'ar'
      ? 'ماء، جلسرين، عطر، مستخلصات نباتية.'
      : 'Aqua, Glycerin, Fragrance, Botanical Extracts.')
  const deliveryHighlights =
    copy?.deliveryHighlights && copy.deliveryHighlights.length > 0
      ? copy.deliveryHighlights
      : locale === 'ar'
        ? ['توصيل خلال 2-4 أيام عمل', 'إرجاع خلال 14 يوماً', 'دفع آمن عند الاستلام أو البطاقة']
        : ['Delivery in 2-4 business days', '14-day return window', 'Secure payment at checkout']
  const stockMessage = inStock
    ? productPrice > 90
      ? locale === 'ar'
        ? (copy?.stockMessages?.limitedStock ?? 'مخزون محدود - يفضل إتمام الطلب قريباً')
        : (copy?.stockMessages?.limitedStock ?? 'Limited stock - recommended to checkout soon')
      : locale === 'ar'
        ? (copy?.stockMessages?.readyDispatch ?? 'متوفر للشحن الفوري')
        : (copy?.stockMessages?.readyDispatch ?? 'Ready for immediate dispatch')
    : locale === 'ar'
      ? (copy?.stockMessages?.outOfStock ?? 'غير متوفر حالياً')
      : (copy?.stockMessages?.outOfStock ?? 'Currently out of stock')
  const stockLevel: 'in-stock' | 'low-stock' | 'out-of-stock' = !inStock
    ? 'out-of-stock'
    : typeof product.stock === 'number' && product.stock > 0 && product.stock <= 8
    ? 'low-stock'
    : 'in-stock'
  const relatedHomeItems = relatedProducts.map((item) => buildHomeProductItem(item, locale))
  const mobileStickyStyle =
    Platform.OS === 'web'
      ? ({
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          borderTopWidth: borderWidth.thin,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: pdpTokens.stickyMobileBarPadding,
          paddingVertical: pdpTokens.stickyMobileBarPadding,
        } as any)
      : {
          borderTopWidth: borderWidth.thin,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: pdpTokens.stickyMobileBarPadding,
          paddingVertical: pdpTokens.stickyMobileBarPadding,
        }

  const formatPrice = (value: number) => currencyFormatter.format(value)

  async function handleAddToCart() {
    if (!inStock || !onAddToCart) {
      return
    }
    setSubmitting(true)
      setSubmitError(null)
    try {
      await onAddToCart(productId, quantity)
      for (const setItemId of selectedSetIds) {
        await onAddToCart(setItemId, 1)
      }
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : submitErrorLabel)
    } finally {
      setSubmitting(false)
    }
  }

  function toggleSetItem(productId: string) {
    setSelectedSetIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    )
  }

  function renderPurchaseActions(compact = false) {
    return (
      <Card
        variant='flat'
        style={{
          gap: pdpTokens.purchasePanelGap,
          backgroundColor: colors.surface,
          borderWidth: borderWidth.thin,
          borderColor: colors.border,
        }}
      >
        <MarketplacePromoStrip
          badge={savingsPercent >= 10 ? `-${savingsPercent}%` : stockLevel === 'low-stock' ? 'Limited offer' : 'Fast ship'}
          title={compareAtPrice ? `Save ${formatPrice(savingsAmount)} on this item` : stockMessage}
          subtitle={compareAtPrice ? 'Promotion-first pricing with low-friction add to cart' : deliveryAssuranceLabel}
        />
        <Box style={{ gap: spacing['12'] }}>
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
            {resolvedProduct.isLimited ? <Badge tone='premium'>{bestsellerLabel}</Badge> : null}
            {averageRating >= 4.5 ? <Badge tone='premium'>{topRatedLabel}</Badge> : null}
            {savingsPercent >= 10 ? <Badge tone='accent'>Save {savingsPercent}%</Badge> : null}
          </Box>
          <PriceTag
            price={productPrice}
            compareAt={compareAtPrice}
            currency={resolvedProduct.currency}
            size='lg'
          />
          {compareAtPrice ? (
            <Text variant='bodySm' tone='danger'>
              {locale === 'ar'
                ? `وفر ${formatPrice(savingsAmount)} على هذا المنتج`
                : `Save ${formatPrice(savingsAmount)} on this item`}
            </Text>
          ) : null}
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
            <StockBadge level={stockLevel} quantity={resolvedProduct.stock} />
            <Text variant='caption' tone='muted'>
              {stockMessage}
            </Text>
          </Box>
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
            <Icon name='star' size={spacing['16']} color={colors.goldPrimary} weight='fill' />
            <Text variant='caption' tone='muted'>
              {reviews.length > 0
                ? `${averageRating.toFixed(1)} / 5 (${reviews.length})`
                : noReviewsLabel}
            </Text>
          </Box>
        </Box>

        {optionGroups.length > 0 ? (
          <Box style={{ gap: spacing['8'] }}>
            {optionGroups.map((group) => (
              <Box key={group.id} style={{ gap: spacing['8'] }}>
                <Text variant='caption' weight='700' tone='muted'>
                  {group.label}
                </Text>
                <HorizontalScroll>
                  <Box style={{ flexDirection: 'row', gap: spacing['8'] }}>
                    {group.values.map((value) => {
                      const active = selectedOptions[group.id] === value
                      return (
                        <Touchable
                          key={value}
                          onPress={() => setSelectedOptions((current) => ({ ...current, [group.id]: value }))}
                          style={{
                            borderWidth: borderWidth.thin,
                            borderColor: active ? colors.brandPrimary : colors.border,
                            backgroundColor: active ? colors.brandPrimarySubtle : colors.surface,
                            borderRadius: radius.md,
                            paddingHorizontal: spacing['16'],
                            paddingVertical: spacing['8'],
                          }}
                        >
                          <Text variant='bodySm'>{value}</Text>
                        </Touchable>
                      )
                    })}
                  </Box>
                </HorizontalScroll>
              </Box>
            ))}
          </Box>
        ) : (
          <Text variant='caption' tone='muted'>{noSelectableOptionsLabel}</Text>
        )}

        <Box style={{ gap: spacing['8'] }}>
          <Text variant='caption' weight='700' tone='muted'>
            {quantityLabel}
          </Text>
          <QuantityInput value={quantity} onChange={setQuantity} disabled={!inStock || submitting} />
        </Box>

        {inStock ? (
          <Button disabled={submitting} onPress={handleAddToCart} size='lg' fullWidth>
            {submitting ? addingLabel : compact ? addShortLabel : addToCartLabel}
          </Button>
        ) : (
          <Box style={{ gap: spacing['8'] }}>
            <Button disabled size='lg' fullWidth>{outOfStockLabel}</Button>
            <Button variant='outline' size='lg' fullWidth>{notifyMeLabel}</Button>
          </Box>
        )}

        {submitError ? <Text variant='caption' tone='danger'>{submitError}</Text> : null}

        <Card
          tone='subtle'
          variant='flat'
          style={{
            gap: pdpTokens.trustCardGap,
            padding: pdpTokens.trustCardPadding,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
          }}
        >
          <Text variant='caption' weight='700' tone='muted'>
            {deliveryAssuranceLabel}
          </Text>
          {deliveryHighlights.map((item, index) => (
            <Box key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
              <Icon
                name={index === 0 ? 'shipping' : index === 1 ? 'returns' : 'secure'}
                size={spacing['16']}
                color={colors.textSecondary}
              />
              <Text variant='caption' tone='muted'>
                {item}
              </Text>
            </Box>
          ))}
          <PaymentBadges />
        </Card>
      </Card>
    )
  }

  function renderMobileStickyAddToCartBar() {
    return (
      <View style={mobileStickyStyle}>
        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['8'] }}>
          <Box style={{ gap: spacing.xxs, paddingEnd: spacing['8'] }}>
            <PriceTag price={productPrice} currency={resolvedProduct.currency} size='sm' />
            <Text variant='caption' tone='muted' numberOfLines={1}>
              {inStock ? inStockLabel : outOfStockLabel}
            </Text>
          </Box>
          <Box style={isCompact ? { flex: 1 } : { minWidth: spacing.xxl * 4 }}>
            <Button disabled={!inStock || submitting} onPress={handleAddToCart}>
              {submitting ? addingLabel : addToCartLabel}
            </Button>
          </Box>
        </Box>
        {submitError ? <Text variant='caption' tone='danger'>{submitError}</Text> : null}
      </View>
    )
  }

  return (
    <PageScaffold variant='product' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box
            style={{
              gap: pdpTokens.contentGap,
              paddingBottom: !isDesktop ? spacing['96'] : 0,
            }}
          >
      <Box style={{ flexDirection: isDesktop ? 'row' : 'column', gap: pdpTokens.contentGap, alignItems: 'flex-start' }}>
        <Box style={{ flex: isDesktop ? 5 : undefined, width: '100%' as const, gap: pdpTokens.detailsGap }}>
          <Box style={{ flexDirection: isCompact ? 'column' : 'row', gap: pdpTokens.mediaGap, width: '100%' as const }}>
            {hasThumbnailRail ? (
              <Box style={{ gap: pdpTokens.mediaGap }}>
                {imageUrls.map((uri, index) => (
                  <Touchable
                    key={`${uri}-${index}`}
                    onPress={() => setActiveImageIndex(index)}
                    style={{
                      borderWidth: borderWidth.thin,
                      borderColor: index === activeImageIndex ? colors.brandPrimary : colors.border,
                      backgroundColor: index === activeImageIndex ? colors.brandPrimarySubtle : colors.surface,
                      borderRadius: radius.xs,
                      padding: spacing.hairline,
                    }}
                  >
                    <Image
                      source={{ uri }}
                      style={{
                        width: pdpTokens.mediaThumbSize,
                        height: pdpTokens.mediaThumbSize,
                        borderRadius: radius.xs,
                        backgroundColor: colors.backgroundSecondary,
                      }}
                    />
                  </Touchable>
                ))}
              </Box>
            ) : null}
            <Box style={{ flex: 1 }}>
              <Box
                style={{
                  borderWidth: borderWidth.thin,
                  borderColor: colors.border,
                  borderRadius: radius.xs,
                  overflow: 'hidden',
                  backgroundColor: colors.backgroundSecondary,
                }}
              >
                <Image
                  source={{ uri: activeImage }}
                  style={{
                    width: '100%' as const,
                    aspectRatio: 1,
                    backgroundColor: colors.backgroundSecondary,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box style={{ gap: spacing.xs }}>
            <Text variant='caption' tone='muted'>{brand}</Text>
            <Text variant='h1'>{displayName}</Text>
            <Text tone='muted'>{productDescription}</Text>
          </Box>
        </Box>

        <Box
          style={
            isDesktop
              ? ({
                  flex: 4,
                  maxWidth: pdpTokens.purchasePanelMaxWidth,
                  position: Platform.OS === 'web' ? ('sticky' as const) : undefined,
                  top: Platform.OS === 'web' ? stickyTop : undefined,
                  width: '100%',
                } as any)
              : { width: '100%' as const }
          }
        >
          {isDesktop ? renderPurchaseActions() : null}
        </Box>
      </Box>

      {completeSetProducts.length > 0 ? (
        <Card style={{ gap: pdpTokens.detailsGap }}>
          <Text variant='h2'>{completeSetTitle}</Text>
          <Box style={{ gap: spacing['8'] }}>
            {completeSetProducts.map((setProduct) => {
              const selected = selectedSetIds.includes(setProduct.id)
              const unavailable = inferOutOfStock(setProduct)
              return (
                <Touchable
                  key={setProduct.id}
                  disabled={unavailable}
                  onPress={() => toggleSetItem(setProduct.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: pdpTokens.setRowPaddingY,
                    borderBottomWidth: borderWidth.thin,
                    borderColor: colors.border,
                    opacity: unavailable ? 0.6 : 1,
                  }}
                >
                  <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                    <Box
                      style={{
                        width: spacing.lg,
                        height: spacing.lg,
                        borderRadius: radius.xs,
                        borderWidth: borderWidth.thin,
                        borderColor: selected ? colors.brandPrimary : colors.border,
                        backgroundColor: selected ? colors.brandPrimarySubtle : colors.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selected ? <Text variant='caption' tone='primary'>✓</Text> : null}
                    </Box>
                    <Image
                      source={{ uri: setProduct.image || PLACEHOLDER_IMAGE }}
                      style={{
                        width: spacing.xxl,
                        height: spacing.xxl,
                        borderRadius: radius.xs,
                        backgroundColor: colors.backgroundSecondary,
                      }}
                    />
                    <Box style={{ flex: 1 }}>
                      <Text variant='caption' tone='muted'>{deriveBrand(setProduct.name)}</Text>
                      <Text variant='bodySm'>{deriveProductName(setProduct.name)}</Text>
                      {unavailable ? <Text variant='caption' tone='danger'>{completeSetOutOfStockLabel}</Text> : null}
                    </Box>
                  </Box>
                  <Text variant='subtitle' weight='700'>
                    {formatPrice(passThroughPricingService.getProductPrice(setProduct).unitPrice)}
                  </Text>
                </Touchable>
              )
            })}
          </Box>
          <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text tone='muted'>{selectedSubtotalLabel}</Text>
            <Text variant='subtitle' weight='700'>
              {formatPrice(completeSetSubtotal)}
            </Text>
          </Box>
        </Card>
      ) : null}

      <Card style={{ gap: spacing.md }}>
        <Box style={{ flexDirection: 'row', gap: pdpTokens.tabGap, flexWrap: 'wrap' }}>
          {[
            { key: 'description' as const, label: tabLabelDescription },
            { key: 'how_to_use' as const, label: tabLabelHowToUse },
            { key: 'ingredients' as const, label: tabLabelIngredients },
          ].map((tab) => {
            const active = tab.key === activeTab
            return (
              <Touchable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  borderBottomWidth: borderWidth.thin,
                  borderColor: active ? colors.brandPrimary : colors.border,
                  paddingBottom: pdpTokens.tabPaddingBottom,
                  marginEnd: spacing.md,
                }}
              >
                <Text tone={active ? 'primary' : 'muted'} variant='caption' weight='700'>
                  {tab.label}
                </Text>
              </Touchable>
            )
          })}
        </Box>
        <Divider tone='muted' />
        {activeTab === 'description' ? <Text>{productDescription}</Text> : null}
        {activeTab === 'how_to_use' ? <Text>{usage}</Text> : null}
        {activeTab === 'ingredients' ? <Text>{ingredients}</Text> : null}
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant='h2'>{reviewsTitleLabel}</Text>
          <Text variant='caption' tone='muted'>
            {reviewsLoading
              ? loadingLabel
              : reviews.length > 0
              ? `${averageRating.toFixed(1)} / 5 (${reviews.length})`
              : noReviewsLabel}
          </Text>
        </Box>
        <Divider tone='muted' />
        {reviewsLoading ? (
          <Card tone='subtle' style={{ minHeight: spacing.xxl * 2 }} />
        ) : reviewsError ? (
          <Box style={{ gap: spacing.xs }}>
            <Text tone='danger'>{reviewsLoadErrorLabel}</Text>
            <Text variant='caption' tone='muted'>{reviewsError}</Text>
          </Box>
        ) : reviews.length === 0 ? (
          <Text tone='muted'>{noReviewsLabel}</Text>
        ) : (
          <Box style={{ gap: spacing.md }}>
            {reviews.map((review) => (
              <Box key={review.id} style={{ gap: spacing.xs }}>
                <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text variant='subtitle' weight='700'>{review.title}</Text>
                  <Text variant='caption' tone='muted'>{`${review.rating}/5`}</Text>
                </Box>
                <Text variant='bodySm' tone='muted'>{review.body}</Text>
                <Text variant='caption' tone='muted'>
                  {`${review.author} • ${new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-US')}`}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {relatedProducts.length > 0 ? (
        <Box style={{ gap: pdpTokens.detailsGap }}>
          <Text variant='h2'>{relatedTitle}</Text>
          <HorizontalScroll contentContainerStyle={{ gap: spacing['16'] }}>
            {relatedHomeItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                density="minimal"
                width={isCompact ? pdpTokens.relatedCardWidthMobile : pdpTokens.relatedCardWidthDesktop}
                onPress={(selected) => onSelectProduct?.(selected.id)}
                onAddToCart={(selected) => onAddToCart?.(selected.id, 1)}
              />
            ))}
          </HorizontalScroll>
        </Box>
      ) : null}

      {!isDesktop ? (
        renderMobileStickyAddToCartBar()
      ) : null}
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}
