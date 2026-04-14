import { accountProvider, authProvider, cartProvider } from '@real/providers'
import type { AuthSession } from '@real/providers/contracts'
import type { AccountTestDetail, Cart, CMSHome, Product } from '@real/app/lib/types'
import { getHomeCmsResponseData } from '../home/home-cms.service'
import { listProducts } from '../catalog/product-list.service'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

export type AccountTestDetailPageInitialData = {
  session: AuthSession | null
  cmsHome: CMSHome | null
  products: Product[]
  cart: Cart | null
  test: AccountTestDetail | null
  error: string | null
}

function createEmptyAccountTestDetailPageData(error: string | null = null): AccountTestDetailPageInitialData {
  return {
    session: null,
    cmsHome: null,
    products: [],
    cart: null,
    test: null,
    error,
  }
}

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export async function getAccountTestDetailPageInitialData(
  testId: string,
  context: Pick<StorefrontServiceContext, 'requestUrl'>,
) {
  if (!testId) {
    return createEmptyAccountTestDetailPageData('Invalid test ID.')
  }

  const sessionResult = await authProvider.getSession()
  const session =
    sessionResult.ok ? sessionResult.data : null

  if (!session) {
    return createEmptyAccountTestDetailPageData()
  }

  const request = new Request(context.requestUrl)

  const [cmsResult, productsResult, cartResult, testResult] = await Promise.allSettled([
    getHomeCmsResponseData(request),
    listProducts(),
    cartProvider.get(),
    accountProvider.getTest(session.userId, testId),
  ])

  const error =
    cmsResult.status === 'rejected'
      ? toErrorMessage(cmsResult.reason, 'Unable to load test details.')
      : null

  return {
    session,
    cmsHome: cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null,
    products:
      productsResult.status === 'fulfilled' && productsResult.value.ok ? productsResult.value.data : [],
    cart: cartResult.status === 'fulfilled' && cartResult.value.ok ? cartResult.value.data : null,
    test: testResult.status === 'fulfilled' && testResult.value.ok ? testResult.value.data : null,
    error,
  } satisfies AccountTestDetailPageInitialData
}
