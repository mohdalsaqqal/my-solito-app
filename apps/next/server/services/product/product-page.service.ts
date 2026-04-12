import { cacheLife, cacheTag } from 'next/cache'
import { productProvider, reviewProvider } from '@real/providers'
import { getCachedHomeCmsResponseData } from '../home/home-cms.service'
import { getPublicCatalogCollections } from '../_lib/public-discovery'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

async function getCachedPublicProductData(productId: string) {
  'use cache'

  cacheLife('minutes')
  cacheTag('home')
  cacheTag('shop')
  cacheTag('sales')
  cacheTag('search')

  const [productResult, productsResult, reviewsResult] = await Promise.allSettled([
    productProvider.get(productId),
    getPublicCatalogCollections({ includeProducts: true }),
    reviewProvider.listByProduct(productId),
  ])

  const product =
    productResult.status === 'fulfilled' && productResult.value.ok ? productResult.value.data : null
  const products =
    productsResult.status === 'fulfilled' ? productsResult.value.products : []
  const reviews =
    reviewsResult.status === 'fulfilled' && reviewsResult.value.ok ? reviewsResult.value.data : []

  let error: string | null = null
  if (productResult.status === 'rejected') {
    error = toErrorMessage(productResult.reason, 'Unable to fetch product.')
  } else if (productResult.status === 'fulfilled' && !productResult.value.ok) {
    error = productResult.value.error.message
  } else if (productsResult.status === 'rejected') {
    error = toErrorMessage(productsResult.reason, 'Unable to fetch related products.')
  } else if (productsResult.status === 'fulfilled' && productsResult.value.error) {
    error = productsResult.value.error
  }

  let reviewsError: string | null = null
  if (reviewsResult.status === 'rejected') {
    reviewsError = toErrorMessage(reviewsResult.reason, 'Unable to load reviews.')
  } else if (reviewsResult.status === 'fulfilled' && !reviewsResult.value.ok) {
    reviewsError = reviewsResult.value.error.message
  }

  return {
    product,
    products,
    reviews,
    error,
    reviewsError,
  }
}

export async function getProductPageInitialData(
  productId: string,
  context: Pick<StorefrontServiceContext, 'previewToken' | 'requestUrl'>,
) {
  const [cmsResult, productDataResult] = await Promise.allSettled([
    getCachedHomeCmsResponseData(context.requestUrl),
    context.previewToken
      ? Promise.allSettled([
          productProvider.get(productId),
          getPublicCatalogCollections({ includeProducts: true, preview: true }),
          reviewProvider.listByProduct(productId),
        ]).then(([productResult, productsResult, reviewsResult]) => {
          const product =
            productResult.status === 'fulfilled' && productResult.value.ok ? productResult.value.data : null
          const products =
            productsResult.status === 'fulfilled' ? productsResult.value.products : []
          const reviews =
            reviewsResult.status === 'fulfilled' && reviewsResult.value.ok ? reviewsResult.value.data : []

          let error: string | null = null
          if (productResult.status === 'rejected') {
            error = toErrorMessage(productResult.reason, 'Unable to fetch product.')
          } else if (productResult.status === 'fulfilled' && !productResult.value.ok) {
            error = productResult.value.error.message
          } else if (productsResult.status === 'rejected') {
            error = toErrorMessage(productsResult.reason, 'Unable to fetch related products.')
          } else if (productsResult.status === 'fulfilled' && productsResult.value.error) {
            error = productsResult.value.error
          }

          let reviewsError: string | null = null
          if (reviewsResult.status === 'rejected') {
            reviewsError = toErrorMessage(reviewsResult.reason, 'Unable to load reviews.')
          } else if (reviewsResult.status === 'fulfilled' && !reviewsResult.value.ok) {
            reviewsError = reviewsResult.value.error.message
          }

          return {
            product,
            products,
            reviews,
            error,
            reviewsError,
          }
        })
      : getCachedPublicProductData(productId),
  ])

  const product = productDataResult.status === 'fulfilled' ? productDataResult.value.product : null
  const products = productDataResult.status === 'fulfilled' ? productDataResult.value.products : []
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null
  const reviews = productDataResult.status === 'fulfilled' ? productDataResult.value.reviews : []

  let error: string | null = null
  if (cmsResult.status === 'rejected') {
    error = toErrorMessage(cmsResult.reason, 'Unable to fetch product page data.')
  } else if (productDataResult.status === 'rejected') {
    error = toErrorMessage(productDataResult.reason, 'Unable to fetch product.')
  } else if (productDataResult.status === 'fulfilled' && productDataResult.value.error) {
    error = productDataResult.value.error
  }

  const reviewsError =
    productDataResult.status === 'fulfilled' ? productDataResult.value.reviewsError : 'Unable to load reviews.'

  return {
    product,
    products,
    cmsHome,
    reviews,
    error,
    reviewsError,
  }
}
