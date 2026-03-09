'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { CartLine } from '@real/app/features/shell'
import { CheckoutSuccessScreen } from '@real/app/screens/CheckoutSuccessScreen'
import { Cart, CMSHome, Product } from '@real/app/lib/types'
import { apiClient } from '../../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../../cart-utils'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadData = useCallback(async () => {
    const [cmsResult, productsResult, cartResult] = await Promise.all([
      apiClient.cms.home(),
      apiClient.products.list(),
      apiClient.cart.get(),
    ])
    setCmsHome(cmsResult)
    setProducts(productsResult)
    setCart(cartResult)
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const lines = toCartLines(cart, products)
  const linesSubtotal = cartSubtotal(lines)
  const linesCount = cartCount(cart)
  const orderId = searchParams.get('orderId') || 'N/A'
  const orderCurrency = searchParams.get('currency') || 'USD'
  const orderTotalValue = Number(searchParams.get('total') || '0')
  const createdAt = searchParams.get('placedAt') || undefined
  const orderTotal = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: orderCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number.isFinite(orderTotalValue) ? orderTotalValue : 0),
    [orderCurrency, orderTotalValue]
  )

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
      wishlistCount={1}
      accountCount={1}
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
      showFooter={false}
    >
      <CheckoutSuccessScreen
        orderId={orderId}
        orderTotal={orderTotal}
        createdAt={createdAt}
        onContinueShopping={() => router.push('/shop')}
        onViewAccount={() => router.push('/account')}
      />
    </Layout>
  )
}
