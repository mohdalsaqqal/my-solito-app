import { accountProvider, cartProvider } from '@real/providers'
import type { AccountAddress } from '@real/app/lib/types'
import { getHomeCmsResponseData } from '../home/home-cms.service'
import { listProducts } from '../catalog/product-list.service'
import { createStorefrontServiceRequest, type StorefrontServiceContext } from '../_lib/storefront-service-context'
import { resolveNormalizedSessionFromRequest } from '../auth'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getCheckoutPageInitialData(
  context: Pick<StorefrontServiceContext, 'requestUrl' | 'requestHeaders'>,
) {
  const request = createStorefrontServiceRequest(context)
  const [productsResult, cartResult, cmsResult, sessionResult] = await Promise.allSettled([
    listProducts(),
    cartProvider.get(),
    getHomeCmsResponseData(request),
    resolveNormalizedSessionFromRequest(request),
  ])

  const products =
    productsResult.status === 'fulfilled' && productsResult.value.ok ? productsResult.value.data : []
  const cart =
    cartResult.status === 'fulfilled' && cartResult.value.ok ? cartResult.value.data : null
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null

  let error: string | null = null
  if (productsResult.status === 'rejected') {
    error = toErrorMessage(productsResult.reason, 'Unable to load checkout data.')
  } else if (productsResult.status === 'fulfilled' && !productsResult.value.ok) {
    error = productsResult.value.error.message
  } else if (cartResult.status === 'rejected') {
    error = toErrorMessage(cartResult.reason, 'Unable to load checkout data.')
  } else if (cartResult.status === 'fulfilled' && !cartResult.value.ok) {
    error = cartResult.value.error.message
  } else if (cmsResult.status === 'rejected') {
    error = toErrorMessage(cmsResult.reason, 'Unable to load checkout data.')
  } else if (sessionResult.status === 'rejected') {
    error = toErrorMessage(sessionResult.reason, 'Unable to load checkout data.')
  }

  let accountAddresses: AccountAddress[] = []
  let loyaltyWallet = null

  if (!error) {
    const session = sessionResult.status === 'fulfilled' ? sessionResult.value : null
    if (session) {
      const [addressesResult, loyaltyResult] = await Promise.allSettled([
        accountProvider.listAddresses(session.userId),
        accountProvider.getLoyaltyWallet(session.userId, session.role),
      ])

      accountAddresses =
        addressesResult.status === 'fulfilled' && addressesResult.value.ok ? addressesResult.value.data : []
      loyaltyWallet =
        loyaltyResult.status === 'fulfilled' && loyaltyResult.value.ok ? loyaltyResult.value.data : null
    }
  }

  return {
    products,
    cart,
    cmsHome,
    accountAddresses,
    loyaltyWallet,
    error,
  }
}
