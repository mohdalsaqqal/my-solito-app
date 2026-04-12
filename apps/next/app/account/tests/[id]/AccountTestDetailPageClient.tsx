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
import { AccountTestDetailScreen } from '@real/app/screens/AccountTestDetailScreen'
import { Cart, CMSHome, Product, AccountTestDetail } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import type { AuthSession } from '@real/providers/contracts'
import { apiClient } from '../../../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../../../cart-utils'

type AccountTestDetailPageClientProps = {
  initialSession: AuthSession | null
  initialCmsHome: CMSHome | null
  initialProducts: Product[]
  initialCart: Cart | null
  initialTest: AccountTestDetail | null
  initialError: string | null
}

export function AccountTestDetailPageClient({
  initialSession,
  initialCmsHome,
  initialProducts,
  initialCart,
  initialTest,
  initialError,
}: AccountTestDetailPageClientProps) {
  const router = useRouter()
  const [session, setSession] = useState(initialSession)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<Cart | null>(initialCart)
  const [test, setTest] = useState<AccountTestDetail | null>(initialTest)
  const [error, setError] = useState<string | null>(initialError)
  const [addingProductId, setAddingProductId] = useState<string | null>(null)
  const [addingAll, setAddingAll] = useState(false)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const lines = useMemo(() => toCartLines(cart, products), [cart, products])
  const linesSubtotal = useMemo(() => cartSubtotal(lines), [lines])
  const linesCount = useMemo(() => cartCount(lines), [lines])
  const cartProductIds = useMemo(
    () => new Set((cart?.items ?? []).map((item) => item.productId)),
    [cart?.items]
  )

  useEffect(() => {
    setSession(initialSession)
    setCmsHome(initialCmsHome)
    setProducts(initialProducts)
    setCart(initialCart)
    setTest(initialTest)
    setError(initialError)
  }, [initialCart, initialCmsHome, initialError, initialProducts, initialSession, initialTest])

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
      <AccountTestDetailScreen
        test={test}
        loading={false}
        error={error}
        addingProductId={addingProductId}
        addingAll={addingAll}
        cartProductIds={cartProductIds}
        onBack={() => router.push('/account/tests')}
        onReload={() => {
          router.refresh()
        }}
        onAddProduct={async (productId) => {
          setAddingProductId(productId)
          try {
            const updated = await apiClient.cart.add(productId, 1)
            setCart(updated)
            setError(null)
          } finally {
            setAddingProductId(null)
          }
        }}
        onAddAll={async () => {
          if (!test) return
          setAddingAll(true)
          try {
            const nextCartProductIds = new Set(cartProductIds)
            for (const product of test.recommendedProducts) {
              if (product.inStock === false) continue
              if (nextCartProductIds.has(product.productId)) continue
              const updated = await apiClient.cart.add(product.productId, 1)
              setCart(updated)
              nextCartProductIds.add(product.productId)
            }
            setError(null)
          } finally {
            setAddingAll(false)
          }
        }}
        onViewProduct={(productId) => {
          router.push(`/product/${productId}`)
        }}
      />
    </Layout>
  )
}
