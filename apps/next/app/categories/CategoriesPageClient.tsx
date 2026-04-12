'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { resolveDirection } from '@real/app/lib/rtl-manager'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import {
  Layout,
  defaultBrandItems,
  defaultCategories,
  defaultFooterLinks,
  defaultSalesItems,
  defaultShellContent,
  defaultSocialLinks,
} from '@real/app/features/shell'
import { CategoriesScreen } from '@real/app/screens/CategoriesScreen'
import type { CMSHome, Cart } from '@real/app/lib/types'
import type { CartLine } from '@real/app/features/shell'
import { apiClient } from '../apiClient'

type CategoryTreeNode = {
  id: string
  slug: string
  name: { en: string; ar: string }
  parentId?: string
  image?: string
  isActive: boolean
  sortOrder: number
  children: CategoryTreeNode[]
}

type CategoriesPageClientProps = {
  initialCmsHome: CMSHome | null
  initialCategoryTree: CategoryTreeNode[]
  initialError: string | null
}

export function CategoriesPageClient({
  initialCmsHome,
  initialCategoryTree,
  initialError,
}: CategoriesPageClientProps) {
  const router = useRouter()
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)
  const [cart, setCart] = useState<Cart | null>(null)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>(initialCategoryTree)
  const [loading, setLoading] = useState(!initialCmsHome)
  const [error, setError] = useState(initialError)

  useEffect(() => {
    setCmsHome(initialCmsHome)
    setCategoryTree(initialCategoryTree)
    setError(initialError)
    setLoading(false)
  }, [initialCategoryTree, initialCmsHome, initialError])

  const loadCart = useCallback(async () => {
    setLoading(true)
    try {
      const cartResult = await apiClient.cart.get()
      setCart(cartResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load cart.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCart()
  }, [loadCart])

  const cartItems = [] as CartLine[]
  const linesSubtotal = 0
  const linesCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const categoryNavItems = useMemo(
    () =>
      categoryTree.map((category) => ({
        id: category.id,
        label: category.name[locale],
        href: '/categories',
      })),
    [categoryTree, locale]
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
      accountCount={0}
      cartItems={cartItems}
      cartSubtotal={linesSubtotal}
      cartLoading={loading}
      cartError={error}
      categories={categoryNavItems.length > 0 ? categoryNavItems : defaultCategories}
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
      <CategoriesScreen
        cmsHome={cmsHome}
        categoryTree={categoryTree}
        locale={locale}
        onNavigate={(href) => router.push(href)}
      />
    </Layout>
  )
}
