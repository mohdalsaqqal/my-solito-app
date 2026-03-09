'use client'

import { useCallback, useEffect, useState } from 'react'
import { resolveDirection } from '@real/app/lib/rtl-manager'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import { useRouter } from 'next/navigation'
import {
  Layout,
  defaultBrandItems,
  defaultCategories,
  defaultShellContent,
  defaultFooterLinks,
  defaultSalesItems,
  defaultSocialLinks,
} from '@real/app/features/shell'
import { HomeV2Screen } from '@real/app/screens/HomeV2Screen'
import { CMSHome, Product, Cart } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import { apiClient } from './apiClient'
import { cartCount, cartSubtotal, toCartLines } from './cart-utils'

export default function Page() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [cartFeedbackKey, setCartFeedbackKey] = useState(0)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadHomeData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsResult, cartResult, cmsResult] = await Promise.all([
        apiClient.products.list(),
        apiClient.cart.get(),
        apiClient.cms.home(),
      ])
      setProducts(productsResult)
      setCart(cartResult)
      setCmsHome(cmsResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to fetch homepage data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadHomeData()
  }, [loadHomeData])

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
      wishlistCount={2}
      accountCount={1}
      cartItems={lines}
      cartSubtotal={linesSubtotal}
      cartLoading={loading}
      cartError={error}
      cartFeedbackKey={cartFeedbackKey}
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
      <HomeV2Screen
        locale={locale}
        cmsHome={cmsHome}
        products={products}
        loading={loading}
        error={error}
        onReload={loadHomeData}
        onNavigate={(href) => router.push(href)}
        onSelectProduct={(id) => router.push(`/product/${id}`)}
        onAddToCart={async (id) => {
          const updated = await apiClient.cart.add(id, 1)
          setCart(updated)
          setCartFeedbackKey((current) => current + 1)
        }}
      />
    </Layout>
  )
}
