'use client'

/**
 * Client Island for Homepage Interactive Features
 * 
 * This component handles all client-side interactive features:
 * - Cart state management and updates
 * - Locale switching
 * - Analytics tracking
 * - User interactions (add to cart, navigation)
 * 
 * Separated from Server Component to enable SSR for main content.
 */

import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { resolveDirection } from '@real/app/lib/rtl-manager'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import {
  Layout,
  defaultBrandItems,
  defaultCategories,
  defaultShellContent,
  defaultFooterLinks,
  defaultSalesItems,
  defaultSocialLinks,
  type LayoutBranding,
  type LayoutCampaign,
  type LayoutCart,
  type LayoutNavigation,
  type LayoutNewsletter,
  type LayoutLocale,
  type LayoutActions,
  type LayoutDisplay,
} from '@real/app/features/shell'
import { HomeScreen } from '@real/app/screens/HomeScreen'
import { CMSHome, Product, Cart } from '@real/app/lib/types'
import { CartLine } from '@real/app/features/shell'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'
import { ToastProvider, useToast } from '@real/ui/components'
import { QuickViewModal, StorefrontStatusPanel } from '@real/ui/components'
import type { HomeProductItem } from '@real/ui/components/home/types'

function ClientHomeContent({
  initialProducts,
  initialBrands,
  initialCategories,
  initialCmsHome,
  initialError,
}: {
  initialProducts: Product[]
  initialBrands: Array<{
    id: string
    slug: string
    name: { en: string; ar: string }
    logo?: string
    description?: { en: string; ar: string }
    isActive: boolean
  }>
  initialCategories: Array<{
    id: string
    slug: string
    name: { en: string; ar: string }
    parentId?: string
    image?: string
    isActive: boolean
    sortOrder: number
  }>
  initialCmsHome: CMSHome | null
  initialError: string | null
}) {
  const router = useRouter()
  const { show: showToast } = useToast()
  
  // Client-side state (cart, interactions)
  const [cart, setCart] = useState<Cart | null>(null)
  const [lastAddedAt, setLastAddedAt] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  
  // Quick view state
  const [quickViewProduct, setQuickViewProduct] = useState<HomeProductItem | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  
  // Server-hydrated state
  const [products] = useState<Product[]>(initialProducts)
  const [brands, setBrands] = useState(initialBrands)
  const [categories, setCategories] = useState(initialCategories)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)
  const homeUnavailable = Boolean(error) && (!cmsHome || products.length === 0)

  // Load cart on client (requires auth cookie)
  useEffect(() => {
    void apiClient.cart.get().then(setCart).catch(() => {
      // Cart load failure is non-blocking
    })
  }, [])

  // Reload CMS data (for stale data recovery)
  const loadCmsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cmsResult, categoriesResult, brandsResult] = await Promise.allSettled([
        apiClient.cms.home(),
        apiClient.catalog.categories(),
        apiClient.catalog.brands(),
      ])
      
      if (cmsResult.status === 'fulfilled') setCmsHome(cmsResult.value)
      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value)
      if (brandsResult.status === 'fulfilled') setBrands(brandsResult.value)

      if (cmsResult.status === 'rejected') {
        setError(cmsResult.reason instanceof Error ? cmsResult.reason.message : 'Unable to fetch CMS data.')
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to fetch homepage data.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Quick view handler
  const handleQuickView = useCallback((productItem: HomeProductItem) => {
    setQuickViewProduct(productItem)
    setQuickViewOpen(true)
  }, [])

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false)
    setQuickViewProduct(null)
  }, [])

  const handleQuickViewAddToCart = useCallback(async (product: HomeProductItem, quantity: number) => {
    try {
      for (let i = 0; i < quantity; i++) {
        await apiClient.cart.add(product.id, 1)
      }
      const updated = await apiClient.cart.get()
      setCart(updated)
      setLastAddedAt(Date.now())
      
      showToast(`${product.displayTitle || product.name} added to cart`, 'success')
      handleCloseQuickView()
    } catch (addError) {
      showToast(
        addError instanceof Error ? addError.message : 'Failed to add item to cart',
        'error'
      )
    }
  }, [showToast, handleCloseQuickView])

  const lines = toCartLines(cart, products)
  const linesSubtotal = cartSubtotal(lines)
  const linesCount = cartCount(lines)

  // Grouped props for Layout
  const branding: LayoutBranding = useMemo(() => ({
    logoSrc: cmsHome?.shell?.branding?.logo.uri ?? '/brand-logo-placeholder.svg',
    logoAlt: cmsHome?.shell?.branding?.logo.alt?.[locale] ?? (locale === 'ar' ? 'ريال كوزمتكس' : 'Real Cosmetics'),
    logoSize: cmsHome?.shell?.branding?.logoSize,
  }), [cmsHome, locale])

  const campaign: LayoutCampaign = useMemo(() => ({
    text: cmsHome?.shell?.topBar?.message?.[locale] ?? 'Free delivery for orders above 99 USD',
    link: cmsHome?.shell?.topBar?.ctaLabel?.[locale] ?? 'Shop now',
  }), [cmsHome, locale])

  const cartProps: LayoutCart = useMemo(() => ({
    count: linesCount,
    items: lines,
    subtotal: linesSubtotal,
    loading: loading,
    error,
    feedbackKey: lastAddedAt ?? undefined, // Pass timestamp for pulse animation
    onViewCart: () => router.push('/cart'),
    onCheckout: () => router.push('/checkout'),
    onMobileCartNavigate: () => router.push('/cart'),
    onIncrease: async (item: CartLine) => {
      const updated = await apiClient.cart.setQuantity(item.id, item.quantity + 1)
      setCart(updated)
    },
    onDecrease: async (item: CartLine) => {
      const updated = await apiClient.cart.setQuantity(item.id, Math.max(0, item.quantity - 1))
      setCart(updated)
    },
    onRemove: async (item: CartLine) => {
      const updated = await apiClient.cart.remove(item.id)
      setCart(updated)
    },
  }), [lines, linesCount, linesSubtotal, loading, error, lastAddedAt])

  const navigation: LayoutNavigation = useMemo(() => ({
    categories: categories.map((category) => ({
      id: category.id,
      label: category.name[locale] || category.name.en,
      href: `/shop/categories/${category.slug}`,
    })),
    salesItems: defaultSalesItems,
    brandItems: defaultBrandItems,
    footerLinks: defaultFooterLinks,
    socialLinks: defaultSocialLinks,
  }), [categories, locale])

  const newsletter: LayoutNewsletter = useMemo(() => ({
    title: cmsHome?.shell?.footer?.newsletterTitle?.[locale] ?? 'Stay in the loop',
    subtitle: cmsHome?.shell?.footer?.newsletterSubtitle?.[locale] ?? 'Get launches, offers, and skincare insights.',
  }), [cmsHome, locale])

  const localeProps: LayoutLocale = useMemo(() => ({
    code: locale,
    dir,
    onChange: (nextLocale) => setCurrentLocale(nextLocale),
  }), [locale, dir])

  const actions: LayoutActions = useMemo(() => ({
    onPressLogo: () => router.push('/'),
  }), [])

  const display: LayoutDisplay = useMemo(() => ({
    showFooter: true,
  }), [])

  const statusCopy = useMemo(() => ({
    title:
      cmsHome?.shell?.statusPages?.homeUnavailableTitle?.[locale] ??
      defaultShellContent.statusPages?.homeUnavailableTitle?.[locale] ??
      '',
    subtitle:
      cmsHome?.shell?.statusPages?.homeUnavailableSubtitle?.[locale] ??
      defaultShellContent.statusPages?.homeUnavailableSubtitle?.[locale] ??
      '',
    ctaLabel:
      cmsHome?.shell?.statusPages?.homeUnavailableCtaLabel?.[locale] ??
      defaultShellContent.statusPages?.homeUnavailableCtaLabel?.[locale] ??
      '',
  }), [cmsHome, locale])

  return (
    <Layout
      branding={branding}
      campaign={campaign}
      cart={cartProps}
      wishlistCount={2}
      accountCount={1}
      navigation={navigation}
      newsletter={newsletter}
      locale={localeProps}
      shellContent={cmsHome?.shell ?? defaultShellContent}
      actions={actions}
      display={display}
    >
      <main id='main-content' role='main' tabIndex={-1} style={{ display: 'block' }}>
        {homeUnavailable ? (
          <StorefrontStatusPanel
            title={statusCopy.title}
            subtitle={statusCopy.subtitle}
            ctaLabel={statusCopy.ctaLabel}
            onRetry={() => {
              void loadCmsData()
            }}
          />
        ) : (
          <HomeScreen
            locale={locale}
            cmsHome={cmsHome}
            products={products}
            brands={brands}
            categories={categories}
            loading={loading}
            error={error}
            onReload={loadCmsData}
            onNavigate={(href) => router.push(href)}
            onSelectProduct={(id) => router.push(`/product/${id}`)}
            onQuickView={handleQuickView}
            onAddToCart={async (id) => {
              try {
                const product = products.find((p) => p.id === id)
                const updated = await apiClient.cart.add(id, 1)
                setCart(updated)
                setLastAddedAt(Date.now())

                showToast(
                  `${product?.name || 'Item'} added to cart`,
                  'success'
                )
              } catch (addError) {
                showToast(
                  addError instanceof Error ? addError.message : 'Failed to add item to cart',
                  'error'
                )
              }
            }}
            onAddAllToCart={async (productIds) => {
              try {
                const uniqueIds = Array.from(new Set(productIds.filter(Boolean)))
                if (uniqueIds.length === 0) return

                let updatedCart = cart
                for (const productId of uniqueIds) {
                  updatedCart = await apiClient.cart.add(productId, 1)
                }

                setCart(updatedCart)
                setLastAddedAt(Date.now())
                showToast(
                  `${uniqueIds.length} item${uniqueIds.length === 1 ? '' : 's'} added to cart`,
                  'success'
                )
              } catch (addError) {
                showToast(
                  addError instanceof Error ? addError.message : 'Failed to add items to cart',
                  'error'
                )
              }
            }}
          />
        )}
      </main>
      
      {/* Quick View Modal */}
      <QuickViewModal
        item={quickViewProduct}
        open={quickViewOpen}
        onClose={handleCloseQuickView}
        onAddToCart={handleQuickViewAddToCart}
        onSelectProduct={(id) => {
          handleCloseQuickView()
          router.push(`/product/${id}`)
        }}
      />
    </Layout>
  )
}

export function ClientHomeFeatures(props: React.ComponentProps<typeof ClientHomeContent>) {
  return (
    <ToastProvider>
      <ClientHomeContent {...props} />
    </ToastProvider>
  )
}
