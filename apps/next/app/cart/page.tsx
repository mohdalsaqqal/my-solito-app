'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { CartScreen } from '@real/app/screens/CartScreen'
import { CMSHome, Product, Cart } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'

export default function CartPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadData = useCallback(async () => {
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
      setError(loadError instanceof Error ? loadError.message : 'Unable to fetch cart data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const cartItems = useMemo(() => toCartLines(cart, products), [cart, products])
  const subtotal = useMemo(() => cartSubtotal(cartItems), [cartItems])
  const totalCount = cartCount(cart)

  const increase = useCallback(async (productId: string, quantity: number) => {
    const updated = await apiClient.cart.setQuantity(productId, quantity + 1)
    setCart(updated)
  }, [])

  const decrease = useCallback(async (productId: string, quantity: number) => {
    const updated = await apiClient.cart.setQuantity(productId, Math.max(0, quantity - 1))
    setCart(updated)
  }, [])

  const remove = useCallback(async (productId: string) => {
    const updated = await apiClient.cart.remove(productId)
    setCart(updated)
  }, [])

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
      cartCount={totalCount}
      wishlistCount={1}
      accountCount={1}
      cartItems={cartItems}
      cartSubtotal={subtotal}
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
      <CartScreen
        items={cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          currency: item.currency,
        }))}
        loading={loading}
        error={error}
        onIncrease={increase}
        onDecrease={decrease}
        onRemove={remove}
        onCheckout={() => router.push('/checkout')}
        onRetry={loadData}
      />
    </Layout>
  )
}
