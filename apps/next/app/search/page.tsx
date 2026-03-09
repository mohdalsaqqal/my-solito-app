'use client'

import { useCallback, useEffect, useState } from 'react'
import { resolveDirection } from '@real/app/lib/rtl-manager'
import { setCurrentLocale, useCurrentLocale } from '@real/app/lib/i18n/client'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { CMSHome, Cart, Product, SearchSuggestion } from '@real/app/lib/types'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()

  const [cart, setCart] = useState<Cart | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsResult, cartResult, cmsResult, searchResult] = await Promise.all([
        apiClient.products.list(),
        apiClient.cart.get(),
        apiClient.cms.home(),
        query ? apiClient.search.query(query) : Promise.resolve({ suggestions: [], trendingSearches: [], popularBrands: [] }),
      ])
      setProducts(productsResult)
      setCart(cartResult)
      setCmsHome(cmsResult)
      setSuggestions(searchResult.suggestions)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to fetch search results.')
    } finally {
      setLoading(false)
    }
  }, [query])

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
      wishlistCount={1}
      accountCount={1}
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
        suggestions={suggestions}
        loading={loading}
        error={error}
        onReload={loadData}
        onSelectProduct={(id) => router.push(`/product/${id}`)}
        onAddToCart={async (productId) => {
          const updated = await apiClient.cart.add(productId, 1)
          setCart(updated)
        }}
      />
    </Layout>
  )
}
