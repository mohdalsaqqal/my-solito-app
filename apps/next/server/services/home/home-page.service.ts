import { getCachedHomeCmsResponseData } from './home-cms.service'
import { createInternalServiceRequest, getPublicCatalogCollections } from '../_lib/public-discovery'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getHomePageInitialData(previewToken?: string) {
  const baseRequest = new Request('http://internal.local/api/cms/home')
  const request = await createInternalServiceRequest('/api/cms/home', baseRequest, previewToken ? { previewToken } : undefined)

  const [cmsResult, publicDiscoveryData] = await Promise.allSettled([
    getCachedHomeCmsResponseData(request.url),
    getPublicCatalogCollections({
      includeProducts: true,
      includeCategories: true,
      includeBrands: true,
      preview: Boolean(previewToken),
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
