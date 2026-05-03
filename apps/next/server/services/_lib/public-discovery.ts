import { headers } from 'next/headers'
import { brandProvider, categoryProvider } from '@real/providers'
import { listProducts } from '../catalog/product-list.service'

type PublicCatalogOptions = {
  includeProducts?: boolean
  includeCategories?: boolean
  includeBrands?: boolean
  preview?: boolean
}

export async function createInternalServiceRequest(
  pathname: string,
  request: Request,
  searchParams?: Record<string, string | undefined>,
) {
  const requestHeaders = new Headers(await headers())
  const url = new URL(`http://internal.local${pathname}`)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined) continue
      url.searchParams.set(key, value)
    }
  }

  return new Request(url, {
    headers: requestHeaders,
    method: request.method,
  })
}

function getCachedPublicCatalogCollections(options: PublicCatalogOptions) {
  return getPublicCatalogCollectionsCore(options)
}

async function getPublicCatalogCollectionsCore(options: PublicCatalogOptions) {
  const [productsResult, categoriesResult, brandsResult] = await Promise.allSettled([
    options.includeProducts ? listProducts() : Promise.resolve({ ok: true, data: [] }),
    options.includeCategories ? categoryProvider.list() : Promise.resolve({ ok: true, data: [] }),
    options.includeBrands ? brandProvider.list() : Promise.resolve({ ok: true, data: [] }),
  ])

  const products =
    productsResult.status === 'fulfilled' && productsResult.value.ok ? productsResult.value.data : []
  const categories =
    categoriesResult.status === 'fulfilled' && categoriesResult.value.ok ? categoriesResult.value.data : []
  const brands =
    brandsResult.status === 'fulfilled' && brandsResult.value.ok ? brandsResult.value.data : []

  const error =
    options.includeProducts && productsResult.status === 'rejected'
      ? productsResult.reason instanceof Error
        ? productsResult.reason.message
        : 'Unable to fetch products.'
      : options.includeProducts && productsResult.status === 'fulfilled' && !productsResult.value.ok
        ? 'Unable to fetch products.'
        : null

  return {
    products,
    categories,
    brands,
    error,
  }
}

export async function getPublicCatalogCollections(options: PublicCatalogOptions = {}) {
  if (options.preview) {
    return getPublicCatalogCollectionsCore(options)
  }

  return getCachedPublicCatalogCollections(options)
}
