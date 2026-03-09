'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { AccountTestDetailScreen } from '@real/app/screens/AccountTestDetailScreen'
import { AccountTestDetail, Cart, CMSHome, Product } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import { apiClient } from '../../../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../../../cart-utils'

export default function AccountTestDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const testId = params?.id ?? ''

  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [session, setSession] = useState<Awaited<ReturnType<typeof apiClient.auth.session>>>(null)
  const [test, setTest] = useState<AccountTestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingProductId, setAddingProductId] = useState<string | null>(null)
  const [addingAll, setAddingAll] = useState(false)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadData = useCallback(async () => {
    if (!testId) {
      setError('Invalid test ID.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [sessionResult, cmsResult, productsResult, cartResult, testResult] = await Promise.all([
        apiClient.auth.session(),
        apiClient.cms.home(),
        apiClient.products.list(),
        apiClient.cart.get(),
        apiClient.account.test(testId),
      ])

      if (!sessionResult) {
        router.replace(`/auth/login?next=/account/tests/${testId}`)
        return
      }
      setSession(sessionResult)

      setCmsHome(cmsResult)
      setProducts(productsResult)
      setCart(cartResult)
      setTest(testResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load test details.')
    } finally {
      setLoading(false)
    }
  }, [router, testId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const lines = toCartLines(cart, products)
  const linesSubtotal = cartSubtotal(lines)
  const linesCount = cartCount(cart)
  const cartProductIds = useMemo(
    () => new Set((cart?.items ?? []).map((item) => item.productId)),
    [cart?.items]
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
        loading={loading}
        error={error}
        addingProductId={addingProductId}
        addingAll={addingAll}
        cartProductIds={cartProductIds}
        onBack={() => router.push('/account/tests')}
        onReload={() => {
          void loadData()
        }}
        onAddProduct={async (productId) => {
          setAddingProductId(productId)
          try {
            const updated = await apiClient.cart.add(productId, 1)
            setCart(updated)
          } finally {
            setAddingProductId(null)
          }
        }}
        onAddAll={async () => {
          if (!test) return
          setAddingAll(true)
          try {
            for (const product of test.recommendedProducts) {
              if (product.inStock === false) continue
              if (cartProductIds.has(product.productId)) continue
              const updated = await apiClient.cart.add(product.productId, 1)
              setCart(updated)
            }
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
