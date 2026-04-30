import {
  mockAuthAdapter,
  mockCMSAdapter,
  mockCartAdapter,
  mockOrderAdapter,
  mockProductAdapter,
  mockReviewAdapter,
  mockAccountAdapter,
  mockPharmacistAdapter,
  mockCategoryAdapter,
  mockBrandAdapter,
  mockProductQueryAdapter,
  mockMenuAdapter,
  mockReleaseAdapter,
  mockPromotionAdapter,
  mockReferralAdapter,
  crowdinTranslationAdapter,
  mockAdminProductAdapter,
  mockAdminOrderAdapter,
  mockAdminInventoryAdapter,
  mockAdminVendorAdapter,
  mockCommerceCapabilityAdapter,
  mockAdminJobAdapter,
  mockSearchAdapter,
  mockPaymentAdapter,
  mockNotificationAdapter,
} from '@real/adapters'
import { createOdooAdapters } from '@real/adapters/odoo-erp'
import { createNetworksAdapters } from '@real/adapters/payment-networks'
import { createCustomPaymentAdapterFromEnv } from '@real/adapters/custom-payment'
import { createExpoPushNotificationAdapterFromEnv } from '@real/adapters/expo-push'
import { createMeilisearchSearchAdapterFromEnv } from '@real/adapters/meilisearch'
import type { NetworksWebhookPayload } from '@real/adapters/payment-networks'

type ReadinessTier = 'development-only' | 'test-safe' | 'release-ready'
type ProviderSource = 'mock' | 'odoo' | 'networks' | 'crowdin' | 'custom-payment' | 'expo-push' | 'meilisearch'

const useMock = process.env.USE_MOCK !== 'false'
const useNetworksMock = process.env.USE_NETWORKS !== 'false'
const useCustomPaymentMock = process.env.USE_CUSTOM_PAYMENT !== 'false'
const strictReadiness = process.env.STRICT_PROVIDER_READINESS === 'true'
const appEnv = (process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development').toLowerCase()
const isReleaseLikeEnvironment = appEnv === 'production' || appEnv === 'staging'

const odooAdapters = createOdooAdapters()
const networksAdapters = createNetworksAdapters(mockOrderAdapter)
const customPaymentAdapter = createCustomPaymentAdapterFromEnv()
const expoPushAdapter = createExpoPushNotificationAdapterFromEnv()
const meilisearchSearchAdapter = createMeilisearchSearchAdapterFromEnv()

export const providerEnvironment = {
  appEnv,
  isReleaseLikeEnvironment,
  useMock,
  useNetworksMock,
  useCustomPaymentMock,
}

export const providerReadiness: Record<string, { tier: ReadinessTier; source: ProviderSource }> = {
  product: { tier: 'release-ready', source: useMock ? 'mock' : odooAdapters?.productProvider ? 'odoo' : 'mock' },
  category: { tier: 'release-ready', source: useMock ? 'mock' : odooAdapters?.categoryProvider ? 'odoo' : 'mock' },
  brand: { tier: 'release-ready', source: useMock ? 'mock' : odooAdapters?.brandProvider ? 'odoo' : 'mock' },
  order: { tier: 'release-ready', source: useNetworksMock ? 'mock' : networksAdapters?.orderProvider ? 'networks' : 'mock' },
  payment: {
    tier: 'development-only',
    source: useCustomPaymentMock ? 'mock' : customPaymentAdapter ? 'custom-payment' : 'mock',
  },
  notification: {
    tier: 'development-only',
    source: expoPushAdapter ? 'expo-push' : 'mock',
  },
  cart: { tier: 'development-only', source: 'mock' },
  auth: { tier: 'development-only', source: 'mock' },
  cms: { tier: 'development-only', source: 'mock' },
  account: { tier: 'development-only', source: 'mock' },
  pharmacist: { tier: 'development-only', source: 'mock' },
  referral: { tier: 'development-only', source: 'mock' },
  review: { tier: 'development-only', source: 'mock' },
  promotion: { tier: 'development-only', source: 'mock' },
  release: { tier: 'development-only', source: 'mock' },
  productQuery: { tier: 'development-only', source: 'mock' },
  search: {
    tier: meilisearchSearchAdapter ? 'release-ready' : 'development-only',
    source: meilisearchSearchAdapter ? 'meilisearch' : 'mock',
  },
  menu: { tier: 'development-only', source: 'mock' },
  translation: { tier: 'test-safe', source: 'crowdin' },
  adminProduct: { tier: 'development-only', source: 'mock' },
  adminOrder: { tier: 'development-only', source: 'mock' },
  adminInventory: { tier: 'development-only', source: 'mock' },
  adminVendor: { tier: 'development-only', source: 'mock' },
  commerceCapability: { tier: 'development-only', source: 'mock' },
  adminJob: { tier: 'development-only', source: 'mock' },
}

function assertProviderReadiness() {
  if (!isReleaseLikeEnvironment || !strictReadiness) return

  const requiredReleaseDomains = ['product', 'category', 'brand', 'order'] as const
  const violations = requiredReleaseDomains.filter((domain) => providerReadiness[domain].source === 'mock')
  if (violations.length > 0) {
    throw new Error(
      `Provider readiness violation: ${violations.join(', ')} are still mock-backed in ${appEnv}.`
    )
  }
}

assertProviderReadiness()

export const productProvider = useMock ? mockProductAdapter : (odooAdapters?.productProvider ?? mockProductAdapter)
export const categoryProvider = useMock ? mockCategoryAdapter : (odooAdapters?.categoryProvider ?? mockCategoryAdapter)
export const brandProvider = useMock ? mockBrandAdapter : (odooAdapters?.brandProvider ?? mockBrandAdapter)
export const orderProvider = useNetworksMock ? mockOrderAdapter : (networksAdapters?.orderProvider ?? mockOrderAdapter)
export const paymentProvider = useCustomPaymentMock ? mockPaymentAdapter : (customPaymentAdapter ?? mockPaymentAdapter)
export const notificationProvider = expoPushAdapter ?? mockNotificationAdapter

export const cartProvider = mockCartAdapter
export const authProvider = mockAuthAdapter
export const cmsProvider = mockCMSAdapter
export const reviewProvider = mockReviewAdapter
export const accountProvider = mockAccountAdapter
export const pharmacistProvider = mockPharmacistAdapter
export const productQueryProvider = mockProductQueryAdapter
export const searchProvider = meilisearchSearchAdapter ?? mockSearchAdapter
export const menuProvider = mockMenuAdapter
export const releaseProvider = mockReleaseAdapter
export const promotionProvider = mockPromotionAdapter
export const referralProvider = mockReferralAdapter
export const translationProvider = crowdinTranslationAdapter

export const adminProductProvider = mockAdminProductAdapter
export const adminOrderProvider = mockAdminOrderAdapter
export const adminInventoryProvider = mockAdminInventoryAdapter
export const adminVendorProvider = mockAdminVendorAdapter
export const commerceCapabilityProvider = mockCommerceCapabilityAdapter
export const adminJobProvider = mockAdminJobAdapter

export async function handleNetworksPaymentWebhook(
  rawBody: string,
  signature: string,
  payload: NetworksWebhookPayload,
) {
  if (!networksAdapters) {
    return null
  }

  return networksAdapters.webhookHandler(
    networksAdapters.client,
    rawBody,
    signature,
    payload,
    mockOrderAdapter,
  )
}

export type { NetworksWebhookPayload }
