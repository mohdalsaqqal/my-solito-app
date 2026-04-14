import { cartProvider } from '@real/providers'
import { getHomeCmsResponseData } from '../home/home-cms.service'
import { listProducts } from '../catalog/product-list.service'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getCheckoutSuccessPageInitialData(
  context: Pick<StorefrontServiceContext, 'requestUrl'>,
) {
  const request = new Request(context.requestUrl)
  const [cmsResult, productsResult, cartResult] = await Promise.allSettled([
    getHomeCmsResponseData(request),
    listProducts(),
    cartProvider.get(),
  ])

  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null
  const products =
    productsResult.status === 'fulfilled' && productsResult.value.ok ? productsResult.value.data : []
  const cart =
    cartResult.status === 'fulfilled' && cartResult.value.ok ? cartResult.value.data : null

  let error: string | null = null
  if (cmsResult.status === 'rejected') {
    error = toErrorMessage(cmsResult.reason, 'Unable to load checkout confirmation.')
  } else if (productsResult.status === 'rejected') {
    error = toErrorMessage(productsResult.reason, 'Unable to load checkout confirmation.')
  } else if (productsResult.status === 'fulfilled' && !productsResult.value.ok) {
    error = productsResult.value.error.message
  } else if (cartResult.status === 'rejected') {
    error = toErrorMessage(cartResult.reason, 'Unable to load checkout confirmation.')
  } else if (cartResult.status === 'fulfilled' && !cartResult.value.ok) {
    error = cartResult.value.error.message
  }

  return {
    cmsHome,
    products,
    cart,
    error,
  }
}
