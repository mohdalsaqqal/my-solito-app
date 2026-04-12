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
import { Cart, CMSHome, OrderSummary, Product } from '@real/app/lib/types'
import { OrderDetailScreen } from '@real/app/screens/OrderDetailScreen'
import { CartLine } from '@real/app/features/shell'
import { apiClient } from '../../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../../cart-utils'

type OrderDetailPageClientProps = {
  initialSession: Awaited<ReturnType<typeof apiClient.auth.session>>
  initialCmsHome: CMSHome | null
  initialProducts: Product[]
  initialCart: Cart | null
  initialOrder: OrderSummary | null
  initialError: string | null
}

export function OrderDetailPageClient({
  initialSession,
  initialCmsHome,
  initialProducts,
  initialCart,
  initialOrder,
  initialError,
}: OrderDetailPageClientProps) {
  const router = useRouter()
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<Cart | null>(initialCart)
  const [session, setSession] = useState(initialSession)
  const [order, setOrder] = useState<OrderSummary | null>(initialOrder)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  useEffect(() => {
    setCmsHome(initialCmsHome)
    setProducts(initialProducts)
    setCart(initialCart)
    setSession(initialSession)
    setOrder(initialOrder)
    setError(initialError)
    setLoading(false)
  }, [initialCart, initialCmsHome, initialError, initialOrder, initialProducts, initialSession])

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
        onReload={() => router.refresh()}
      />
    </Layout>
  )
}
