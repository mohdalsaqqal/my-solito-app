'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { CMSHome, Product, Cart, AccountAddress, LoyaltyWallet, CheckoutPlaceOrderInput } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import { CheckoutScreen } from '@real/app/screens/CheckoutScreen'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'
import { passThroughPricingService } from '@real/app/lib/pricing'

type CheckoutPageClientProps = {
  initialProducts: Product[]
  initialCart: Cart | null
  initialCmsHome: CMSHome | null
  initialAccountAddresses: AccountAddress[]
  initialLoyaltyWallet: LoyaltyWallet | null
  initialError: string | null
}

export function CheckoutPageClient({
  initialProducts,
  initialCart,
  initialCmsHome,
  initialAccountAddresses,
  initialLoyaltyWallet,
  initialError,
}: CheckoutPageClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<Cart | null>(initialCart)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  const [accountAddresses, setAccountAddresses] = useState<AccountAddress[]>(initialAccountAddresses)
  const [loyaltyWallet, setLoyaltyWallet] = useState<LoyaltyWallet | null>(initialLoyaltyWallet)
  const [selectedRedeemPercent, setSelectedRedeemPercent] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(initialError)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  useEffect(() => {
    setProducts(initialProducts)
    setCart(initialCart)
    setCmsHome(initialCmsHome)
    setAccountAddresses(initialAccountAddresses)
    setLoyaltyWallet(initialLoyaltyWallet)
    setSelectedRedeemPercent(undefined)
    setError(initialError)
  }, [initialAccountAddresses, initialCart, initialCmsHome, initialError, initialLoyaltyWallet, initialProducts])

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

  const defaultAddress = accountAddresses.find((address) => address.isDefault) ?? null
  const lines = toCartLines(cart, products)
  const linesSubtotal = cartSubtotal(lines)
  const linesCount = cartCount(lines)

  return (
    <Layout
      locale={locale}
      onLocaleChange={(nextLocale) => setCurrentLocale(nextLocale)}
      dir={dir}
      shellContent={cmsHome?.shell ?? defaultShellContent}
      logoSrc={cmsHome?.shell?.branding?.logo.uri ?? '/brand-logo-placeholder.svg'}
      logoAlt='Real Cosmetics'
      campaignText={cmsHome?.shell?.topBar?.message?.[locale] ?? 'Free delivery for orders above 99 USD'}
      campaignLink={cmsHome?.shell?.topBar?.ctaLabel?.[locale] ?? 'Shop now'}
      cartCount={linesCount}
      wishlistCount={0}
      accountCount={0}
      cartItems={lines}
      cartSubtotal={linesSubtotal}
      cartLoading={false}
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
        loading={false}
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
        onRetry={() => router.refresh()}
        onRequestQuote={(input) => apiClient.checkout.quote(input)}
        onPlaceOrder={async (input: CheckoutPlaceOrderInput) => {
          const currentSession = await apiClient.auth.session()
          if (!currentSession) {
            router.push('/auth/login?next=/checkout')
            return
          }

          const placed = await apiClient.orders.place(input)
          if (placed.paymentAction?.status === 'requires_action' && placed.paymentAction.paymentUrl) {
            window.location.assign(placed.paymentAction.paymentUrl)
            return
          }

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
