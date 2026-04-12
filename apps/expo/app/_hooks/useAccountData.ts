import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AccountAddress,
  AccountOverview,
  AccountTestDetail,
  AccountTestRecord,
  AccountQr,
  AuthSession,
  Cart,
  LoyaltyHistoryEntry,
  LoyaltyWallet,
  OrderSummary,
  WishlistItem,
} from '@real/app/lib/types'
import type { ReferralAccountSummary } from '@real/app/lib/referral/referral-types'
import { apiClient } from '../apiClient'

type AccountTab = 'dashboard' | 'orders' | 'tests' | 'addresses' | 'loyalty' | 'wishlist' | 'settings' | 'referral'

export function useAccountData(
  session: AuthSession | null,
  setSession: (s: AuthSession | null) => void,
  setCart: (c: Cart | null) => void,
  onSignedOut: () => void,
) {
  const [accountOverview, setAccountOverview] = useState<AccountOverview | null>(null)
  const [accountAddresses, setAccountAddresses] = useState<AccountAddress[]>([])
  const [accountTests, setAccountTests] = useState<AccountTestRecord[]>([])
  const [accountWishlist, setAccountWishlist] = useState<WishlistItem[]>([])
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyHistoryEntry[]>([])
  const [loyaltyWallet, setLoyaltyWallet] = useState<LoyaltyWallet | null>(null)
  const [accountQr, setAccountQr] = useState<AccountQr | null>(null)
  const [referralSummary, setReferralSummary] = useState<ReferralAccountSummary | null>(null)
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [selectedRedeemPercent, setSelectedRedeemPercent] = useState<number | undefined>(undefined)
  const [activeAccountTab, setActiveAccountTab] = useState<AccountTab>('dashboard')

  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [hasAutoLoadedOrders, setHasAutoLoadedOrders] = useState(false)

  const [activeTestId, setActiveTestId] = useState<string | null>(null)
  const [activeTestDetail, setActiveTestDetail] = useState<AccountTestDetail | null>(null)
  const [testDetailLoading, setTestDetailLoading] = useState(false)
  const [testDetailError, setTestDetailError] = useState<string | null>(null)
  const [addingTestProductId, setAddingTestProductId] = useState<string | null>(null)
  const [addingAllTestProducts, setAddingAllTestProducts] = useState(false)

  const [hasBootstrappedAccount, setHasBootstrappedAccount] = useState(false)

  const resetAccountState = useCallback(() => {
    setAccountOverview(null)
    setAccountAddresses([])
    setAccountTests([])
    setAccountWishlist([])
    setLoyaltyHistory([])
    setLoyaltyWallet(null)
    setAccountQr(null)
    setReferralSummary(null)
    setSelectedRedeemPercent(undefined)
    setActiveAccountTab('dashboard')
    setActiveTestId(null)
    setActiveTestDetail(null)
    setTestDetailError(null)
    setTestDetailLoading(false)
    setAddingTestProductId(null)
    setAddingAllTestProducts(false)
  }, [])

  const loadAccountData = useCallback(async () => {
    setAccountLoading(true)
    setAccountError(null)
    try {
      const [overview, addresses, loyalty, wishlist, tests] = await Promise.all([
        apiClient.account.overview(),
        apiClient.account.addresses(),
        apiClient.account.loyalty(),
        apiClient.account.wishlist(),
        apiClient.account.tests(),
      ])
      setAccountOverview(overview)
      setAccountAddresses(addresses)
      setLoyaltyHistory(loyalty.history)
      setLoyaltyWallet(loyalty.wallet)
      setAccountWishlist(wishlist)
      setAccountTests(tests)
      try {
        const qr = await apiClient.account.qr()
        setAccountQr(qr)
      } catch {
        setAccountQr(null)
      }
      try {
        const referral = await apiClient.account.referral()
        setReferralSummary(referral)
      } catch {
        setReferralSummary(null)
      }
      setSelectedRedeemPercent(undefined)
    } catch (loadError) {
      setAccountError(
        loadError instanceof Error ? loadError.message : 'Unable to fetch account data.',
      )
      resetAccountState()
    } finally {
      setHasBootstrappedAccount(true)
      setAccountLoading(false)
    }
  }, [resetAccountState])

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      const result = await apiClient.orders.list()
      setOrders(result)
    } catch (loadError) {
      setOrdersError(
        loadError instanceof Error ? loadError.message : 'Unable to fetch orders.',
      )
    } finally {
      setHasAutoLoadedOrders(true)
      setOrdersLoading(false)
    }
  }, [])

  const loadTestDetail = useCallback(async (testId: string) => {
    setActiveTestId(testId)
    setActiveTestDetail(null)
    setTestDetailError(null)
    setTestDetailLoading(true)
    try {
      const detail = await apiClient.account.test(testId)
      setActiveTestDetail(detail)
    } catch (loadError) {
      setTestDetailError(
        loadError instanceof Error ? loadError.message : 'Unable to load test result.',
      )
    } finally {
      setTestDetailLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await apiClient.auth.logout()
    } finally {
      setSigningOut(false)
      setSession(null)
      setCart(null)
      resetAccountState()
      setOrders([])
      setActiveOrderId(null)
      onSignedOut()
    }
  }, [signingOut, setSession, setCart, resetAccountState, onSignedOut])

  // Bootstrap account when session changes
  useEffect(() => {
    if (!session) {
      setHasBootstrappedAccount(false)
      setHasAutoLoadedOrders(false)
      return
    }
    setHasBootstrappedAccount(false)
    setHasAutoLoadedOrders(false)
    void loadAccountData()
  }, [loadAccountData, session?.userId])

  const activeOrder = useMemo(
    () => orders.find((order) => order.id === activeOrderId) ?? null,
    [activeOrderId, orders],
  )

  const defaultAddress = useMemo(
    () => accountAddresses.find((address) => address.isDefault) ?? null,
    [accountAddresses],
  )

  return {
    // Account
    accountOverview,
    accountAddresses,
    setAccountAddresses,
    accountTests,
    accountWishlist,
    loyaltyHistory,
    loyaltyWallet,
    accountQr,
    referralSummary,
    accountLoading,
    accountError,
    signingOut,
    selectedRedeemPercent,
    setSelectedRedeemPercent,
    activeAccountTab,
    setActiveAccountTab,
    hasBootstrappedAccount,
    defaultAddress,
    loadAccountData,
    resetAccountState,
    signOut,
    // Orders
    orders,
    setOrders,
    activeOrderId,
    setActiveOrderId,
    ordersLoading,
    ordersError,
    hasAutoLoadedOrders,
    setHasAutoLoadedOrders,
    activeOrder,
    loadOrders,
    // Tests
    activeTestId,
    activeTestDetail,
    testDetailLoading,
    testDetailError,
    addingTestProductId,
    setAddingTestProductId,
    addingAllTestProducts,
    setAddingAllTestProducts,
    loadTestDetail,
  }
}
