import type {
  AccountAddress,
  AccountOverview,
  AccountTestDetail,
  AccountTestRecord,
  AccountQr,
  AuthSession,
  Cart,
  CMSHome,
  LoyaltyHistoryEntry,
  LoyaltyWallet,
  OrderSummary,
  Product,
  SearchSuggestion,
  WishlistItem,
} from '@real/app/lib/types'
import type { ReferralAccountSummary } from '@real/app/lib/referral/referral-types'
import type { AppLocale } from '../_hooks/useAppBootstrap'

export type ExpoView =
  | 'home'
  | 'categories'
  | 'shop'
  | 'deals'
  | 'account'
  | 'product'
  | 'checkout'
  | 'cart'
  | 'auth-login'
  | 'auth-register'
  | 'auth-forgot'
  | 'search'
  | 'orders'
  | 'order-detail'
  | 'account-test-detail'

type AccountTab = 'dashboard' | 'orders' | 'tests' | 'addresses' | 'loyalty' | 'wishlist' | 'settings' | 'referral'

type CartLine = { id: string; name: string; quantity: number; price: number; currency: string }

type CategoryTreeNode = {
  id: string
  slug: string
  name: { en: string; ar: string }
  parentId?: string
  image?: string
  isActive: boolean
  sortOrder: number
  children: CategoryTreeNode[]
}

export type AppRouterProps = {
  view: ExpoView
  setView: (v: ExpoView) => void
  locale: AppLocale
  // Storefront
  products: Product[]
  brands: Array<{ id: string; slug: string; name: { en: string; ar: string }; logo?: string; isActive: boolean }>
  categories: Array<{ id: string; slug: string; name: { en: string; ar: string }; isActive: boolean; sortOrder: number }>
  categoryTree: CategoryTreeNode[]
  cart: Cart | null
  cmsHome: CMSHome | null
  session: AuthSession | null
  setSession: (s: AuthSession | null) => void
  loading: boolean
  error: string | null
  loadProducts: () => void
  cartLines: CartLine[]
  checkoutItems: Array<{ id: string; name: string; quantity: number; price: number; currency: string; imageUrl?: string }>
  shellCategories: Array<{ id: string; label: string; href: string }>
  setCart: (cart: Cart | null) => void
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  // Account
  accountOverview: AccountOverview | null
  accountAddresses: AccountAddress[]
  setAccountAddresses: (addresses: AccountAddress[]) => void
  accountTests: AccountTestRecord[]
  accountWishlist: WishlistItem[]
  loyaltyHistory: LoyaltyHistoryEntry[]
  loyaltyWallet: LoyaltyWallet | null
  accountQr: AccountQr | null
  referralSummary: ReferralAccountSummary | null
  accountLoading: boolean
  accountError: string | null
  signingOut: boolean
  selectedRedeemPercent: number | undefined
  setSelectedRedeemPercent: (v: number | undefined) => void
  activeAccountTab: AccountTab
  setActiveAccountTab: (tab: AccountTab) => void
  hasBootstrappedAccount: boolean
  defaultAddress: AccountAddress | null
  signOut: () => Promise<void>
  // Orders
  orders: OrderSummary[]
  setOrders: (orders: OrderSummary[]) => void
  activeOrderId: string | null
  setActiveOrderId: (id: string | null) => void
  ordersLoading: boolean
  ordersError: string | null
  hasAutoLoadedOrders: boolean
  setHasAutoLoadedOrders: (v: boolean) => void
  activeOrder: OrderSummary | null
  loadOrders: () => Promise<void>
  // Tests
  activeTestId: string | null
  activeTestDetail: AccountTestDetail | null
  testDetailLoading: boolean
  testDetailError: string | null
  addingTestProductId: string | null
  setAddingTestProductId: (id: string | null) => void
  addingAllTestProducts: boolean
  setAddingAllTestProducts: (v: boolean) => void
  loadTestDetail: (testId: string) => Promise<void>
  // Search
  activeSearchQuery: string
  searchSuggestions: SearchSuggestion[]
  searchLoading: boolean
  searchError: string | null
  // Checkout
  checkoutConfig: {
    paymentMethods: {
      codEnabled?: boolean
      cardOnDeliveryEnabled?: boolean
      onlineCardEnabled?: boolean
    }
    fulfillment: {
      deliveryEnabled?: boolean
      branchPickupEnabled?: boolean
    }
    branches: Array<{
      id: string
      name: string
      city?: string
      area?: string
      building?: string
      stockCount: number
      distanceKm?: number
      payAtBranchEnabled?: boolean
      payNowEnabled?: boolean
    }>
  }
  // Navigation
  activeProductId: string | null
  setActiveProductId: (id: string | null) => void
  activeCategorySlug: string | null
  setActiveCategorySlug: (slug: string | null) => void
  activeBrandSlug: string | null
  setActiveBrandSlug: (slug: string | null) => void
}
