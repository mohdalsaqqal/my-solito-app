import type { ProviderContext, ProviderResult } from './types'

export type SearchProviderProduct = {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  image?: string
}

export type SearchProviderSuggestion = {
  id: string
  label: string
  type: 'product' | 'category' | 'brand'
  href: string
  imageUrl?: string
  brandName?: string
  productName?: string
  price?: number
  compareAtPrice?: number
  discountLabel?: string
}

export type SearchProviderInput = {
  query: string
  locale: 'en' | 'ar'
  storeId: string
  filters?: SearchProviderFilters
  sort?: SearchProviderSort
}

export type SearchProviderSort = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'bestseller'

export type SearchProviderFilters = {
  brands?: string[]
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

export type SearchProviderFacetValue = {
  value: string
  count: number
}

export type SearchProviderFacets = {
  brands: SearchProviderFacetValue[]
  categories: SearchProviderFacetValue[]
  price?: {
    min: number
    max: number
  }
}

export type SearchProviderPayload = {
  products: SearchProviderProduct[]
  suggestions: SearchProviderSuggestion[]
  trendingSearches: string[]
  popularBrands: string[]
  facets?: SearchProviderFacets
  meta?: {
    totalHits?: number
    processingTimeMs?: number
    indexName?: string
  }
}

export type SearchProvider = {
  search(input: SearchProviderInput, context: ProviderContext): Promise<ProviderResult<SearchProviderPayload>>
  health?(
    context: ProviderContext,
  ): Promise<
    ProviderResult<{
      indexed: boolean
      indexName?: string
      filterableAttributes?: string[]
      sortableAttributes?: string[]
      typoToleranceEnabled?: boolean
    }>
  >
}
