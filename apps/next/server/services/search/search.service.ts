import { createPagePayload } from '@real/app/lib/layout/page-schema'
import { SEARCH_PAGE_SLUG, SEARCH_PAGE_TYPE } from '@real/app/lib/layout/page-types'
import type { CMSHomeBlock, SearchResult } from '@real/app/lib/types'
import { searchProvider } from '@real/providers'
import type { SearchProviderPayload, SearchProviderProduct } from '@real/providers/contracts'
import { getCachedHomeCmsResponseData } from '../home/home-cms.service'
import {
  createStorefrontServiceContextFromRequest,
  type StorefrontServiceContext,
} from '../_lib/storefront-service-context'
import { createProviderContext } from '../tenant/context'

type SearchDiscoveryResult = {
  products: SearchProviderProduct[]
  result: SearchResult
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
  tenantId: string,
): Promise<SearchDiscoveryResult> {
  const providerResult = await searchProvider.search(
    { storeId, locale, query },
    createProviderContext({ tenantId, storeId }),
  )
  if (!providerResult.ok) {
    throw new Error(providerResult.error.message)
  }

  return {
    products: providerResult.data.products,
    result: buildSearchPayload(storeId, locale, query, providerResult.data),
  }
}

function buildSearchPayload(
  storeId: string,
  locale: 'en' | 'ar',
  query: string,
  payload: SearchProviderPayload,
): SearchResult {
  const popularBrands = payload.popularBrands
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
    suggestions: payload.suggestions,
    trendingSearches: payload.trendingSearches,
    popularBrands,
  }
}

export async function getSearchPayload(
  request: Request,
  queryOverride?: string,
  productsOverride?: SearchProviderProduct[],
): Promise<SearchResult> {
  const context = createStorefrontServiceContextFromRequest(request)
  const { searchParams } = new URL(context.requestUrl)
  const query = queryOverride ?? searchParams.get('q') ?? ''
  if (productsOverride) {
    return buildSearchPayload(context.storeId, context.locale, query, {
      products: productsOverride,
      suggestions: [],
      trendingSearches: [],
      popularBrands: [],
    })
  }

  const discovery = await getCachedSearchDiscovery(context.storeId, context.locale, query, context.tenantId)
  return discovery.result
}

export async function getSearchPageInitialData(
  query: string,
  context: Pick<StorefrontServiceContext, 'locale' | 'requestUrl' | 'storeId' | 'tenantId'>,
) {
  const [discoveryResult, cmsResult] = await Promise.allSettled([
    getCachedSearchDiscovery(context.storeId, context.locale, query, context.tenantId),
    getCachedHomeCmsResponseData(context.requestUrl),
  ])

  const products = discoveryResult.status === 'fulfilled' ? discoveryResult.value.products : []
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null
  const result =
    discoveryResult.status === 'fulfilled'
      ? discoveryResult.value.result
      : buildSearchPayload(context.storeId, context.locale, query, {
          products,
          suggestions: [],
          trendingSearches: [],
          popularBrands: [],
        })

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
