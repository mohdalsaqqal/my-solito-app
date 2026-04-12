'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
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
  CartLine,
} from '@real/app/features/shell'
import { CMSHome, Product, Cart } from '@real/app/lib/types'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'

type PageLayoutProps = {
  children: ReactNode
  cmsHome: CMSHome | null
  products: Product[]
  loading?: boolean
  error?: string | null
}

export function PageLayout({
  children,
  cmsHome,
  products,
  loading = false,
  error = null,
}: PageLayoutProps) {
  const router = useRouter()
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)
  const [cart, setCart] = useState<Cart | null>(null)

  const shellContentResolved = cmsHome?.shell ?? defaultShellContent

  // Load cart on mount
  useEffect(() => {
    let active = true
    apiClient.cart.get().then(result => {
      if (active) setCart(result)
    }).catch(() => {
      // Cart load failure is non-fatal; Layout handles via cartError prop
    })
    return () => { active = false }
  }, [])

  const lines = toCartLines(cart, products)
  const linesCount = cartCount(lines)
  const linesSubtotal = cartSubtotal(lines)

  const onCartIncrease = useCallback(async (item: CartLine) => {
    const updated = await apiClient.cart.setQuantity(item.id, item.quantity + 1)
    setCart(updated)
  }, [])

  const onCartDecrease = useCallback(async (item: CartLine) => {
    const updated = await apiClient.cart.setQuantity(item.id, Math.max(0, item.quantity - 1))
    setCart(updated)
  }, [])

  const onCartRemove = useCallback(async (item: CartLine) => {
    const updated = await apiClient.cart.remove(item.id)
    setCart(updated)
  }, [])

  return (
    <Layout
      locale={locale}
      onLocaleChange={(nextLocale) => setCurrentLocale(nextLocale)}
      dir={dir}
      shellContent={shellContentResolved}
      logoSrc={shellContentResolved.branding?.logo.uri ?? '/brand-logo-placeholder.svg'}
      logoAlt="Real Cosmetics"
      campaignText={shellContentResolved.topBar?.message?.[locale] ?? 'Free delivery for orders above 99 USD'}
      campaignLink={shellContentResolved.topBar?.ctaLabel?.[locale] ?? 'Shop now'}
      cartCount={linesCount}
      wishlistCount={0}
      accountCount={0}
      cartItems={lines}
      cartSubtotal={linesSubtotal}
      cartLoading={loading}
      cartError={error}
      categories={defaultCategories}
      salesItems={defaultSalesItems}
      brandItems={defaultBrandItems}
      footerLinks={defaultFooterLinks}
      socialLinks={defaultSocialLinks}
      newsletterTitle={shellContentResolved.footer?.newsletterTitle?.[locale] ?? 'Stay in the loop'}
      newsletterSubtitle={shellContentResolved.footer?.newsletterSubtitle?.[locale] ?? 'Get launches, offers, and skincare insights.'}
      onViewCart={() => router.push('/cart')}
      onCheckout={() => router.push('/checkout')}
      onMobileCartNavigate={() => router.push('/cart')}
      onPressLogo={() => router.push('/')}
      onCartIncrease={onCartIncrease}
      onCartDecrease={onCartDecrease}
      onCartRemove={onCartRemove}
    >
      {children}
    </Layout>
  )
}
