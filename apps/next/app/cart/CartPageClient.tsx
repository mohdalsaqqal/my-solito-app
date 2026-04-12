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
import { CartScreen } from '@real/app/screens/CartScreen'
import { CMSHome, Product, Cart } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'

type CartPageClientProps = {
  initialProducts: Product[]
  initialCart: Cart | null
  initialCmsHome: CMSHome | null
  initialError: string | null
}

export function CartPageClient({
  initialProducts,
  initialCart,
  initialCmsHome,
  initialError,
}: CartPageClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<Cart | null>(initialCart)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  const [error, setError] = useState<string | null>(initialError)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  useEffect(() => {
    setProducts(initialProducts)
    setCart(initialCart)
    setCmsHome(initialCmsHome)
    setError(initialError)
  }, [initialCart, initialCmsHome, initialError, initialProducts])

  const cartItems = useMemo(() => toCartLines(cart, products), [cart, products])
  const subtotal = useMemo(() => cartSubtotal(cartItems), [cartItems])
  const totalCount = cart?.items?.length || 0

  const increase = async (productId: string, quantity: number) => {
    const updated = await apiClient.cart.setQuantity(productId, quantity + 1)
    setCart(updated)
  }

  const decrease = async (productId: string, quantity: number) => {
    const updated = await apiClient.cart.setQuantity(productId, Math.max(0, quantity - 1))
    setCart(updated)
  }

  const remove = async (productId: string) => {
    const updated = await apiClient.cart.remove(productId)
    setCart(updated)
  }

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
        loading={false}
        error={error}
        onIncrease={increase}
        onDecrease={decrease}
        onRemove={remove}
        onCheckout={() => router.push('/checkout')}
        onRetry={() => router.refresh()}
      />
    </Layout>
  )
}
