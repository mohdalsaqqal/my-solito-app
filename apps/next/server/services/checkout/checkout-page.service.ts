import { headers } from 'next/headers'
import { accountProvider, authProvider, cartProvider } from '@real/providers'
import type { AccountAddress } from '@real/app/lib/types'
import { getHomeCmsResponseData } from '../home/home-cms.service'
import { listProducts } from '../catalog/product-list.service'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getCheckoutPageInitialData() {
  const requestHeaders = new Headers(await headers())
  const request = new Request('http://internal.local/api/cms/home', {
    headers: requestHeaders,
  })

  const [productsResult, cartResult, cmsResult, sessionResult] = await Promise.allSettled([
    listProducts(),
    cartProvider.get(),
    getHomeCmsResponseData(request),
    authProvider.getSession(),
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
    const session = sessionResult.status === 'fulfilled' && sessionResult.value.ok ? sessionResult.value.data : null
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
