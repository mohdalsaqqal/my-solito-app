'use client'

import { useEffect, useState } from 'react'
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
import { SearchResultsScreen } from '@real/app/screens/SearchResultsScreen'
import { CartLine } from '@real/app/features/shell'
import { CMSHome, Cart, Product, SearchResult } from '@real/app/lib/types'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'

type SearchPageClientProps = {
  query: string
  initialProducts: Product[]
  initialCmsHome: CMSHome | null
  initialSearchResult: SearchResult
  initialError: string | null
}

export function SearchPageClient({
  query,
  initialProducts,
  initialCmsHome,
  initialSearchResult,
  initialError,
}: SearchPageClientProps) {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  const [searchResult, setSearchResult] = useState<SearchResult>(initialSearchResult)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  useEffect(() => {
    setProducts(initialProducts)
    setCmsHome(initialCmsHome)
    setSearchResult(initialSearchResult)
    setError(initialError)
    setLoading(false)
  }, [initialCmsHome, initialError, initialProducts, initialSearchResult])

  useEffect(() => {
    let active = true

    async function loadCart() {
      try {
        const cartResult = await apiClient.cart.get()
        if (active) {
          setCart(cartResult)
        }
      } catch (loadError) {
        if (active) {
          setError((current) =>
            current ?? (loadError instanceof Error ? loadError.message : 'Unable to fetch cart.')
          )
        }
      }
    }

    void loadCart()

    return () => {
      active = false
    }
  }, [])

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
      cartLoading={loading}
      cartError={error}
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
      <SearchResultsScreen
        query={query}
        suggestions={searchResult.suggestions}
        page={searchResult.page}
        locale={locale}
        loading={loading}
        error={error}
        onReload={() => router.refresh()}
        onNavigate={(href) => router.push(href)}
        onSelectProduct={(id) => router.push(`/product/${id}`)}
        onAddToCart={async (productId) => {
          const updated = await apiClient.cart.add(productId, 1)
          setCart(updated)
        }}
      />
    </Layout>
  )
}
