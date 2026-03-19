import { useCallback, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import {
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
import { spacing } from '@real/tokens'
import { Box, Drawer, Text, Touchable } from '@real/ui'
import {
  Layout,
  defaultBottomNavItems,
  defaultBrandItems,
  defaultCategories as defaultShellCategories,
  defaultFooterLinks,
  defaultSalesItems,
  defaultShellContent,
  defaultSocialLinks,
} from '@real/app/features/shell'
import { AccountScreen } from '@real/app/screens/AccountScreen'
import { AccountTestDetailScreen } from '@real/app/screens/AccountTestDetailScreen'
import { AuthForgotPasswordScreen } from '@real/app/screens/AuthForgotPasswordScreen'
import { AuthLoginScreen } from '@real/app/screens/AuthLoginScreen'
import { AuthRegisterScreen } from '@real/app/screens/AuthRegisterScreen'
import { CartScreen } from '@real/app/screens/CartScreen'
import { CheckoutScreen } from '@real/app/screens/CheckoutScreen'
import { HomeV2Screen } from '@real/app/screens/HomeV2Screen'
import { OrderDetailScreen } from '@real/app/screens/OrderDetailScreen'
import { OrdersScreen } from '@real/app/screens/OrdersScreen'
import { ProductScreen } from '@real/app/screens/ProductScreen'
import { SearchResultsScreen } from '@real/app/screens/SearchResultsScreen'
import { ShopScreen } from '@real/app/screens/ShopScreen'
import { apiClient } from './apiClient'
import { passThroughPricingService } from '@real/app/lib/pricing'
import {
  resolveDirection,
  syncNativeRtlDirection,
} from '@real/app/lib/rtl-manager'
import { getCurrentLocale, initI18n, setCurrentLocale } from '@real/app/lib/i18n/client'
import { useFonts } from 'expo-font'
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins'
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo'

const LOCALE_STORAGE_KEY = 'rc_locale'
const initialLocale = getCurrentLocale()
const REQUIRE_AUTH_FOR_CHECKOUT = false

syncNativeRtlDirection(initialLocale)

type ExpoView =
  | 'home'
  | 'categories'
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

type AccountTab = 'dashboard' | 'orders' | 'tests' | 'addresses' | 'loyalty' | 'wishlist' | 'settings'

export default function HomeRoute() {
  const insets = useSafeAreaInsets()
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  })
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<
    Array<{
      id: string
      slug: string
      name: { en: string; ar: string }
      logo?: string
      description?: { en: string; ar: string }
      isActive: boolean
    }>
  >([])
  const [categories, setCategories] = useState<
    Array<{
      id: string
      slug: string
      name: { en: string; ar: string }
      parentId?: string
      image?: string
      isActive: boolean
      sortOrder: number
    }>
  >([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localeState, setLocaleState] = useState<'en' | 'ar'>(initialLocale)
  const [view, setView] = useState<ExpoView>('home')
  const [moreOpen, setMoreOpen] = useState(false)
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [accountOverview, setAccountOverview] = useState<AccountOverview | null>(null)
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyHistoryEntry[]>([])
  const [accountAddresses, setAccountAddresses] = useState<AccountAddress[]>([])
  const [accountTests, setAccountTests] = useState<AccountTestRecord[]>([])
  const [activeAccountTab, setActiveAccountTab] = useState<AccountTab>('dashboard')
  const [activeTestId, setActiveTestId] = useState<string | null>(null)
  const [activeTestDetail, setActiveTestDetail] = useState<AccountTestDetail | null>(null)
  const [testDetailLoading, setTestDetailLoading] = useState(false)
  const [testDetailError, setTestDetailError] = useState<string | null>(null)
  const [addingTestProductId, setAddingTestProductId] = useState<string | null>(null)
  const [addingAllTestProducts, setAddingAllTestProducts] = useState(false)
  const [accountWishlist, setAccountWishlist] = useState<WishlistItem[]>([])
  const [loyaltyWallet, setLoyaltyWallet] = useState<LoyaltyWallet | null>(null)
  const [accountQr, setAccountQr] = useState<AccountQr | null>(null)
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [selectedRedeemPercent, setSelectedRedeemPercent] = useState<number | undefined>(undefined)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [hasBootstrappedAccount, setHasBootstrappedAccount] = useState(false)
  const [hasAutoLoadedOrders, setHasAutoLoadedOrders] = useState(false)
  const dir = resolveDirection(localeState)

  const applyLocale = useCallback(async (nextLocale: 'en' | 'ar') => {
    setCurrentLocale(nextLocale)
    await initI18n(nextLocale)
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    syncNativeRtlDirection(nextLocale)
  }, [])

  const resetAccountState = useCallback(() => {
    setAccountOverview(null)
    setAccountAddresses([])
    setAccountTests([])
    setAccountWishlist([])
    setLoyaltyHistory([])
    setLoyaltyWallet(null)
    setAccountQr(null)
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
      setSelectedRedeemPercent(undefined)
    } catch (loadError) {
      setAccountError(loadError instanceof Error ? loadError.message : 'Unable to fetch account data.')
      resetAccountState()
    } finally {
      setHasBootstrappedAccount(true)
      setAccountLoading(false)
    }
  }, [resetAccountState])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsResult, cartResult, cmsResult, categoriesResult, brandsResult, sessionResult] = await Promise.allSettled([
        apiClient.products.list(),
        apiClient.cart.get(),
        apiClient.cms.home(),
        apiClient.catalog.categories(),
        apiClient.catalog.brands(),
        apiClient.auth.session().catch(() => null),
      ])

      if (productsResult.status === 'fulfilled') setProducts(productsResult.value)
      if (cartResult.status === 'fulfilled') setCart(cartResult.value)
      if (cmsResult.status === 'fulfilled') setCmsHome(cmsResult.value)
      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value)
      if (brandsResult.status === 'fulfilled') setBrands(brandsResult.value)

      const nextSession =
        sessionResult.status === 'fulfilled'
          ? sessionResult.value
          : null
      setSession(nextSession)
      if (!nextSession) {
        resetAccountState()
      }

      const criticalFailure = [productsResult, cmsResult].find((result) => result.status === 'rejected')
      if (criticalFailure && criticalFailure.status === 'rejected') {
        const reason = criticalFailure.reason
        setError(reason instanceof Error ? reason.message : 'Unable to fetch homepage data.')
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to fetch products.')
    } finally {
      setLoading(false)
    }
  }, [resetAccountState])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  useEffect(() => {
    let active = true

    const hydrateLocale = async () => {
      const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      if (!active || (stored !== 'en' && stored !== 'ar')) {
        await initI18n(localeState)
        return
      }
      if (stored !== localeState) {
        setLocaleState(stored)
      }
      await applyLocale(stored)
    }

    void hydrateLocale()

    return () => {
      active = false
    }
  }, [applyLocale, localeState])

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

  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId) ?? products[0] ?? null,
    [activeProductId, products]
  )

  const checkoutItems = useMemo(
    () =>
      (cart?.items ?? []).flatMap((line) => {
        const product = products.find((item) => item.id === line.productId)
        if (!product) {
          return []
        }
        const resolvedPrice = passThroughPricingService.getProductPrice(product, { quantity: line.quantity })
        return [
          {
            id: product.id,
            name: product.name,
            quantity: line.quantity,
            price: resolvedPrice.unitPrice,
            currency: product.currency,
            imageUrl: product.image,
          },
        ]
      }),
    [cart, products]
  )

  const cartLines = useMemo(
    () =>
      (cart?.items ?? [])
        .map((line) => {
          const product = products.find((item) => item.id === line.productId)
          if (!product) return null
          const resolvedPrice = passThroughPricingService.getProductPrice(product, { quantity: line.quantity })
          return {
            id: line.productId,
            name: product.name,
            quantity: line.quantity,
            price: resolvedPrice.unitPrice,
            currency: product.currency,
          }
        })
        .filter((line): line is { id: string; name: string; quantity: number; price: number; currency: string } => Boolean(line)),
    [cart, products]
  )

  const cartCount = useMemo(
    () => (cart?.items ?? []).reduce((sum, line) => sum + line.quantity, 0),
    [cart]
  )
  const cartSubtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cartLines]
  )

  const shellCategories = useMemo(() => {
    if (categories.length === 0) {
      return defaultShellCategories
    }

    return categories
      .filter((category) => category.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        id: category.id,
        label: category.name[localeState],
        href: `/shop?category=${encodeURIComponent(category.slug)}`,
      }))
  }, [categories, localeState])

  const activeOrder = useMemo(
    () => orders.find((order) => order.id === activeOrderId) ?? null,
    [activeOrderId, orders]
  )

  const defaultAddress = accountAddresses.find((address) => address.isDefault) ?? null

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      const result = await apiClient.orders.list()
      setOrders(result)
    } catch (loadError) {
      setOrdersError(loadError instanceof Error ? loadError.message : 'Unable to fetch orders.')
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
      setTestDetailError(loadError instanceof Error ? loadError.message : 'Unable to load test result.')
    } finally {
      setTestDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (
      session &&
      (view === 'account' || view === 'orders') &&
      !ordersLoading &&
      orders.length === 0 &&
      !hasAutoLoadedOrders
    ) {
      void loadOrders()
    }
  }, [hasAutoLoadedOrders, loadOrders, orders.length, ordersLoading, session, view])

  const loadSearch = useCallback(async (query: string) => {
    const normalized = query.trim()
    if (!normalized) {
      setSearchSuggestions([])
      setSearchError(null)
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    setSearchError(null)
    try {
      const result = await apiClient.search.query(normalized)
      setSearchSuggestions(result.suggestions)
    } catch (loadError) {
      setSearchError(loadError instanceof Error ? loadError.message : 'Unable to fetch search results.')
      setSearchSuggestions([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const renderScreen = () => {
    if (view === 'categories') {
      return (
        <ShopScreen
          products={products}
          loading={loading}
          error={error}
          bannerTitle={cmsHome?.identity?.customer?.shopBanner?.title?.[localeState]}
          bannerSubtitle={cmsHome?.identity?.customer?.shopBanner?.subtitle?.[localeState]}
          onReload={loadProducts}
          onSelectProduct={(id) => {
            setActiveProductId(id)
            setView('product')
          }}
          onAddToCart={async (id) => {
            const nextCart = await apiClient.cart.add(id, 1)
            setCart(nextCart)
          }}
        />
      )
    }

    if (view === 'deals') {
      return (
        <ShopScreen
          products={products}
          loading={loading}
          error={error}
          bannerTitle={localeState === 'ar' ? 'عروض محدودة' : 'Limited Time Sales'}
          bannerSubtitle={
            localeState === 'ar'
              ? 'منتجات مميزة بأسعار لفترة محدودة.'
              : 'Selected premium products at limited-time prices.'
          }
          onReload={loadProducts}
          onSelectProduct={(id) => {
            setActiveProductId(id)
            setView('product')
          }}
          onAddToCart={async (id) => {
            const nextCart = await apiClient.cart.add(id, 1)
            setCart(nextCart)
          }}
        />
      )
    }

    if (view === 'search') {
      return (
        <SearchResultsScreen
          query={activeSearchQuery}
          suggestions={searchSuggestions}
          loading={searchLoading}
          error={searchError}
          onReload={() => {
            void loadSearch(activeSearchQuery)
          }}
          onSelectProduct={(id) => {
            setActiveProductId(id)
            setView('product')
          }}
          onAddToCart={async (id) => {
            const nextCart = await apiClient.cart.add(id, 1)
            setCart(nextCart)
          }}
        />
      )
    }

    if (view === 'cart') {
      return (
        <CartScreen
          items={cartLines.map((line) => ({
            productId: line.id,
            name: line.name,
            quantity: line.quantity,
            price: line.price,
            currency: line.currency,
          }))}
          loading={loading}
          error={error}
          onRetry={loadProducts}
          onCheckout={() => {
            if (REQUIRE_AUTH_FOR_CHECKOUT && !session) {
              setView('auth-login')
              return
            }
            setView('checkout')
          }}
          onIncrease={async (productId, quantity) => {
            const nextCart = await apiClient.cart.setQuantity(productId, quantity + 1)
            setCart(nextCart)
          }}
          onDecrease={async (productId, quantity) => {
            const nextCart = await apiClient.cart.setQuantity(productId, Math.max(0, quantity - 1))
            setCart(nextCart)
          }}
          onRemove={async (productId) => {
            const nextCart = await apiClient.cart.remove(productId)
            setCart(nextCart)
          }}
        />
      )
    }

    if (view === 'account') {
      if (!session) {
        return (
          <AuthLoginScreen
            onSubmit={async (input) => {
              const nextSession = await apiClient.auth.login(input)
              setSession(nextSession)
              setView('account')
            }}
            onGoToRegister={() => setView('auth-register')}
            onGoToForgotPassword={() => setView('auth-forgot')}
          />
        )
      }

      return (
        <AccountScreen
          initialTab={activeAccountTab}
          onTabChange={(tab) => {
            setActiveAccountTab(tab)
            if (tab === 'orders' && !ordersLoading) {
              void loadOrders()
            }
          }}
          customerName={session.name}
          customerEmail={session.email}
          userQrCode={accountQr?.qrCode}
          promoTitle={cmsHome?.identity?.customer?.accountPromo?.title?.[localeState]}
          promoSubtitle={cmsHome?.identity?.customer?.accountPromo?.subtitle?.[localeState]}
          orders={orders}
          addresses={accountAddresses}
          loyalty={accountOverview?.loyaltySummary ?? null}
          loyaltyWallet={loyaltyWallet}
          loyaltyHistory={loyaltyHistory}
          wishlist={accountWishlist}
          tests={accountTests}
          loading={!hasBootstrappedAccount || ordersLoading || accountLoading}
          error={ordersError ?? accountError}
          signingOut={signingOut}
          onSignOut={async () => {
            if (signingOut) {
              return
            }
            setSigningOut(true)
            try {
              await apiClient.auth.logout()
            } finally {
              setSigningOut(false)
              setSession(null)
              resetAccountState()
              setOrders([])
              setActiveOrderId(null)
              setView('home')
            }
          }}
          onSelectOrder={(orderId) => {
            setActiveOrderId(orderId)
            setView('order-detail')
          }}
          onSelectTest={(testId) => {
            setActiveAccountTab('tests')
            setView('account-test-detail')
            void loadTestDetail(testId)
          }}
          onOpenWishlistItem={(id) => {
            setActiveProductId(id)
            setView('product')
          }}
          onAddWishlistItemToCart={async (id) => {
            const nextCart = await apiClient.cart.add(id, 1)
            setCart(nextCart)
          }}
          onAddAddress={async (input) => {
            const next = await apiClient.account.createAddress(input)
            setAccountAddresses(next)
          }}
          onEditAddress={async (id, input) => {
            const next = await apiClient.account.updateAddress(id, input)
            setAccountAddresses(next)
          }}
          onRemoveAddress={async (id) => {
            const next = await apiClient.account.deleteAddress(id)
            setAccountAddresses(next)
          }}
          onSetDefaultAddress={async (id) => {
            const next = await apiClient.account.setDefaultAddress(id)
            setAccountAddresses(next)
          }}
        />
      )
    }

    if (view === 'orders') {
      return (
        <OrdersScreen
          orders={orders}
          loading={ordersLoading}
          error={ordersError}
          onReload={() => {
            void loadOrders()
          }}
          onSelectOrder={(orderId) => {
            setActiveOrderId(orderId)
            setView('order-detail')
          }}
        />
      )
    }

    if (view === 'order-detail') {
      return (
        <OrderDetailScreen
          order={activeOrder}
          loading={ordersLoading}
          error={ordersError}
          onBack={() => setView('orders')}
          onReload={() => {
            void loadOrders()
          }}
        />
      )
    }

    if (view === 'account-test-detail') {
      const cartProductIds = new Set((cart?.items ?? []).map((item) => item.productId))
      return (
        <AccountTestDetailScreen
          test={activeTestDetail}
          loading={testDetailLoading}
          error={testDetailError}
          addingProductId={addingTestProductId}
          addingAll={addingAllTestProducts}
          cartProductIds={cartProductIds}
          onBack={() => {
            setActiveAccountTab('tests')
            setView('account')
          }}
          onReload={() => {
            if (!activeTestId) return
            void loadTestDetail(activeTestId)
          }}
          onAddProduct={(productId) => {
            setAddingTestProductId(productId)
            void apiClient.cart
              .add(productId, 1)
              .then((nextCart) => {
                setCart(nextCart)
              })
              .finally(() => {
                setAddingTestProductId(null)
              })
          }}
          onAddAll={() => {
            const productIds = (activeTestDetail?.recommendedProducts ?? [])
              .filter((item) => item.inStock !== false)
              .map((item) => item.productId)
            if (productIds.length === 0) {
              return
            }
            setAddingAllTestProducts(true)
            void (async () => {
              let nextCart = cart
              for (const productId of productIds) {
                nextCart = await apiClient.cart.add(productId, 1)
              }
              if (nextCart) {
                setCart(nextCart)
              }
            })().finally(() => {
              setAddingAllTestProducts(false)
            })
          }}
          onViewProduct={(productId) => {
            setActiveProductId(productId)
            setView('product')
          }}
        />
      )
    }

    if (view === 'auth-login') {
      return (
        <AuthLoginScreen
          onSubmit={async (input) => {
            const nextSession = await apiClient.auth.login(input)
            setSession(nextSession)
            setView('account')
          }}
          onGoToRegister={() => setView('auth-register')}
          onGoToForgotPassword={() => setView('auth-forgot')}
        />
      )
    }

    if (view === 'auth-register') {
      return (
        <AuthRegisterScreen
          onSubmit={async (input) => {
            const nextSession = await apiClient.auth.register(input)
            setSession(nextSession)
            setView('account')
          }}
          onGoToLogin={() => setView('auth-login')}
        />
      )
    }

    if (view === 'auth-forgot') {
      return (
        <AuthForgotPasswordScreen
          onSubmit={async (input) => {
            await apiClient.auth.requestReset(input)
          }}
          onGoToLogin={() => setView('auth-login')}
        />
      )
    }

    if (view === 'product') {
      return (
        <ProductScreen
          product={activeProduct}
          products={products}
          loading={loading}
          error={error}
          onReload={loadProducts}
          onAddToCart={async (id, quantity) => {
            const nextCart = await apiClient.cart.add(id, quantity)
            setCart(nextCart)
            if (REQUIRE_AUTH_FOR_CHECKOUT && !session) {
              setView('auth-login')
              return
            }
            setView('cart')
          }}
        />
      )
    }

    if (view === 'checkout') {
      return (
        <CheckoutScreen
          items={checkoutItems}
          savedAddresses={accountAddresses}
          initialAddress={
            defaultAddress
              ? {
                  label: defaultAddress.label,
                  city: defaultAddress.city,
                  area: defaultAddress.area,
                  building: defaultAddress.building,
                  floor: defaultAddress.floor,
                  apartment: defaultAddress.apartment,
                }
              : null
          }
          loyaltyWallet={loyaltyWallet}
          selectedRedeemPercent={selectedRedeemPercent}
          onSelectRedeemPercent={setSelectedRedeemPercent}
          notice={cmsHome?.identity?.customer?.checkoutNotice?.[localeState]}
          checkoutConfig={{
            paymentMethods: {
              codEnabled: cmsHome?.identity?.customer?.checkout?.paymentMethods?.codEnabled,
              cardOnDeliveryEnabled:
                cmsHome?.identity?.customer?.checkout?.paymentMethods?.cardOnDeliveryEnabled,
              onlineCardEnabled: cmsHome?.identity?.customer?.checkout?.paymentMethods?.onlineCardEnabled,
            },
            fulfillment: {
              deliveryEnabled: cmsHome?.identity?.customer?.checkout?.fulfillment?.deliveryEnabled,
              branchPickupEnabled: cmsHome?.identity?.customer?.checkout?.fulfillment?.branchPickupEnabled,
            },
            branches: (cmsHome?.identity?.customer?.checkout?.branches ?? []).map((branch) => ({
              id: branch.id,
              name: branch.name[localeState],
              city: branch.city?.[localeState],
              area: branch.area?.[localeState],
              building: branch.building?.[localeState],
              stockCount: branch.stockCount,
              distanceKm: branch.distanceKm,
              payAtBranchEnabled: branch.payAtBranchEnabled,
              payNowEnabled: branch.payNowEnabled,
            })),
          }}
          onPlaceOrder={async (input) => {
            const placedOrder = await apiClient.orders.place(input)
            setOrders((current) => [placedOrder, ...current.filter((order) => order.id !== placedOrder.id)])
            setHasAutoLoadedOrders(true)
            try {
              const nextCart = await apiClient.cart.get()
              setCart(nextCart)
            } catch {
              // Keep UX non-blocking; cart refresh can happen on next load.
            }
            setView('home')
          }}
          onRequestQuote={(input) => apiClient.checkout.quote(input)}
        />
      )
    }

    return (
      <HomeV2Screen
        locale={localeState}
        cmsHome={cmsHome}
        products={products}
        brands={brands}
        categories={categories}
        loading={loading}
        error={error}
        onReload={loadProducts}
        onNavigate={() => setView('categories')}
        onSelectProduct={(id) => {
          setActiveProductId(id)
          setView('product')
        }}
        onAddToCart={async (id) => {
          const nextCart = await apiClient.cart.add(id, 1)
          setCart(nextCart)
        }}
      />
    )
  }

  if (!fontsLoaded) {
    return null
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
      <Layout
        shellContent={cmsHome?.shell ?? defaultShellContent}
        branding={{
          logoSrc:
            cmsHome?.shell?.branding?.logo.uri ??
            'https://dummyimage.com/260x60/ffffff/16181c.png&text=REAL+COSMETICS',
          logoAlt: 'Real Cosmetics',
        }}
        campaign={{
          text:
            cmsHome?.shell?.topBar?.message?.[localeState] ??
            'Free delivery for orders above 99 USD',
        }}
        cart={{
          count: cartCount,
          items: cartLines,
          subtotal: cartSubtotal,
          onViewCart: () => {
            if (REQUIRE_AUTH_FOR_CHECKOUT && !session) {
              setView('auth-login')
              return
            }
            setView('cart')
          },
          onCheckout: () => {
            if (REQUIRE_AUTH_FOR_CHECKOUT && !session) {
              setView('auth-login')
              return
            }
            setView('checkout')
          },
          onMobileCartNavigate: () => {
            if (REQUIRE_AUTH_FOR_CHECKOUT && !session) {
              setView('auth-login')
              return
            }
            setView('cart')
          },
        }}
        wishlistCount={2}
        accountCount={session ? 1 : 0}
        navigation={{
          categories: shellCategories,
          salesItems: defaultSalesItems,
          brandItems: defaultBrandItems,
          footerLinks: defaultFooterLinks,
          socialLinks: defaultSocialLinks,
          bottomNavItems: defaultBottomNavItems,
          activeBottomNavId:
            view === 'home'
              ? 'home'
              : view === 'categories' || view === 'product'
                ? 'categories'
                : view === 'checkout' || view === 'cart'
                  ? 'cart'
                  : view === 'account'
                    ? 'account'
                    : 'more',
          onBottomNavChange: (item) => {
            if (item.id === 'home') setView('home')
            if (item.id === 'categories') setView('categories')
            if (item.id === 'cart') {
              if (REQUIRE_AUTH_FOR_CHECKOUT && !session) {
                setView('auth-login')
              } else {
                setView('cart')
              }
            }
            if (item.id === 'deals') setView('deals')
            if (item.id === 'account') setView(session ? 'account' : 'auth-login')
            if (item.id === 'more') setMoreOpen(true)
          },
        }}
        newsletter={{
          title:
            cmsHome?.shell?.footer?.newsletterTitle?.[localeState] ?? 'Stay in the loop',
          subtitle:
            cmsHome?.shell?.footer?.newsletterSubtitle?.[localeState] ??
            'Get launches, offers, and skincare insights.',
        }}
        locale={{
          code: localeState,
          dir: dir,
          onChange: (nextLocale) => {
            setLocaleState(nextLocale)
            void applyLocale(nextLocale)
          },
        }}
        actions={{
          onSearchSubmit: (query) => {
            setActiveSearchQuery(query)
            setView('search')
            void loadSearch(query)
          },
        }}
        display={{
          showFooter: false,
          mobileBottomInset: insets.bottom,
        }}
      >
        {renderScreen()}
      </Layout>
      <Drawer open={moreOpen} onClose={() => setMoreOpen(false)}>
        <Box style={{ gap: spacing.md }}>
          <Text variant='headline'>{localeState === 'ar' ? 'المزيد' : 'More'}</Text>
          <Touchable
            onPress={() => {
              setMoreOpen(false)
              setView('deals')
            }}
          >
            <Text variant='body'>{localeState === 'ar' ? 'العروض' : 'Deals'}</Text>
          </Touchable>
          <Touchable
            onPress={() => {
              setMoreOpen(false)
              if (!session) {
                setView('auth-login')
                return
              }
              if (orders.length === 0 && !ordersLoading) {
                void loadOrders()
              }
              setView('orders')
            }}
          >
            <Text variant='body'>{localeState === 'ar' ? 'الطلبات' : 'Orders'}</Text>
          </Touchable>
          <Touchable
            onPress={() => {
              setMoreOpen(false)
              setView(session ? 'account' : 'auth-login')
            }}
          >
            <Text variant='body'>{localeState === 'ar' ? 'الحساب' : 'Account'}</Text>
          </Touchable>
          <Touchable
            onPress={async () => {
              setMoreOpen(false)
              if (session) {
                try {
                  await apiClient.auth.logout()
                } finally {
                  setSession(null)
                  resetAccountState()
                  setOrders([])
                  setActiveOrderId(null)
                  setView('home')
                }
                return
              }
              setView('auth-login')
            }}
          >
            <Text variant='body'>
              {session
                ? localeState === 'ar'
                  ? 'تسجيل الخروج'
                  : 'Sign out'
                : localeState === 'ar'
                  ? 'تسجيل الدخول'
                  : 'Sign in'}
            </Text>
          </Touchable>
        </Box>
      </Drawer>
    </SafeAreaView>
  )
}
