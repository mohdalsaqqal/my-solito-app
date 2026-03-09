'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { CMSHome, Product, Cart } from '@real/app/lib/types'
import { resolveMarketingCampaign } from '@real/app/lib/campaigns'
import { CartLine } from '@real/app/features/shell'
import { ShopScreen } from '@real/app/screens/ShopScreen'
import { apiClient } from '../apiClient'
import { cartCount, cartSubtotal, toCartLines } from '../cart-utils'

export default function ShopPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useCurrentLocale()
  const dir = resolveDirection(locale)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsResult, cartResult, cmsResult] = await Promise.all([
        apiClient.products.list(),
        apiClient.cart.get(),
        apiClient.cms.home(),
      ])
      setProducts(productsResult)
      setCart(cartResult)
      setCmsHome(cmsResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to fetch shop data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const lines = toCartLines(cart, products)
  const linesSubtotal = cartSubtotal(lines)
  const linesCount = cartCount(cart)
  const shopCampaign = resolveMarketingCampaign(cmsHome, locale, 'shop_banner')
  const productCardConfig = cmsHome?.marketing?.campaignZoneOverrides?.productCard

  return (
    <Layout
      locale={locale}
      onLocaleChange={(nextLocale) => setCurrentLocale(nextLocale)}
      dir={dir}
      shellContent={cmsHome?.shell ?? defaultShellContent}
      logoSrc={cmsHome?.shell?.branding?.logo.uri ?? '/brand-logo-placeholder.svg'}
      logoAlt="Real Cosmetics"
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
      <ShopScreen
        products={products}
        loading={loading}
        error={error}
        bannerTitle={shopCampaign?.title ?? cmsHome?.identity?.customer?.shopBanner?.title?.[locale]}
        bannerSubtitle={shopCampaign?.subtitle ?? cmsHome?.identity?.customer?.shopBanner?.subtitle?.[locale]}
        bannerBadge={shopCampaign?.showUrgency ? shopCampaign.urgencyBadge : undefined}
        bannerTimerEndsAt={shopCampaign?.showTimer ? shopCampaign.timerEndsAt : undefined}
        productCardUrgencyEnabled={productCardConfig?.urgencyEnabled ?? true}
        productCardUrgencyLabel={productCardConfig?.urgencyLabel?.[locale]}
        lowStockThreshold={productCardConfig?.lowStockThreshold}
        lowStockLabel={productCardConfig?.lowStockLabel?.[locale]}
        copy={{
          loadingLabel: cmsHome?.identity?.customer?.shopCatalog?.loadingLabel?.[locale],
          loadErrorTitle: cmsHome?.identity?.customer?.shopCatalog?.loadErrorTitle?.[locale],
          retryLabel: cmsHome?.identity?.customer?.shopCatalog?.retryLabel?.[locale],
          productsSuffix: cmsHome?.identity?.customer?.shopCatalog?.productsSuffix?.[locale],
          filtersButtonLabel: cmsHome?.identity?.customer?.shopCatalog?.filtersButtonLabel?.[locale],
          filterPanelTitle: cmsHome?.identity?.customer?.shopCatalog?.filterPanelTitle?.[locale],
          filterCategoryTitle: cmsHome?.identity?.customer?.shopCatalog?.filterCategoryTitle?.[locale],
          filterBrandTitle: cmsHome?.identity?.customer?.shopCatalog?.filterBrandTitle?.[locale],
          filterPriceTitle: cmsHome?.identity?.customer?.shopCatalog?.filterPriceTitle?.[locale],
          filterSpecialTitle: cmsHome?.identity?.customer?.shopCatalog?.filterSpecialTitle?.[locale],
          saleOnlyLabel: cmsHome?.identity?.customer?.shopCatalog?.saleOnlyLabel?.[locale],
          bundleOnlyLabel: cmsHome?.identity?.customer?.shopCatalog?.bundleOnlyLabel?.[locale],
          clearAllLabel: cmsHome?.identity?.customer?.shopCatalog?.clearAllLabel?.[locale],
          clearFiltersLabel: cmsHome?.identity?.customer?.shopCatalog?.clearFiltersLabel?.[locale],
          noProductsMessage: cmsHome?.identity?.customer?.shopCatalog?.noProductsMessage?.[locale],
          closeLabel: cmsHome?.identity?.customer?.shopCatalog?.closeLabel?.[locale],
          sortLabels: {
            bestSelling: cmsHome?.identity?.customer?.shopCatalog?.sortLabels?.bestSelling?.[locale],
            newest: cmsHome?.identity?.customer?.shopCatalog?.sortLabels?.newest?.[locale],
            priceAsc: cmsHome?.identity?.customer?.shopCatalog?.sortLabels?.priceAsc?.[locale],
            priceDesc: cmsHome?.identity?.customer?.shopCatalog?.sortLabels?.priceDesc?.[locale],
          },
          chipPrefixes: {
            category: cmsHome?.identity?.customer?.shopCatalog?.chipPrefixes?.category?.[locale],
            brand: cmsHome?.identity?.customer?.shopCatalog?.chipPrefixes?.brand?.[locale],
            price: cmsHome?.identity?.customer?.shopCatalog?.chipPrefixes?.price?.[locale],
          },
          priceBucketLabels: {
            all: cmsHome?.identity?.customer?.shopCatalog?.priceBucketLabels?.all?.[locale],
            under25: cmsHome?.identity?.customer?.shopCatalog?.priceBucketLabels?.under25?.[locale],
            between25And50: cmsHome?.identity?.customer?.shopCatalog?.priceBucketLabels?.between25And50?.[locale],
            between50And100: cmsHome?.identity?.customer?.shopCatalog?.priceBucketLabels?.between50And100?.[locale],
            over100: cmsHome?.identity?.customer?.shopCatalog?.priceBucketLabels?.over100?.[locale],
          },
        }}
        onReload={loadData}
        onSelectProduct={(productId) => router.push(`/product/${productId}`)}
        onAddToCart={async (productId) => {
          const updated = await apiClient.cart.add(productId, 1)
          setCart(updated)
        }}
      />
    </Layout>
  )
}
