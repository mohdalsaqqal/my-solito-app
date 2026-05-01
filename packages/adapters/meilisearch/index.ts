import type {
  ProviderContext,
  SearchProvider,
  SearchProviderFacets,
  SearchProviderFilters,
  SearchProviderPayload,
  SearchProviderProduct,
  SearchProviderSuggestion,
  SearchProviderSort,
} from '@real/providers/contracts'

export type MeilisearchConfig = {
  host: string
  apiKey?: string
  indexName?: string
}

type MeilisearchSearchResponse = {
  hits?: MeilisearchDocument[]
  estimatedTotalHits?: number
  processingTimeMs?: number
  facetDistribution?: Record<string, Record<string, number>>
  facetStats?: Record<string, { min?: number; max?: number }>
}

type MeilisearchSettingsResponse = {
  filterableAttributes?: string[]
  sortableAttributes?: string[]
  typoTolerance?: {
    enabled?: boolean
  }
}

type MeilisearchDocument = {
  id?: string | number
  name?: string
  title?: string
  description?: string
  price?: number
  currency?: string
  image?: string
  imageUrl?: string
  image_url?: string
  brand?: string
  brandName?: string
  brand_name?: string
  category?: string
  categoryName?: string
  category_name?: string
  stock?: number
  reviews?: number
  createdAt?: string
  href?: string
  compareAtPrice?: number
  compare_at_price?: number
  discountLabel?: string
  discount_label?: string
}

function trimTrailingSlash(input: string) {
  return input.replace(/\/+$/, '')
}

function resolveIndexName(config: MeilisearchConfig, context: ProviderContext) {
  const template = config.indexName ?? 'products'
  return template
    .replaceAll('{tenantId}', context.tenantId)
    .replaceAll('{storeId}', context.storeId ?? 'default')
}

function toNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function optionalNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function slugify(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function productName(document: MeilisearchDocument) {
  return text(document.name) || text(document.title) || String(document.id ?? '')
}

function brandName(document: MeilisearchDocument) {
  return text(document.brand) || text(document.brandName) || text(document.brand_name)
}

function toProduct(document: MeilisearchDocument): SearchProviderProduct {
  return {
    id: String(document.id ?? ''),
    name: productName(document),
    description: text(document.description) || undefined,
    price: toNumber(document.price),
    currency: text(document.currency, 'USD'),
    image: text(document.image) || text(document.imageUrl) || text(document.image_url) || undefined,
  }
}

function toProductSuggestion(document: MeilisearchDocument): SearchProviderSuggestion {
  const id = String(document.id ?? '')
  const name = productName(document)
  const brand = brandName(document)

  return {
    id: `p-${id}`,
    label: name,
    type: 'product',
    href: text(document.href) || `/product/${encodeURIComponent(id)}`,
    imageUrl: text(document.image) || text(document.imageUrl) || text(document.image_url) || undefined,
    brandName: brand || undefined,
    productName: name,
    price: toNumber(document.price),
    compareAtPrice: optionalNumber(document.compareAtPrice ?? document.compare_at_price),
    discountLabel: text(document.discountLabel) || text(document.discount_label) || undefined,
  }
}

function buildBrandSuggestions(documents: MeilisearchDocument[], query: string): SearchProviderSuggestion[] {
  const seen = new Set<string>()
  const q = query.trim().toLowerCase()
  const suggestions: SearchProviderSuggestion[] = []

  for (const document of documents) {
    const brand = brandName(document)
    const key = brand.toLowerCase()
    if (!brand || seen.has(key)) continue
    if (q && !key.includes(q)) continue
    seen.add(key)
    suggestions.push({
      id: `b-${slugify(brand)}`,
      label: brand,
      type: 'brand',
      href: `/brands/${encodeURIComponent(slugify(brand))}`,
    })
  }

  return suggestions.slice(0, 6)
}

function buildTrending(documents: MeilisearchDocument[]) {
  const counts = new Map<string, number>()
  for (const document of documents) {
    for (const token of productName(document).toLowerCase().split(/\s+/)) {
      const clean = token.replace(/[^a-z0-9]/g, '')
      if (clean.length < 3) continue
      counts.set(clean, (counts.get(clean) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)
    .slice(0, 6)
}

function buildPopularBrands(documents: MeilisearchDocument[]) {
  const counts = new Map<string, number>()
  for (const document of documents) {
    const brand = brandName(document)
    if (!brand) continue
    counts.set(brand, (counts.get(brand) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand)
    .slice(0, 6)
}

function facetValues(distribution: Record<string, number> | undefined) {
  return Object.entries(distribution ?? {})
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

function firstFacetDistribution(
  distributions: Record<string, Record<string, number>> | undefined,
  keys: string[],
) {
  for (const key of keys) {
    const value = distributions?.[key]
    if (value) return value
  }
  return undefined
}

function buildFacets(response: MeilisearchSearchResponse): SearchProviderFacets {
  const priceStats = response.facetStats?.price
  return {
    brands: facetValues(firstFacetDistribution(response.facetDistribution, ['brand', 'brandName', 'brand_name'])),
    categories: facetValues(
      firstFacetDistribution(response.facetDistribution, ['category', 'categoryName', 'category_name']),
    ),
    price:
      typeof priceStats?.min === 'number' && typeof priceStats.max === 'number'
        ? { min: priceStats.min, max: priceStats.max }
        : undefined,
  }
}

function buildPayload(
  indexName: string,
  query: string,
  response: MeilisearchSearchResponse,
): SearchProviderPayload {
  const documents = response.hits ?? []
  return {
    products: documents.map(toProduct).filter((product) => product.id && product.name),
    suggestions: [
      ...(query ? buildBrandSuggestions(documents, query) : []),
      ...documents.slice(0, 7).map(toProductSuggestion),
    ],
    trendingSearches: buildTrending(documents),
    popularBrands: buildPopularBrands(documents),
    facets: buildFacets(response),
    meta: {
      totalHits: response.estimatedTotalHits,
      processingTimeMs: response.processingTimeMs,
      indexName,
    },
  }
}

function escapeFilterValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function inFilter(attribute: string, values: string[] | undefined) {
  const clean = (values ?? []).map((value) => value.trim()).filter(Boolean)
  if (clean.length === 0) return null
  return `${attribute} IN [${clean.map((value) => `"${escapeFilterValue(value)}"`).join(', ')}]`
}

function buildFilter(filters?: SearchProviderFilters) {
  if (!filters) return undefined
  const clauses = [
    inFilter('brand', filters.brands),
    inFilter('category', filters.categories),
    typeof filters.minPrice === 'number' ? `price >= ${filters.minPrice}` : null,
    typeof filters.maxPrice === 'number' ? `price <= ${filters.maxPrice}` : null,
    filters.inStock === true ? 'stock > 0' : null,
  ].filter((clause): clause is string => Boolean(clause))

  return clauses.length > 0 ? clauses : undefined
}

function buildSort(sort?: SearchProviderSort) {
  switch (sort) {
    case 'price_asc':
      return ['price:asc']
    case 'price_desc':
      return ['price:desc']
    case 'newest':
      return ['createdAt:desc']
    case 'bestseller':
      return ['reviews:desc']
    default:
      return undefined
  }
}

export function createMeilisearchSearchAdapter(config: MeilisearchConfig): SearchProvider {
  const host = trimTrailingSlash(config.host)

  async function request(path: string, init?: RequestInit) {
    return fetch(`${host}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        ...init?.headers,
      },
    })
  }

  return {
    async search(input, context) {
      const indexName = resolveIndexName(config, context)

      try {
        const response = await request(`/indexes/${encodeURIComponent(indexName)}/search`, {
          method: 'POST',
          body: JSON.stringify({
            q: input.query,
            limit: 24,
            facets: ['brand', 'brandName', 'brand_name', 'category', 'categoryName', 'category_name', 'price'],
            filter: buildFilter(input.filters),
            sort: buildSort(input.sort),
          }),
        })

        if (!response.ok) {
          return {
            ok: false,
            error: {
              code: 'MEILISEARCH_SEARCH_FAILED',
              message: `Meilisearch returned ${response.status}.`,
            },
          }
        }

        const data = (await response.json()) as MeilisearchSearchResponse
        return { ok: true, data: buildPayload(indexName, input.query, data) }
      } catch (cause) {
        return {
          ok: false,
          error: {
            code: 'MEILISEARCH_UNAVAILABLE',
            message: cause instanceof Error ? cause.message : 'Meilisearch is unavailable.',
          },
        }
      }
    },

    async health(context) {
      try {
        const response = await request('/health')
        if (!response.ok) {
          return {
            ok: false,
            error: {
              code: 'MEILISEARCH_HEALTH_FAILED',
              message: `Meilisearch health returned ${response.status}.`,
            },
          }
        }
        const indexName = resolveIndexName(config, context)
        const settingsResponse = await request(`/indexes/${encodeURIComponent(indexName)}/settings`)
        if (!settingsResponse.ok) {
          return {
            ok: false,
            error: {
              code: 'MEILISEARCH_SETTINGS_FAILED',
              message: `Meilisearch settings returned ${settingsResponse.status}.`,
            },
          }
        }
        const settings = (await settingsResponse.json()) as MeilisearchSettingsResponse

        return {
          ok: true,
          data: {
            indexed: true,
            indexName,
            filterableAttributes: settings.filterableAttributes ?? [],
            sortableAttributes: settings.sortableAttributes ?? [],
            typoToleranceEnabled: settings.typoTolerance?.enabled !== false,
          },
        }
      } catch (cause) {
        return {
          ok: false,
          error: {
            code: 'MEILISEARCH_UNAVAILABLE',
            message: cause instanceof Error ? cause.message : 'Meilisearch is unavailable.',
          },
        }
      }
    },
  }
}

export function createMeilisearchSearchAdapterFromEnv() {
  if (process.env.USE_MEILISEARCH !== 'true') {
    return null
  }

  const host = process.env.MEILISEARCH_HOST
  if (!host) {
    return null
  }

  return createMeilisearchSearchAdapter({
    host,
    apiKey: process.env.MEILISEARCH_API_KEY,
    indexName: process.env.MEILISEARCH_PRODUCTS_INDEX,
  })
}
