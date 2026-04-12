import { Order } from './OrderProvider'
import { AuthRole } from './AuthProvider'
import { ProviderResult } from './types'

export type AccountOverview = {
  user: {
    userId: string
    name: string
    email: string
    role: AuthRole
  }
  loyaltySummary: {
    tier: string
    points: number
    redeemableValue: number
    currency: string
  } | null
  lastOrder: Order | null
}

export type LoyaltyRedeemOption = {
  percent: number
  pointsCost: number
}

export type LoyaltyTierRule = {
  id: string
  name: string
  minPoints: number
}

export type LoyaltyRulesInput = {
  pointToCurrency?: number
  earnRatePerCurrency?: number
  tiers?: LoyaltyTierRule[]
  tierThresholds?: {
    gold?: number
    loyal?: number
  }
  redeemOptions?: LoyaltyRedeemOption[]
}

export type LoyaltyBarcode = {
  code: string
  expiresAt: string
}

export type LoyaltyTierProgress = {
  currentTierId: string
  currentTierName: string
  nextTierId: string | null
  nextTierName: string | null
  currentPoints: number
  nextTierThreshold: number | null
  pointsToNextTier: number
  progressPercent: number
}

export type LoyaltyWallet = {
  tier: string
  points: number
  redeemableValue: number
  currency: string
  expiringSoonPoints: number
  expiringSoonAt: string | null
  redeemOptions: LoyaltyRedeemOption[]
  barcode: LoyaltyBarcode
  tierProgress: LoyaltyTierProgress
}

export type AccountAddress = {
  id: string
  label: string
  city: string
  area: string
  building: string
  floor?: string
  apartment?: string
  isDefault?: boolean
}

export type AccountAddressCreateInput = {
  label: string
  city: string
  area: string
  building: string
  floor?: string
  apartment?: string
}

export type AccountAddressUpdateInput = {
  label?: string
  city?: string
  area?: string
  building?: string
  floor?: string
  apartment?: string
}

export type LoyaltyHistoryEntry = {
  id: string
  title: string
  pointsDelta: number
  createdAt: string
}

export type WishlistItem = {
  id: string
  brand?: string
  name: string
  price: number
  currency: string
  imageUrl?: string
}

export type AccountTestRecord = {
  id: string
  title: string
  createdAt: string
  status?: 'completed' | 'follow_up'
  recommendedCount: number
  purchasedCount: number
}

export type AccountTestRecommendedProduct = {
  productId: string
  brand?: string
  name: string
  price: number
  currency: string
  imageUrl?: string
  inStock?: boolean
}

export type AccountTestDetail = {
  id: string
  title: string
  createdAt: string
  status: 'completed' | 'follow_up'
  pharmacistName: string
  branchName: string
  summary: string
  notes?: string
  metrics: Array<{
    id: string
    label: string
    value: string
  }>
  recommendedProducts: AccountTestRecommendedProduct[]
}

export type AccountQr = {
  qrCode: string
}

export type AccountIntegrationProfile = {
  userId: string
  externalCustomerId?: string
  paymentCustomerId?: string
  referralProfileId?: string
  lastSyncedAt?: string
}

export interface AccountProvider {
  getOverview(user: {
    userId: string
    name: string
    email: string
    role: AuthRole
  }, loyaltyRules?: LoyaltyRulesInput): Promise<ProviderResult<AccountOverview>>
  listAddresses(userId: string): Promise<ProviderResult<AccountAddress[]>>
  getLoyaltyWallet(
    userId: string,
    role: AuthRole,
    loyaltyRules?: LoyaltyRulesInput
  ): Promise<ProviderResult<LoyaltyWallet | null>>
  listLoyaltyHistory(userId: string): Promise<ProviderResult<LoyaltyHistoryEntry[]>>
  applyOrderLoyalty(
    userId: string,
    role: AuthRole,
    input: {
      subtotal: number
      currency: string
      redeemPercent?: number
      loyaltyRules?: LoyaltyRulesInput
    }
  ): Promise<
    ProviderResult<{
      discountValue: number
      pointsSpent: number
      pointsEarned: number
      updatedWallet: LoyaltyWallet | null
      historyEntryIds: string[]
    }>
  >
  listWishlist(userId: string): Promise<ProviderResult<WishlistItem[]>>
  listTests(userId: string): Promise<ProviderResult<AccountTestRecord[]>>
  getTest(userId: string, testId: string): Promise<ProviderResult<AccountTestDetail>>
  createAddress(userId: string, input: AccountAddressCreateInput): Promise<ProviderResult<AccountAddress[]>>
  updateAddress(
    userId: string,
    addressId: string,
    input: AccountAddressUpdateInput
  ): Promise<ProviderResult<AccountAddress[]>>
  deleteAddress(userId: string, addressId: string): Promise<ProviderResult<AccountAddress[]>>
  setDefaultAddress(userId: string, addressId: string): Promise<ProviderResult<AccountAddress[]>>
  getQr(userId: string): Promise<ProviderResult<AccountQr>>
  getIntegrationProfile?(userId: string): Promise<ProviderResult<AccountIntegrationProfile>>
}
