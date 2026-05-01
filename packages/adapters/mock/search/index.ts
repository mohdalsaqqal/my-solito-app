import type {
  SearchProvider,
  SearchProviderFacets,
  SearchProviderFilters,
  SearchProviderProduct,
  SearchProviderSuggestion,
  SearchProviderSort,
} from '@real/providers/contracts'
import { generatedMockProductRows } from '../product/generated-mock-erp-data'

type MockSearchProduct = SearchProviderProduct & {
  brand?: string
  category?: string
}

function normalize(input: string) {
  return input.trim().toLowerCase()
}

function extractBrand(product: MockSearchProduct) {
  if (product.brand) {
    return product.brand
  }

  const [left] = product.name.split('-')
  const candidate = (left ?? '').trim()
  return candidate || 'Brand'
}

function extractProductName(name: string) {
  const split = name.split('-')
  if (split.length < 2) {
    return name.trim()
  }
  return split.slice(1).join('-').trim()
}

function toSearchProduct(product: (typeof generatedMockProductRows)[number]): MockSearchProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    image: product.image,
    brand: product.brand,
    category: product.category,
  }
}

function buildProductSuggestions(products: MockSearchProduct[], query: string): SearchProviderSuggestion[] {
  const q = normalize(query)
  const filtered = q
    ? products.filter((product) => {
        const haystack = [product.name, product.description ?? '', extractBrand(product)]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    : products

  return filtered.slice(0, 7).map((product) => {
    return {
      id: `p-${product.id}`,
      label: product.name,
      type: 'product',
      href: `/product/${product.id}`,
      imageUrl: product.image || undefined,
      brandName: extractBrand(product),
      productName: extractProductName(product.name),
      price: product.price,
    }
  })
}

function buildBrandSuggestions(products: MockSearchProduct[], query: string): SearchProviderSuggestion[] {
  const seen = new Set<string>()
  const q = normalize(query)
  const brands: string[] = []

  for (const product of products) {
    const brand = extractBrand(product)
    const key = brand.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    if (q && !key.includes(q)) {
      continue
    }
    seen.add(key)
    brands.push(brand)
  }

  return brands.slice(0, 6).map((brand, index) => ({
    id: `b-${index}`,
    label: brand,
    type: 'brand',
    href: `/brands/${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, '-'))}`,
  }))
}

function buildTrending(products: MockSearchProduct[]) {
  const words = new Map<string, number>()

  for (const product of products) {
    for (const token of product.name.toLowerCase().split(/\s+/)) {
      const clean = token.replace(/[^a-z0-9]/g, '')
      if (clean.length < 3) {
        continue
      }
      words.set(clean, (words.get(clean) ?? 0) + 1)
    }
  }

  return Array.from(words.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)
    .slice(0, 6)
}

function buildPopularBrands(products: MockSearchProduct[]) {
  const counts = new Map<string, number>()

  for (const product of products) {
    const brand = extractBrand(product)
    counts.set(brand, (counts.get(brand) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand)
    .slice(0, 6)
}

function includesNormalized(values: string[] | undefined, candidate: string | undefined) {
  if (!values || values.length === 0) return true
  const allowed = new Set(values.map((value) => normalize(value)).filter(Boolean))
  return allowed.has(normalize(candidate ?? ''))
}

function applySearchFilters(products: MockSearchProduct[], filters?: SearchProviderFilters) {
  if (!filters) return products
  return products.filter((product) => {
    if (!includesNormalized(filters.brands, product.brand)) return false
    if (!includesNormalized(filters.categories, product.category)) return false
    if (typeof filters.minPrice === 'number' && product.price < filters.minPrice) return false
    if (typeof filters.maxPrice === 'number' && product.price > filters.maxPrice) return false
    return true
  })
}

function applySearchSort(products: MockSearchProduct[], sort?: SearchProviderSort) {
  const copy = [...products]
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'newest':
      return copy.reverse()
    case 'bestseller':
    case 'relevance':
    default:
      return copy
  }
}

function facetValues(values: Array<string | undefined>) {
  const counts = new Map<string, number>()
  for (const value of values) {
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, count }))
}

function buildFacets(products: MockSearchProduct[]): SearchProviderFacets {
  const prices = products.map((product) => product.price).filter(Number.isFinite)
  const min = prices.length > 0 ? Math.min(...prices) : 0
  const max = prices.length > 0 ? Math.max(...prices) : 0
  return {
    brands: facetValues(products.map((product) => product.brand ?? extractBrand(product))),
    categories: facetValues(products.map((product) => product.category)),
    price: { min, max },
  }
}

export const mockSearchAdapter: SearchProvider = {
  async search(input, context) {
    void context
    void input.locale
    void input.storeId

    const products = applySearchSort(
      applySearchFilters(generatedMockProductRows.map(toSearchProduct), input.filters),
      input.sort,
    )

    return {
      ok: true,
      data: {
        products,
        suggestions: [
          ...(input.query ? buildBrandSuggestions(products, input.query) : []),
          ...buildProductSuggestions(products, input.query),
        ],
        trendingSearches: buildTrending(products),
        popularBrands: buildPopularBrands(products),
        facets: buildFacets(products),
        meta: {
          totalHits: products.length,
          indexName: `mock-search-${context.tenantId}`,
        },
      },
    }
  },

  async health(context) {
    return {
      ok: true,
      data: {
        indexed: true,
        indexName: `mock-search-${context.tenantId}`,
        filterableAttributes: ['brand', 'category', 'price', 'stock'],
        sortableAttributes: ['price', 'reviews', 'createdAt'],
        typoToleranceEnabled: true,
      },
    }
  },
}
