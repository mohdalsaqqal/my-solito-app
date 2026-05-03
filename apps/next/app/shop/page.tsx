import { Suspense } from 'react'
import { ShopPageClient } from './ShopPageClient'
import { ShopPageSkeleton } from './ShopPageSkeleton'
import { getHomePageInitialData } from '../../server/services/home/home-page.service'
import { createStorefrontServiceContext } from '../../server/services/_lib/storefront-service-context'

async function ShopPageContent() {
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
  })
  const { products, cmsHome, error } = await getHomePageInitialData(context)

  return (
    <ShopPageClient
      initialProducts={products}
      initialCmsHome={cmsHome}
      initialError={error}
    />
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ShopPageContent />
    </Suspense>
  )
}

