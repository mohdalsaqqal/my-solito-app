'use client'

import { useCallback, useEffect, useState } from 'react'
import { resolveDirection } from '@real/app/lib/rtl-manager'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import { useParams, useRouter } from 'next/navigation'
import {
  Layout,
  defaultBrandItems,
  defaultCategories,
  defaultFooterLinks,
  defaultSalesItems,
  defaultShellContent,
  defaultSocialLinks,
} from '@real/app/features/shell'
import { Cart, CMSHome, OrderSummary, Product } from '@real/app/lib/types'
import { OrderDetailScreen } from '@real/app/screens/OrderDetailScreen'
import { CartLine } from '@real/app/features/shell'
import { apiClient } from '../../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../../cart-utils'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const orderId = params?.id ?? ''

  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [session, setSession] = useState<Awaited<ReturnType<typeof apiClient.auth.session>>>(null)
  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadData = useCallback(async () => {
    if (!orderId) {
      setError('Invalid order ID.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [sessionResult, cmsResult, productsResult, cartResult, orderResult] = await Promise.all([
        apiClient.auth.session(),
        apiClient.cms.home(),
        apiClient.products.list(),
        apiClient.cart.get(),
        apiClient.orders.get(orderId),
      ])
      setSession(sessionResult)
      setCmsHome(cmsResult)
      setProducts(productsResult)
      setCart(cartResult)
      setOrder(orderResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load order details.')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void loadData()
  }, [loadData])

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
      logoAlt='Real Cosmetics'
      campaignText={cmsHome?.shell?.topBar?.message?.[locale] ?? 'Free delivery for orders above 99 USD'}
      campaignLink={cmsHome?.shell?.topBar?.ctaLabel?.[locale] ?? 'Shop now'}
      cartCount={linesCount}
      wishlistCount={0}
      accountCount={session ? 1 : 0}
      cartItems={lines}
      cartSubtotal={linesSubtotal}
      categories={defaultCategories}
      salesItems={defaultSalesItems}
      brandItems={defaultBrandItems}
      footerLinks={defaultFooterLinks}
      socialLinks={defaultSocialLinks}
      newsletterTitle={cmsHome?.shell?.footer?.newsletterTitle?.[locale] ?? 'Stay in the loop'}
      newsletterSubtitle={
        cmsHome?.shell?.footer?.newsletterSubtitle?.[locale] ??
        'Get launches, offers, and skincare insights.'
      }
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
      <OrderDetailScreen
        order={order}
        loading={loading}
        error={error}
        onBack={() => router.push('/orders')}
        onReload={() => void loadData()}
      />
    </Layout>
  )
}
