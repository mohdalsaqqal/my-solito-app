import { cartProvider } from '@real/providers'
import { getHomeCmsResponseData } from '../home/home-cms.service'
import { listProducts } from '../catalog/product-list.service'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getCartPageInitialData(
  context: Pick<StorefrontServiceContext, 'requestUrl'>,
) {
  const request = new Request(context.requestUrl)
  const [productsResult, cartResult, cmsResult] = await Promise.allSettled([
    listProducts(),
    cartProvider.get(),
    getHomeCmsResponseData(request),
  ])

  const products =
    productsResult.status === 'fulfilled' && productsResult.value.ok ? productsResult.value.data : []
  const cart =
    cartResult.status === 'fulfilled' && cartResult.value.ok ? cartResult.value.data : null
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null

  let error: string | null = null
  if (cartResult.status === 'rejected') {
    error = toErrorMessage(cartResult.reason, 'Unable to fetch cart.')
  } else if (cartResult.status === 'fulfilled' && !cartResult.value.ok) {
    error = cartResult.value.error.message
  } else if (cmsResult.status === 'rejected') {
    error = toErrorMessage(cmsResult.reason, 'Unable to fetch cart page data.')
  } else if (productsResult.status === 'rejected') {
    error = toErrorMessage(productsResult.reason, 'Unable to fetch products.')
  } else if (productsResult.status === 'fulfilled' && !productsResult.value.ok) {
    error = productsResult.value.error.message
  }

  return {
    products,
    cart,
    cmsHome,
    error,
  }
}
