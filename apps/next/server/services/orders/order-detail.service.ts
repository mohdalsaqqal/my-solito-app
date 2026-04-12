import { headers } from 'next/headers'
import { authProvider, cartProvider, orderProvider } from '@real/providers'
import { getCachedHomeCmsResponseData } from '../home/home-cms.service'
import { listProducts } from '../catalog/product-list.service'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getOrderDetailPageInitialData(orderId: string) {
  const requestHeaders = new Headers(await headers())
  const request = new Request('http://internal.local/api/cms/home', {
    headers: requestHeaders,
  })

  const [sessionResult, cmsResult, productsResult, cartResult, orderResult] = await Promise.allSettled([
    authProvider.getSession(),
    getCachedHomeCmsResponseData(request.url),
    listProducts(),
    cartProvider.get(),
    orderProvider.get(orderId),
  ])

  const session =
    sessionResult.status === 'fulfilled' && sessionResult.value.ok ? sessionResult.value.data : null
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null
  const products =
    productsResult.status === 'fulfilled' && productsResult.value.ok ? productsResult.value.data : []
  const cart = cartResult.status === 'fulfilled' && cartResult.value.ok ? cartResult.value.data : null
  const order =
    orderResult.status === 'fulfilled' && orderResult.value.ok ? orderResult.value.data : null

  let error: string | null = null
  if (!orderId) {
    error = 'Invalid order ID.'
  } else if (orderResult.status === 'rejected') {
    error = toErrorMessage(orderResult.reason, 'Unable to load order details.')
  } else if (orderResult.status === 'fulfilled' && !orderResult.value.ok) {
    error = orderResult.value.error.message
  } else if (cmsResult.status === 'rejected') {
    error = toErrorMessage(cmsResult.reason, 'Unable to load order details.')
  } else if (productsResult.status === 'rejected') {
    error = toErrorMessage(productsResult.reason, 'Unable to load order details.')
  } else if (cartResult.status === 'rejected') {
    error = toErrorMessage(cartResult.reason, 'Unable to load order details.')
  }

  return {
    session,
    cmsHome,
    products,
    cart,
    order,
    error,
  }
}
