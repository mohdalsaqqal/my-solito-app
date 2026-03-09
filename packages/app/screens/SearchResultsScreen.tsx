import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import { SearchSuggestion } from '@real/app/lib/types'
import { breakpoints, layout, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, ProductCard } from '@real/ui/components'
import { HomeProductItem } from '@real/ui/components/home/types'
import { Box, Text } from '@real/ui/primitives'
import { passThroughPricingService } from '@real/app/lib/pricing'

type SearchResultsScreenProps = {
  query: string
  suggestions: SearchSuggestion[]
  loading: boolean
  error: string | null
  onReload: () => void
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
  loading,
  error,
  onReload,
  onSelectProduct,
  onAddToCart,
}: SearchResultsScreenProps) {
  const { width } = useWindowDimensions()
  const isDesktop = width >= breakpoints.desktopMin
  const safeWidth = Math.max(Math.min(width - layout.gutterX.md * 2, layout.maxWidth.commerce), spacing.xxl * 4)
  const columns = isDesktop ? 4 : 2
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

  if (!query.trim()) {
    return (
      <PageScaffold variant='commerce' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='8'>
              <Text variant='title'>Search</Text>
              <Text variant='bodySm' tone='muted'>
                Enter a product name, category, or brand.
              </Text>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (loading) {
    return (
      <PageScaffold variant='commerce' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='12'>
              <Text variant='title'>Results for "{query}"</Text>
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['16'] }}>
                {Array.from({ length: isDesktop ? 8 : 4 }, (_, idx) => (
                  <ProductCard key={`search-loading-${idx}`} state='loading' width={cardWidth} />
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
              <Text variant='title' tone='danger'>
                Unable to load search results.
              </Text>
              <Text variant='bodySm' tone='muted'>
                {error}
              </Text>
              <Box>
                <Button onPress={onReload}>Retry</Button>
              </Box>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (products.length === 0) {
    return (
      <PageScaffold variant='commerce' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='8'>
              <Text variant='title'>No results for "{query}"</Text>
              <Text variant='bodySm' tone='muted'>
                Try another keyword or browse the shop categories.
              </Text>
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
          <Box gap='12'>
            <Text variant='title'>Results for "{query}"</Text>
            <Text variant='bodySm' tone='muted'>
              {products.length} products found.
            </Text>

            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['16'] }}>
              {products.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  width={cardWidth}
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
