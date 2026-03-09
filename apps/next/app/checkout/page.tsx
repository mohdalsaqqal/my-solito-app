'use client'

import { useCallback, useEffect, useState } from 'react'
import { resolveDirection } from '@real/app/lib/rtl-manager'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import { useRouter } from 'next/navigation'
import {
  Layout,
  defaultBrandItems,
  defaultCategories,
  defaultFooterLinks,
  defaultSalesItems,
  defaultShellContent,
  defaultSocialLinks,
} from '@real/app/features/shell'
import { CMSHome, Product, Cart, AccountAddress, LoyaltyWallet } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import { CheckoutScreen } from '@real/app/screens/CheckoutScreen'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'
import { passThroughPricingService } from '@real/app/lib/pricing'

export default function CheckoutPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [accountAddresses, setAccountAddresses] = useState<AccountAddress[]>([])
  const [loyaltyWallet, setLoyaltyWallet] = useState<LoyaltyWallet | null>(null)
  const [selectedRedeemPercent, setSelectedRedeemPercent] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsResult, cartResult, cmsResult, sessionResult] = await Promise.all([
        apiClient.products.list(),
        apiClient.cart.get(),
        apiClient.cms.home(),
        apiClient.auth.session(),
      ])
      setProducts(productsResult)
      setCart(cartResult)
      setCmsHome(cmsResult)
      if (sessionResult) {
        try {
          const [addresses, loyalty] = await Promise.all([
            apiClient.account.addresses(),
            apiClient.account.loyalty(),
          ])
          setAccountAddresses(addresses)
          setLoyaltyWallet(loyalty.wallet)
          setSelectedRedeemPercent(undefined)
        } catch {
          setAccountAddresses([])
          setLoyaltyWallet(null)
          setSelectedRedeemPercent(undefined)
        }
      } else {
        setAccountAddresses([])
        setLoyaltyWallet(null)
        setSelectedRedeemPercent(undefined)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load checkout data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const checkoutItems: Array<{
    id: string
    name: string
    quantity: number
    price: number
    currency: string
    imageUrl?: string
  }> = (cart?.items ?? []).flatMap((line) => {
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
  })

  const defaultAddress = accountAddresses.find((address) => address.isDefault) ?? null

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
      wishlistCount={1}
      accountCount={1}
      cartItems={lines}
      cartSubtotal={linesSubtotal}
      cartLoading={loading}
      cartError={error}
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
      showFooter={false}
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
      <CheckoutScreen
        items={checkoutItems}
        loading={loading}
        error={error}
        notice={cmsHome?.identity?.customer?.checkoutNotice?.[locale]}
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
            name: branch.name[locale],
            city: branch.city?.[locale],
            area: branch.area?.[locale],
            building: branch.building?.[locale],
            stockCount: branch.stockCount,
            distanceKm: branch.distanceKm,
            payAtBranchEnabled: branch.payAtBranchEnabled,
            payNowEnabled: branch.payNowEnabled,
          })),
        }}
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
        onRetry={loadData}
        onRequestQuote={(input) => apiClient.checkout.quote(input)}
        onPlaceOrder={async (input) => {
          const currentSession = await apiClient.auth.session()
          if (!currentSession) {
            router.push('/auth/login?next=/checkout')
            return
          }

          const placed = await apiClient.orders.place(input)
          const params = new URLSearchParams({
            orderId: placed.id,
            total: String(placed.total),
            currency: placed.currency,
            placedAt: placed.createdAt,
          })
          router.push(`/checkout/success?${params.toString()}`)
        }}
      />
    </Layout>
  )
}
