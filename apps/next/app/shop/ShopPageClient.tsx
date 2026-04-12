'use client'

import { startTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentLocale } from '@real/app/lib/i18n/client'
import { CMSHome, Product } from '@real/app/lib/types'
import { resolveMarketingCampaign } from '@real/app/lib/campaigns'
import { PageLayout } from '../_components/PageLayout'
import { ShopScreen } from '@real/app/screens/ShopScreen'

type ShopPageClientProps = {
  initialProducts: Product[]
  initialCmsHome: CMSHome | null
  initialError: string | null
}

export function ShopPageClient({
  initialProducts,
  initialCmsHome,
  initialError,
}: ShopPageClientProps) {
  const router = useRouter()
  const locale = useCurrentLocale()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cmsHome, setCmsHome] = useState<CMSHome | null>(initialCmsHome)
  const [loading, setLoading] = useState(!initialCmsHome)
  const [error, setError] = useState<string | null>(initialError)

  useEffect(() => {
    setProducts(initialProducts)
    setCmsHome(initialCmsHome)
    setError(initialError)
    setLoading(false)
  }, [initialProducts, initialCmsHome, initialError])

  const shopCampaign = resolveMarketingCampaign(cmsHome, locale, 'shop_banner')

  return (
    <PageLayout
      cmsHome={cmsHome}
      products={products}
      loading={loading}
      error={error}
    >
      <ShopScreen
        products={products}
        loading={loading}
        error={error}
        bannerTitle={shopCampaign?.title ?? cmsHome?.identity?.customer?.shopBanner?.title?.[locale]}
        bannerSubtitle={shopCampaign?.subtitle ?? cmsHome?.identity?.customer?.shopBanner?.subtitle?.[locale]}
        bannerBadge={shopCampaign?.showUrgency ? shopCampaign.urgencyBadge : undefined}
        bannerTimerEndsAt={shopCampaign?.showTimer ? shopCampaign.timerEndsAt : undefined}
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
        onReload={() => {
          setLoading(true)
          setError(null)
          startTransition(() => {
            router.refresh()
          })
        }}
        onSelectProduct={(productId) => router.push(`/product/${productId}`)}
        onAddToCart={async () => {}}
      />
    </PageLayout>
  )
}
