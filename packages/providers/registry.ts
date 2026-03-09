import {
  mockAuthAdapter,
  mockCMSAdapter,
  strapiCMSAdapter,
  mockCartAdapter,
  mockOrderAdapter,
  mockProductAdapter,
  mockReviewAdapter,
  mockAccountAdapter,
  mockPharmacistAdapter,
  mockCategoryAdapter,
  mockBrandAdapter,
  mockProductQueryAdapter,
  mockReleaseAdapter,
  mockPromotionAdapter,
  crowdinTranslationAdapter,
} from '@real/adapters'

const useMock = (globalThis as { process?: { env?: { USE_MOCK?: string } } }).process?.env?.USE_MOCK !== 'false'
const useTranslationMock =
  (globalThis as { process?: { env?: { USE_TRANSLATION_MOCK?: string } } }).process?.env?.USE_TRANSLATION_MOCK ===
  'true'

export const productProvider = useMock ? mockProductAdapter : mockProductAdapter
export const cartProvider = useMock ? mockCartAdapter : mockCartAdapter
export const orderProvider = useMock ? mockOrderAdapter : mockOrderAdapter
export const authProvider = useMock ? mockAuthAdapter : mockAuthAdapter
export const cmsProvider = useMock ? mockCMSAdapter : strapiCMSAdapter
export const reviewProvider = useMock ? mockReviewAdapter : mockReviewAdapter
export const accountProvider = useMock ? mockAccountAdapter : mockAccountAdapter
export const pharmacistProvider = useMock ? mockPharmacistAdapter : mockPharmacistAdapter
export const categoryProvider = useMock ? mockCategoryAdapter : mockCategoryAdapter
export const brandProvider = useMock ? mockBrandAdapter : mockBrandAdapter
export const productQueryProvider = useMock ? mockProductQueryAdapter : mockProductQueryAdapter
export const releaseProvider = useMock ? mockReleaseAdapter : mockReleaseAdapter
export const promotionProvider = useMock ? mockPromotionAdapter : mockPromotionAdapter
export const translationProvider = useTranslationMock
  ? crowdinTranslationAdapter
  : crowdinTranslationAdapter
