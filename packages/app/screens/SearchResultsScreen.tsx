import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import { BlockRenderer } from '@real/app/sections/blocks/BlockRenderer'
import { SearchResult, SearchSuggestion } from '@real/app/lib/types'
import { breakpoints, layout, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, MarketplacePromoStrip, MarketplaceSectionHeader, ProductCard } from '@real/ui/components'
import { HomeProductItem } from '@real/ui/components/home/types'
import { Box, Text } from '@real/ui/primitives'
import { passThroughPricingService } from '@real/app/lib/pricing'

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

export function SearchResultsScreen({
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
  const { width } = useWindowDimensions()
  const isDesktop = width >= breakpoints.desktopMin
  const safeWidth = Math.max(Math.min(width - layout.gutterX.md * 2, layout.maxWidth.commerce), spacing.xxl * 4)
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
  const emptySearchTitle = locale === 'ar' ? 'البحث' : 'Search'
  const emptySearchSubtitle =
    locale === 'ar' ? 'أدخل اسم منتج أو فئة أو علامة تجارية.' : 'Enter a product name, category, or brand.'
  const resultsTitle = locale === 'ar' ? `نتائج "${query}"` : `Results for "${query}"`
  const loadErrorTitle = locale === 'ar' ? 'تعذر تحميل نتائج البحث.' : 'Unable to load search results.'
  const retryLabel = locale === 'ar' ? 'إعادة المحاولة' : 'Retry'
  const noResultsTitle = locale === 'ar' ? `لا توجد نتائج لـ "${query}"` : `No results for "${query}"`
  const noResultsSubtitle =
    locale === 'ar' ? 'جرّب كلمة أخرى أو تصفح أقسام المتجر.' : 'Try another keyword or browse the shop categories.'
  const promoBadge = locale === 'ar' ? 'عروض البحث' : 'Search deals'
  const promoSubtitle =
    locale === 'ar' ? 'واجهة اكتشاف كثيفة بترتيب يبرز العروض أولاً' : 'Dense discovery view with offer-first ranking'
  const productsFoundTitle = locale === 'ar' ? `تم العثور على ${products.length} منتجاً` : `${products.length} products found`
  const productsFoundMeta = locale === 'ar' ? 'تصفح مستمر' : 'Continuous browse'

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
              <Text variant='h2'>{resultsTitle}</Text>
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['16'] }}>
                {Array.from({ length: isDesktop ? 8 : 4 }, (_, idx) => (
                  <ProductCard key={`search-loading-${idx}`} state='loading' density="minimal" width={cardWidth} />
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
                  item={item}
                  density="minimal"
                  width={cardWidth}
                  urgencyLabel={item.badge}
                  onPress={(next) => onSelectProduct?.(next.id)}
                  onAddToCart={(next) => onAddToCart?.(next.id)}
                />
              ))}
            </Box>
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}
