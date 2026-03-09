'use client'

import { useCallback, useEffect, useState } from 'react'
import { resolveDirection } from '@real/app/lib/rtl-manager'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Layout,
  defaultBrandItems,
  defaultCategories,
  defaultFooterLinks,
  defaultSalesItems,
  defaultShellContent,
  defaultSocialLinks,
} from '@real/app/features/shell'
import { AccountScreen } from '@real/app/screens/AccountScreen'
import {
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
import { CartLine } from '@real/app/features/shell'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [session, setSession] = useState<Awaited<ReturnType<typeof apiClient.auth.session>>>(null)
  const [overview, setOverview] = useState<AccountOverview | null>(null)
  const [addresses, setAddresses] = useState<AccountAddress[]>([])
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyHistoryEntry[]>([])
  const [loyaltyWallet, setLoyaltyWallet] = useState<LoyaltyWallet | null>(null)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [tests, setTests] = useState<AccountTestRecord[]>([])
  const [accountQr, setAccountQr] = useState<AccountQr | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const tabParam = searchParams.get('tab')
  const accountTab =
    tabParam === 'dashboard' ||
    tabParam === 'orders' ||
    tabParam === 'tests' ||
    tabParam === 'addresses' ||
    tabParam === 'loyalty' ||
    tabParam === 'wishlist' ||
    tabParam === 'settings'
      ? tabParam
      : 'dashboard'

  const loadCms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sessionResult, cmsResult, productsResult, cartResult] = await Promise.all([
        apiClient.auth.session(),
        apiClient.cms.home(),
        apiClient.products.list(),
        apiClient.cart.get(),
      ])
      if (!sessionResult) {
        router.replace('/auth/login?next=/account')
        return
      }
      setSession(sessionResult)
      setCmsHome(cmsResult)
      setProducts(productsResult)
      setCart(cartResult)
      const [
        ordersResult,
        overviewResult,
        addressesResult,
        loyaltyResult,
        wishlistResult,
        testsResult,
        qrResult,
      ] = await Promise.all([
        apiClient.orders.list(),
        apiClient.account.overview(),
        apiClient.account.addresses(),
        apiClient.account.loyalty(),
        apiClient.account.wishlist(),
        apiClient.account.tests(),
        apiClient.account.qr(),
      ])
      setOverview(overviewResult)
      setOrders(ordersResult)
      setAddresses(addressesResult)
      setLoyaltyWallet(loyaltyResult.wallet)
      setLoyaltyHistory(loyaltyResult.history)
      setWishlist(wishlistResult)
      setTests(testsResult)
      setAccountQr(qrResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load account data.')
    } finally {
      setLoading(false)
    }
  }, [router])

  const refreshAddresses = useCallback(async () => {
    const next = await apiClient.account.addresses()
    setAddresses(next)
    return next
  }, [])

  useEffect(() => {
    void loadCms()
  }, [loadCms])

  const lines = toCartLines(cart, products)
  const linesSubtotal = cartSubtotal(lines)
  const linesCount = cartCount(cart)

  return (
    <Layout
      locale={locale}
      onLocaleChange={(nextLocale) => setCurrentLocale(nextLocale)}
      dir={dir}
      shellContent={cmsHome?.shell ?? defaultShellContent}
      logoSrc={cmsHome?.shell?.branding?.logo.uri ?? '/brand-logo-placeholder.svg'}
      logoAlt="Real Cosmetics"
      campaignText={cmsHome?.shell?.topBar?.message?.[locale] ?? 'Free delivery for orders above 99 USD'}
      campaignLink={cmsHome?.shell?.topBar?.ctaLabel?.[locale] ?? 'Shop now'}
      cartCount={linesCount}
      wishlistCount={wishlist.length}
      accountCount={session ? 1 : 0}
      cartItems={lines}
      cartSubtotal={linesSubtotal}
      categories={defaultCategories}
      salesItems={defaultSalesItems}
      brandItems={defaultBrandItems}
      footerLinks={defaultFooterLinks}
      socialLinks={defaultSocialLinks}
      newsletterTitle={cmsHome?.shell?.footer?.newsletterTitle?.[locale] ?? 'Stay in the loop'}
      newsletterSubtitle={cmsHome?.shell?.footer?.newsletterSubtitle?.[locale] ?? 'Get launches, offers, and skincare insights.'}
      onViewCart={() => router.push('/cart')}
      onCheckout={() => router.push('/checkout')}
      onMobileCartNavigate={() => router.push('/cart')}
      onPressLogo={() => router.push('/')}
      onCartIncrease={async (item: CartLine) => {
        const updated = await apiClient.cart.setQuantity(item.id, item.quantity + 1)
        setCart(updated)
      }}
      onCartDecrease={async (item: CartLine) => {
        const updated = await apiClient.cart.setQuantity(item.id, Math.max(0, item.quantity - 1))
        setCart(updated)
      }}
      onCartRemove={async (item: CartLine) => {
        const updated = await apiClient.cart.remove(item.id)
        setCart(updated)
      }}
    >
      <AccountScreen
        customerName={overview?.user.name ?? session?.name ?? (locale === 'ar' ? 'المستخدم' : 'Customer')}
        customerEmail={overview?.user.email ?? session?.email}
        userQrCode={accountQr?.qrCode}
        promoTitle={cmsHome?.identity?.customer?.accountPromo?.title?.[locale]}
        promoSubtitle={cmsHome?.identity?.customer?.accountPromo?.subtitle?.[locale]}
        orders={orders}
        addresses={addresses}
        loyalty={overview?.loyaltySummary ?? null}
        loyaltyWallet={loyaltyWallet}
        loyaltyHistory={loyaltyHistory}
        wishlist={wishlist}
        tests={tests}
        loading={loading}
        error={error}
        signingOut={signingOut}
        onSignOut={async () => {
          setSigningOut(true)
          try {
            await apiClient.auth.logout()
            router.push('/')
          } finally {
            setSigningOut(false)
          }
        }}
        onSelectOrder={(orderId) => router.push(`/orders/${orderId}`)}
        onSelectTest={(testId) => router.push(`/account/tests/${testId}`)}
        onOpenWishlistItem={(id) => router.push(`/product/${id}`)}
        onAddWishlistItemToCart={async (id) => {
          const updated = await apiClient.cart.add(id, 1)
          setCart(updated)
        }}
        initialTab={accountTab}
        onTabChange={(tab) => {
          const next = new URLSearchParams(searchParams.toString())
          if (tab === 'dashboard') {
            next.delete('tab')
          } else {
            next.set('tab', tab)
          }
          const query = next.toString()
          router.replace(query ? `/account?${query}` : '/account')
        }}
        onAddAddress={async (input) => {
          try {
            await apiClient.account.createAddress(input)
            await refreshAddresses()
            setError(null)
          } catch (mutationError) {
            setError(
              mutationError instanceof Error
                ? mutationError.message
                : 'Unable to add address.'
            )
            throw mutationError
          }
        }}
        onEditAddress={async (id, input) => {
          const target = addresses.find((item) => item.id === id)
          if (!target) return
          try {
            await apiClient.account.updateAddress(id, {
              label: input?.label ?? target.label,
              city: input?.city ?? target.city,
              area: input?.area ?? target.area,
              building: input?.building ?? target.building,
              floor: input?.floor ?? target.floor,
              apartment: input?.apartment ?? target.apartment,
            })
            await refreshAddresses()
            setError(null)
          } catch (mutationError) {
            setError(
              mutationError instanceof Error
                ? mutationError.message
                : 'Unable to update address.'
            )
          }
        }}
        onRemoveAddress={async (id) => {
          try {
            await apiClient.account.deleteAddress(id)
            await refreshAddresses()
            setError(null)
          } catch (mutationError) {
            setError(
              mutationError instanceof Error
                ? mutationError.message
                : 'Unable to delete address.'
            )
          }
        }}
        onSetDefaultAddress={async (id) => {
          try {
            await apiClient.account.setDefaultAddress(id)
            await refreshAddresses()
            setError(null)
          } catch (mutationError) {
            setError(
              mutationError instanceof Error
                ? mutationError.message
              : 'Unable to update default address.'
            )
          }
        }}
      />
    </Layout>
  )
}
