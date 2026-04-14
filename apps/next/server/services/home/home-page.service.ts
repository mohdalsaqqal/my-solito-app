import { getCachedHomeCmsResponseData } from './home-cms.service'
import { getPublicCatalogCollections } from '../_lib/public-discovery'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getHomePageInitialData(
  context: Pick<StorefrontServiceContext, 'previewToken' | 'requestUrl'>,
) {
  const [cmsResult, publicDiscoveryData] = await Promise.allSettled([
    getCachedHomeCmsResponseData(context.requestUrl),
    getPublicCatalogCollections({
      includeProducts: true,
      includeCategories: true,
      includeBrands: true,
      preview: Boolean(context.previewToken),
    }),
  ])

  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null
  const products = publicDiscoveryData.status === 'fulfilled' ? publicDiscoveryData.value.products : []
  const categories = publicDiscoveryData.status === 'fulfilled' ? publicDiscoveryData.value.categories : []
  const brands = publicDiscoveryData.status === 'fulfilled' ? publicDiscoveryData.value.brands : []

  let error: string | null = null
  if (cmsResult.status === 'rejected') {
    error = toErrorMessage(cmsResult.reason, 'Unable to fetch homepage data.')
  } else if (publicDiscoveryData.status === 'rejected') {
    error = toErrorMessage(publicDiscoveryData.reason, 'Unable to fetch products.')
  } else if (publicDiscoveryData.status === 'fulfilled' && publicDiscoveryData.value.error) {
    error = publicDiscoveryData.value.error
  }

  return {
    products,
    cmsHome,
    categories,
    brands,
    error,
  }
}
