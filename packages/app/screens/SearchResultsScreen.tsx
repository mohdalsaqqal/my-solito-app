import React, { useMemo } from 'react'
import { useTranslation } from '@real/app/lib/i18n/use-translation'
import { BlockRenderer } from '@real/app/sections/blocks/BlockRenderer'
import { SearchResult, SearchSuggestion } from '@real/app/lib/types'
import { layout, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, MarketplacePromoStrip, MarketplaceSectionHeader, ProductCard, ProductCardSkeleton } from '@real/ui/components'
import type { ProductCardModel } from '@real/ui/components/ProductCard.types'
import { HomeProductItem } from '@real/ui/components/home/types'
import { Box, Text } from '@real/ui/primitives'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { useBreakpoint } from '@real/ui/responsive'

function homeProductToCardModel(item: HomeProductItem): ProductCardModel {
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: item.currency || 'USD',
    minimumFractionDigits: 2,
  })
  const formattedPrice = fmt.format(item.price)

  return {
    id: item.id,
    slug: item.id,
    href: item.href ?? `/product/${item.id}`,
    title: item.displayTitle ?? item.name,
    brand: { name: item.brand },
    image: { url: item.imageUrl ?? '', alt: item.name },
    price: { amount: item.price, currency: item.currency ?? 'USD', formatted: formattedPrice },
    compareAtPrice: item.compareAtPrice
      ? { amount: item.compareAtPrice, formatted: fmt.format(item.compareAtPrice) }
      : undefined,
    badges: item.badge ? [{ kind: 'discount' as const, label: item.badge }] : [],
    inStock: !item.outOfStock,
    requiresVariantSelection: item.requiresVariantSelection ?? false,
  }
}

type SearchResultsScreenProps = {
  query: string
  suggestions: SearchSuggestion[]
  page?: SearchResult['page']
  locale?: 'en' | 'ar'
  loading: boolean
  error: string | null
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

function toProductItem(suggestion: SearchSuggestion): HomeProductItem | null {
  if (suggestion.type !== 'product') {
    return null
  }
  if (typeof suggestion.price !== 'number') {
    return null
  }
  const resolvedPrice = passThroughPricingService.getProductPrice({
    price: suggestion.price,
    currency: 'USD',
  })
  return {
    id: suggestion.id.replace(/^p-/, ''),
    name: suggestion.productName || suggestion.label,
    brand: suggestion.brandName || 'Brand',
    price: resolvedPrice.unitPrice,
    compareAtPrice: suggestion.compareAtPrice,
    imageUrl: suggestion.imageUrl,
    href: suggestion.href,
    badge: suggestion.discountLabel,
  }
}

export const SearchResultsScreen = React.memo(function SearchResultsScreen({
  query,
  suggestions,
  page,
  locale = 'en',
  loading,
  error,
  onReload,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: SearchResultsScreenProps) {
  const { t } = useTranslation('search')
  const profile = useBreakpoint()
  const isDesktop = profile.breakpoint === 'desktop'
  const safeWidth = Math.max(Math.min(layout.maxWidth.commerce, spacing.xxl * 4), spacing.xxl * 4)
  const columns = isDesktop ? 5 : 2
  const cardWidth = Math.max(
    Math.floor((safeWidth - spacing['16'] * (columns - 1)) / columns),
    spacing.xxl * 3
  )

  const products = useMemo(
    () =>
      suggestions
        .map((suggestion) => toProductItem(suggestion))
        .filter((item): item is HomeProductItem => item !== null),
    [suggestions]
  )
  const searchPageBlocks = page?.blocks ?? []
  const emptySearchTitle = t('empty.title')
  const emptySearchSubtitle = t('empty.subtitle')
  const resultsTitle = t('results.title', { query })
  const loadErrorTitle = t('results.loadError')
  const retryLabel = t('results.retry')
  const noResultsTitle = t('results.noResults', { query })
  const noResultsSubtitle = t('results.noResultsSubtitle')
  const promoBadge = t('promo.badge')
  const promoSubtitle = t('promo.subtitle')
  const productsFoundTitle = t('results.productsFound', { count: products.length })
  const productsFoundMeta = t('results.productsFoundMeta')

  if (!query.trim()) {
    return (
      <PageScaffold variant='commerce' density='tight' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='8'>
              <Text variant='title'>{emptySearchTitle}</Text>
              <Text variant='bodySm' tone='muted'>
                {emptySearchSubtitle}
              </Text>
              <Button size='sm' onPress={() => onNavigate?.('/shop')}>{t('actions.browseShop')}</Button>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (loading) {
    return (
      <PageScaffold variant='commerce' density='tight' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='12'>
              <Text variant='h1'>{resultsTitle}</Text>
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['16'] }}>
                {Array.from({ length: isDesktop ? 8 : 4 }, (_, idx) => (
                  <ProductCardSkeleton key={`search-loading-${idx}`} width={cardWidth} />
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
      <PageScaffold variant='commerce' density='tight' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='8'>
              <Text variant='h2' tone='danger'>
                {loadErrorTitle}
              </Text>
              <Text variant='bodySm' tone='muted'>
                {error}
              </Text>
              <Box>
                <Button onPress={onReload}>{retryLabel}</Button>
              </Box>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (products.length === 0) {
    return (
      <PageScaffold variant='commerce' density='tight' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='8'>
              <Text variant='h2'>{noResultsTitle}</Text>
              <Text variant='bodySm' tone='muted'>
                {noResultsSubtitle}
              </Text>
              <Button size='sm' onPress={() => onNavigate?.('/shop')}>{t('actions.browseShop')}</Button>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  return (
    <PageScaffold variant='commerce' density='tight' scroll='auto'>
      <PageScaffold.Body>
        <Section y='tight'>
          <Box gap='8'>
            {searchPageBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                isDesktop={isDesktop}
                tickerSpeedMs={7000}
                loading={loading}
                error={error}
                locale={locale}
                onReload={onReload}
                onNavigate={onNavigate}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
            <MarketplacePromoStrip
              badge={promoBadge}
              title={resultsTitle}
              subtitle={promoSubtitle}
            />
            <MarketplaceSectionHeader
              title={productsFoundTitle}
              meta={productsFoundMeta}
            />

            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['16'] }}>
              {products.map((item) => (
                <ProductCard
                  key={item.id}
                  item={homeProductToCardModel(item)}
                  width={cardWidth}
                  onPress={() => onSelectProduct?.(item.id)}
                  onPressAdd={() => onAddToCart?.(item.id)}
                />
              ))}
            </Box>
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
})
