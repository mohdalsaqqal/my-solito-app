import { StorefrontStatusPanel } from '@real/ui'
import { AccountScreen } from '@real/app/screens/AccountScreen'
import { AccountTestDetailScreen } from '@real/app/screens/AccountTestDetailScreen'
import { AuthForgotPasswordScreen } from '@real/app/screens/AuthForgotPasswordScreen'
import { AuthLoginScreen } from '@real/app/screens/AuthLoginScreen'
import { AuthRegisterScreen } from '@real/app/screens/AuthRegisterScreen'
import { CategoriesScreen } from '@real/app/screens/CategoriesScreen'
import { CartScreen } from '@real/app/screens/CartScreen'
import { CheckoutScreen } from '@real/app/screens/CheckoutScreen'
import { HomeScreen } from '@real/app/screens/HomeScreen'
import { OrderDetailScreen } from '@real/app/screens/OrderDetailScreen'
import { OrdersScreen } from '@real/app/screens/OrdersScreen'
import { ProductScreen } from '@real/app/screens/ProductScreen'
import { SearchResultsScreen } from '@real/app/screens/SearchResultsScreen'
import { ShopScreen } from '@real/app/screens/ShopScreen'
import { defaultShellContent } from '@real/app/features/shell'
import { apiClient } from '../apiClient'
import type { AppRouterProps } from './AppRouter.types'

const REQUIRE_AUTH_FOR_CHECKOUT = false

function extractCategorySlug(href: string) {
  if (!href) return null

  const categoriesQueryIndex = href.indexOf('categories=')
  if (categoriesQueryIndex >= 0) {
    const value = href.slice(categoriesQueryIndex + 'categories='.length).split('&')[0]
    return value ? decodeURIComponent(value) : null
  }

  const pathMatch = href.match(/\/shop\/categories\/([^/?#]+)/)
  return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : null
}

function extractBrandSlug(href: string) {
  if (!href) return null

  const brandsQueryIndex = href.indexOf('brands=')
  if (brandsQueryIndex >= 0) {
    const value = href.slice(brandsQueryIndex + 'brands='.length).split('&')[0]
    return value ? decodeURIComponent(value) : null
  }

  const pathMatch = href.match(/\/brands\/([^/?#]+)/)
  return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : null
}

export function AppRouter({
  view,
  setView,
  locale,
  // Storefront
  products,
  brands,
  categories,
  categoryTree,
  cart,
  setCart,
  cmsHome,
  session,
  setSession,
  loading,
  error,
  loadProducts,
  cartLines,
  checkoutItems,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  shellCategories,
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
  signOut,
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
  activeTestDetail,
  testDetailLoading,
  testDetailError,
  addingTestProductId,
  setAddingTestProductId,
  addingAllTestProducts,
  setAddingAllTestProducts,
  activeTestId,
  loadTestDetail,
  // Search
  activeSearchQuery,
  searchSuggestions,
  searchLoading,
  searchError,
  // Checkout
  checkoutConfig,
  // Navigation
  activeProductId,
  setActiveProductId,
  activeCategorySlug,
  setActiveCategorySlug,
  activeBrandSlug,
  setActiveBrandSlug,
}: AppRouterProps) {
  const homeUnavailable = Boolean(error) && (!cmsHome || products.length === 0)

  if (view === 'home' && homeUnavailable) {
    const statusCopy = {
      title:
        cmsHome?.shell?.statusPages?.homeUnavailableTitle?.[locale] ??
        defaultShellContent.statusPages?.homeUnavailableTitle?.[locale] ??
        '',
      subtitle:
        cmsHome?.shell?.statusPages?.homeUnavailableSubtitle?.[locale] ??
        defaultShellContent.statusPages?.homeUnavailableSubtitle?.[locale] ??
        '',
      ctaLabel:
        cmsHome?.shell?.statusPages?.homeUnavailableCtaLabel?.[locale] ??
        defaultShellContent.statusPages?.homeUnavailableCtaLabel?.[locale] ??
        '',
    }
    return (
      <StorefrontStatusPanel
        title={statusCopy.title}
        subtitle={statusCopy.subtitle}
        ctaLabel={statusCopy.ctaLabel}
        onRetry={() => void loadProducts()}
      />
    )
  }

  if (view === 'categories') {
    return (
      <CategoriesScreen
        cmsHome={cmsHome}
        categoryTree={categoryTree}
        locale={locale}
        onNavigate={(href) => {
          const slug = extractCategorySlug(href)
          const brandSlug = extractBrandSlug(href)

          if (slug) {
            setActiveCategorySlug(slug)
            setActiveBrandSlug(null)
            setView('shop')
            return
          }

          if (brandSlug) {
            setActiveCategorySlug(null)
            setActiveBrandSlug(brandSlug)
            setView('shop')
            return
          }

          if (href === '/sales') {
            setView('deals')
            return
          }

          if (href === '/shop') {
            setActiveCategorySlug(null)
            setActiveBrandSlug(null)
            setView('shop')
            return
          }
        }}
      />
    )
  }

  if (view === 'shop') {
    return (
      <ShopScreen
        products={products}
        loading={loading}
        error={error}
        initialCategoryFilters={activeCategorySlug ? [activeCategorySlug] : []}
        initialBrandFilters={activeBrandSlug ? [activeBrandSlug] : []}
        bannerTitle={cmsHome?.identity?.customer?.shopBanner?.title?.[locale]}
        bannerSubtitle={cmsHome?.identity?.customer?.shopBanner?.subtitle?.[locale]}
        onReload={loadProducts}
        onSelectProduct={(id) => {
          setActiveProductId(id)
          setView('product')
        }}
        onAddToCart={(id) => addToCart(id, 1)}
      />
    )
  }

  if (view === 'deals') {
    return (
      <ShopScreen
        products={products}
        loading={loading}
        error={error}
        bannerTitle={locale === 'ar' ? 'عروض محدودة' : 'Limited Time Sales'}
        bannerSubtitle={
          locale === 'ar'
            ? 'منتجات مميزة بأسعار لفترة محدودة.'
            : 'Selected premium products at limited-time prices.'
        }
        onReload={loadProducts}
        onSelectProduct={(id) => { setActiveProductId(id); setView('product') }}
        onAddToCart={(id) => addToCart(id, 1)}
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
        onReload={() => void loadProducts()}
        onSelectProduct={(id) => { setActiveProductId(id); setView('product') }}
        onAddToCart={(id) => addToCart(id, 1)}
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
          if (REQUIRE_AUTH_FOR_CHECKOUT && !session) { setView('auth-login'); return }
          setView('checkout')
        }}
        onIncrease={(productId, quantity) => updateCartQuantity(productId, quantity + 1)}
        onDecrease={(productId, quantity) =>
          updateCartQuantity(productId, Math.max(0, quantity - 1))
        }
        onRemove={(productId) => removeFromCart(productId)}
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
          if (tab === 'orders' && !ordersLoading) void loadOrders()
        }}
        customerName={session.name}
        customerEmail={session.email}
        userQrCode={accountQr?.qrCode}
        referralSummary={referralSummary}
        promoTitle={cmsHome?.identity?.customer?.accountPromo?.title?.[locale]}
        promoSubtitle={cmsHome?.identity?.customer?.accountPromo?.subtitle?.[locale]}
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
        onSignOut={() => void signOut()}
        onSelectOrder={(orderId) => { setActiveOrderId(orderId); setView('order-detail') }}
        onSelectTest={(testId) => {
          setActiveAccountTab('tests')
          setView('account-test-detail')
          void loadTestDetail(testId)
        }}
        onOpenWishlistItem={(id) => { setActiveProductId(id); setView('product') }}
        onAddWishlistItemToCart={(id) => addToCart(id, 1)}
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
        onReload={() => void loadOrders()}
        onSelectOrder={(orderId) => { setActiveOrderId(orderId); setView('order-detail') }}
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
        onReload={() => void loadOrders()}
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
        onBack={() => { setActiveAccountTab('tests'); setView('account') }}
        onReload={() => { if (activeTestId) void loadTestDetail(activeTestId) }}
        onAddProduct={(productId) => {
          setAddingTestProductId(productId)
          void addToCart(productId, 1).finally(() => setAddingTestProductId(null))
        }}
        onAddAll={() => {
          const productIds = (activeTestDetail?.recommendedProducts ?? [])
            .filter((item) => item.inStock !== false)
            .map((item) => item.productId)
          if (!productIds.length) return
          setAddingAllTestProducts(true)
          void (async () => {
            for (const productId of productIds) {
              await addToCart(productId, 1)
            }
          })().finally(() => setAddingAllTestProducts(false))
        }}
        onViewProduct={(productId) => { setActiveProductId(productId); setView('product') }}
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
        notice={cmsHome?.identity?.customer?.checkoutNotice?.[locale]}
        checkoutConfig={checkoutConfig}
        onPlaceOrder={async (input) => {
          const placedOrder = await apiClient.orders.place(input)
          setOrders([placedOrder, ...orders.filter((o) => o.id !== placedOrder.id)])
          setHasAutoLoadedOrders(true)
          try {
            const nextCart = await apiClient.cart.get()
            setCart(nextCart)
          } catch {
            // Non-blocking — cart refreshes on next load
          }
          setView('home')
        }}
        onRequestQuote={(input) => apiClient.checkout.quote(input)}
      />
    )
  }

  if (view === 'product') {
    const activeProduct =
      products.find((product) => product.id === activeProductId) ?? products[0] ?? null
    return (
      <ProductScreen
        product={activeProduct}
        products={products}
        loading={loading}
        error={error}
        onReload={loadProducts}
        onAddToCart={async (id, quantity) => {
          await addToCart(id, quantity)
          if (REQUIRE_AUTH_FOR_CHECKOUT && !session) { setView('auth-login'); return }
          setView('cart')
        }}
      />
    )
  }

  // Default: home
  return (
    <HomeScreen
      locale={locale}
      cmsHome={cmsHome}
      products={products}
      brands={brands}
      categories={categories}
      loading={loading}
      error={error}
      onReload={loadProducts}
      onNavigate={(href) => {
        const categorySlug = extractCategorySlug(href ?? '')
        const brandSlug = extractBrandSlug(href ?? '')

        if (categorySlug) {
          setActiveCategorySlug(categorySlug)
          setActiveBrandSlug(null)
          setView('shop')
          return
        }

        if (brandSlug) {
          setActiveCategorySlug(null)
          setActiveBrandSlug(brandSlug)
          setView('shop')
          return
        }

        if (href === '/categories') {
          setActiveCategorySlug(null)
          setActiveBrandSlug(null)
          setView('categories')
          return
        }

        if (href === '/sales') {
          setView('deals')
          return
        }

        setActiveCategorySlug(null)
        setActiveBrandSlug(null)
        setView('categories')
      }}
      onSelectProduct={(id) => { setActiveProductId(id); setView('product') }}
      onAddToCart={(id) => addToCart(id, 1)}
    />
  )
}
