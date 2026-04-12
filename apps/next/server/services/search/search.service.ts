import { cacheLife, cacheTag } from 'next/cache'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { createPagePayload } from '@real/app/lib/layout/page-schema'
import { SEARCH_PAGE_SLUG, SEARCH_PAGE_TYPE } from '@real/app/lib/layout/page-types'
import type { CMSHomeBlock, SearchResult } from '@real/app/lib/types'
import { resolveStoreId } from '../../../app/api/_lib/release-env'
import { resolveRequestLocale } from '../../../app/api/_lib/request-locale'
import { getCachedHomeCmsResponseData } from '../home/home-cms.service'
import { createInternalServiceRequest, getPublicCatalogCollections } from '../_lib/public-discovery'

type SearchItem = SearchResult['suggestions'][number]
type SearchDiscoveryResult = {
  products: Array<{ id: string; name: string; description?: string; price: number; currency: string; image?: string }>
  result: SearchResult
}

function normalize(input: string) {
  return input.trim().toLowerCase()
}

function extractBrand(name: string) {
  const [left] = name.split('-')
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

function buildProductSuggestions(
  products: Array<{ id: string; name: string; description?: string; price: number; currency: string; image?: string }>,
  query: string
) {
  const q = normalize(query)
  const filtered = q
    ? products.filter((product) => {
        const haystack = [product.name, product.description ?? '', extractBrand(product.name)]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    : products

  return filtered.slice(0, 7).map((product) => {
    const brandName = extractBrand(product.name)
    const resolvedPrice = passThroughPricingService.getProductPrice({
      price: product.price,
      currency: product.currency,
    })

    return {
      id: `p-${product.id}`,
      label: product.name,
      type: 'product' as const,
      href: `/product/${product.id}`,
      imageUrl: product.image || undefined,
      brandName,
      productName: extractProductName(product.name),
      price: resolvedPrice.unitPrice,
    }
  })
}

function buildBrandSuggestions(products: Array<{ name: string }>, query: string) {
  const seen = new Set<string>()
  const q = normalize(query)
  const brands: string[] = []

  for (const product of products) {
    const brand = extractBrand(product.name)
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
    type: 'brand' as const,
    href: `/brands/${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, '-'))}`,
  }))
}

function buildTrending(products: Array<{ name: string }>) {
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

function buildPopularBrands(products: Array<{ name: string }>) {
  const counts = new Map<string, number>()

  for (const product of products) {
    const brand = extractBrand(product.name)
    counts.set(brand, (counts.get(brand) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand)
    .slice(0, 6)
}

function buildSearchPageBlocks(query: string, locale: 'en' | 'ar', popularBrands: string[]): CMSHomeBlock[] {
  return [
    {
      id: 'search-promo-strip',
      type: 'promo_strip',
      text: {
        en: query ? `Search results for "${query}"` : 'Search trending products and popular brands',
        ar: query ? `نتائج البحث عن "${query}"` : 'ابحث عن المنتجات الرائجة والعلامات الشائعة',
      },
      href: '/shop',
      position: 1,
      releaseId: 'search-page',
      locale,
      textValue:
        locale === 'ar'
          ? query
            ? `نتائج البحث عن "${query}"`
            : 'ابحث عن المنتجات الرائجة والعلامات الشائعة'
          : query
            ? `Search results for "${query}"`
            : 'Search trending products and popular brands',
    },
    {
      id: 'search-top-brands',
      type: 'top_brands',
      titleEn: 'Popular brands',
      titleAr: 'العلامات الشائعة',
      items: popularBrands.map((brand, index) => ({
        id: `search-brand-${index + 1}`,
        name: brand,
        href: `/brands/${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, '-'))}`,
      })),
      position: 2,
      releaseId: 'search-page',
      locale,
      titleText: locale === 'ar' ? 'العلامات الشائعة' : 'Popular brands',
    },
  ]
}

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

async function getCachedSearchDiscovery(
  storeId: string,
  locale: 'en' | 'ar',
  query: string,
): Promise<SearchDiscoveryResult> {
  'use cache'

  cacheLife('minutes')
  cacheTag('home')
  cacheTag('shop')
  cacheTag('sales')
  cacheTag('search')

  const discovery = await getPublicCatalogCollections({ includeProducts: true })
  if (discovery.error) {
    throw new Error(discovery.error)
  }

  return {
    products: discovery.products,
    result: buildSearchPayload(storeId, locale, query, discovery.products),
  }
}

function buildSearchPayload(
  storeId: string,
  locale: 'en' | 'ar',
  query: string,
  products: Array<{ id: string; name: string; description?: string; price: number; currency: string; image?: string }>,
): SearchResult {
  const productSuggestions = buildProductSuggestions(products, query)
  const brandSuggestions = query ? buildBrandSuggestions(products, query) : []
  const suggestions: SearchItem[] = [...brandSuggestions, ...productSuggestions]
  const popularBrands = buildPopularBrands(products)
  const searchPageBlocks = buildSearchPageBlocks(query, locale, popularBrands)

  return {
    storeId,
    page: createPagePayload(storeId, {
      slug: SEARCH_PAGE_SLUG,
      pageType: SEARCH_PAGE_TYPE,
      blocks: searchPageBlocks.map((block) => ({
        id: block.id,
        type: block.type,
        position: block.position,
        props: block,
      })),
    }),
    suggestions,
    trendingSearches: buildTrending(products),
    popularBrands,
  }
}

export async function getSearchPayload(
  request: Request,
  queryOverride?: string,
  productsOverride?: Array<{ id: string; name: string; description?: string; price: number; currency: string; image?: string }>,
): Promise<SearchResult> {
  const locale = resolveRequestLocale(request)
  const storeId = resolveStoreId(request)
  const { searchParams } = new URL(request.url)
  const query = queryOverride ?? searchParams.get('q') ?? ''
  if (productsOverride) {
    return buildSearchPayload(storeId, locale, query, productsOverride)
  }

  const discovery = await getCachedSearchDiscovery(storeId, locale, query)
  return discovery.result
}

export async function getSearchPageInitialData(query: string) {
  const baseRequest = new Request('http://internal.local/api/search')
  const request = await createInternalServiceRequest('/api/search', baseRequest, query ? { q: query } : undefined)
  const locale = resolveRequestLocale(request)
  const storeId = resolveStoreId(request)

  const [discoveryResult, cmsResult] = await Promise.allSettled([
    getCachedSearchDiscovery(storeId, locale, query),
    getCachedHomeCmsResponseData(request.url),
  ])

  const products = discoveryResult.status === 'fulfilled' ? discoveryResult.value.products : []
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null
  const result =
    discoveryResult.status === 'fulfilled'
      ? discoveryResult.value.result
      : buildSearchPayload(storeId, locale, query, products)

  let error: string | null = null
  if (cmsResult.status === 'rejected') {
    error = toErrorMessage(cmsResult.reason, 'Unable to fetch search page data.')
  } else if (discoveryResult.status === 'rejected') {
    error = toErrorMessage(discoveryResult.reason, 'Unable to fetch products.')
  }

  return {
    products,
    cmsHome,
    searchResult: result,
    error,
  }
}
