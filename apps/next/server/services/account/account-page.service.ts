import {
  accountProvider,
  cartProvider,
  orderProvider,
} from '@real/providers'
import { buildReferralAccountSummary, DEFAULT_STORE_ID } from '@real/app/lib/referral/referral-schema'
import {
  getReferralProfileByIdentity,
  listReferralLedgerEntriesByProfile,
  readReferralProgramSettings,
} from '../referral'
import { getHomeCmsResponseData } from '../home/home-cms.service'
import { listProducts } from '../catalog/product-list.service'
import type { AuthSession } from '@real/providers/contracts'
import type {
  AccountAddress,
  AccountOverview,
  AccountQr,
  AccountTestRecord,
  Cart,
  CMSHome,
  LoyaltyHistoryEntry,
  LoyaltyWallet,
  OrderSummary,
  Product,
  WishlistItem,
} from '@real/app/lib/types'
import type { ReferralAccountSummary } from '@real/app/lib/referral/referral-types'
import { createStorefrontServiceRequest, type StorefrontServiceContext } from '../_lib/storefront-service-context'
import { resolveNormalizedSessionFromRequest } from '../auth'

function toErrorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback
}

export type AccountPageInitialData = {
  session: AuthSession | null
  cmsHome: CMSHome | null
  products: Product[]
  cart: Cart | null
  orders: OrderSummary[]
  overview: AccountOverview | null
  addresses: AccountAddress[]
  loyaltyHistory: LoyaltyHistoryEntry[]
  loyaltyWallet: LoyaltyWallet | null
  wishlist: WishlistItem[]
  tests: AccountTestRecord[]
  accountQr: AccountQr | null
  referralSummary: ReferralAccountSummary | null
  error: string | null
}

export async function getAccountPageInitialData(
  context: Pick<StorefrontServiceContext, 'requestUrl' | 'requestHeaders'>,
) {
  const request = createStorefrontServiceRequest(context)
  const [sessionResult, cmsResult, productsResult, cartResult] = await Promise.allSettled([
    resolveNormalizedSessionFromRequest(request),
    getHomeCmsResponseData(request),
    listProducts(),
    cartProvider.get(),
  ])

  const session =
    sessionResult.status === 'fulfilled' ? sessionResult.value : null
  if (!session) {
    return {
      session: null,
      cmsHome: null,
      products: [],
      cart: null,
      orders: [],
      overview: null,
      addresses: [],
      loyaltyHistory: [],
      loyaltyWallet: null,
      wishlist: [],
      tests: [],
      accountQr: null,
      referralSummary: null,
      error: null,
    } satisfies AccountPageInitialData
  }

  const [
    ordersResult,
    overviewResult,
    addressesResult,
    loyaltyResult,
    loyaltyHistoryResult,
    wishlistResult,
    testsResult,
    qrResult,
    referralProfileResult,
    referralProgramResult,
  ] = await Promise.allSettled([
    orderProvider.list(),
    accountProvider.getOverview(session),
    accountProvider.listAddresses(session.userId),
    accountProvider.getLoyaltyWallet(session.userId, session.role),
    accountProvider.listLoyaltyHistory(session.userId),
    accountProvider.listWishlist(session.userId),
    accountProvider.listTests(session.userId),
    accountProvider.getQr(session.userId),
    getReferralProfileByIdentity({ userId: session.userId, email: session.email }, DEFAULT_STORE_ID),
    readReferralProgramSettings(DEFAULT_STORE_ID),
  ])

  const referralSummary =
    referralProgramResult.status === 'fulfilled' &&
    referralProfileResult.status === 'fulfilled' &&
    referralProgramResult.value &&
    referralProfileResult.value
      ? buildReferralAccountSummary({
          program: referralProgramResult.value,
          profile: referralProfileResult.value,
          entries: await listReferralLedgerEntriesByProfile(referralProfileResult.value.id, DEFAULT_STORE_ID),
        })
      : null

  const error =
    cmsResult.status === 'rejected'
      ? toErrorMessage(cmsResult.reason, 'Unable to load account data.')
      : null

  return {
    session,
    cmsHome: cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null,
    products:
      productsResult.status === 'fulfilled' && productsResult.value.ok ? productsResult.value.data : [],
    cart: cartResult.status === 'fulfilled' && cartResult.value.ok ? cartResult.value.data : null,
    orders:
      ordersResult.status === 'fulfilled' && ordersResult.value.ok ? ordersResult.value.data : [],
    overview:
      overviewResult.status === 'fulfilled' && overviewResult.value.ok ? overviewResult.value.data : null,
    addresses:
      addressesResult.status === 'fulfilled' && addressesResult.value.ok ? addressesResult.value.data : [],
    loyaltyHistory:
      loyaltyHistoryResult.status === 'fulfilled' && loyaltyHistoryResult.value.ok
        ? loyaltyHistoryResult.value.data
        : [],
    loyaltyWallet:
      loyaltyResult.status === 'fulfilled' && loyaltyResult.value.ok ? loyaltyResult.value.data : null,
    wishlist:
      wishlistResult.status === 'fulfilled' && wishlistResult.value.ok ? wishlistResult.value.data : [],
    tests:
      testsResult.status === 'fulfilled' && testsResult.value.ok ? testsResult.value.data : [],
    accountQr: qrResult.status === 'fulfilled' && qrResult.value.ok ? qrResult.value.data : null,
    referralSummary,
    error,
  } satisfies AccountPageInitialData
}
