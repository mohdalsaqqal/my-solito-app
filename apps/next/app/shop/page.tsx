import { ShopPageClient } from './ShopPageClient'
import { getHomePageInitialData } from '../../server/services/home/home-page.service'
import { createStorefrontServiceContext } from '../../server/services/_lib/storefront-service-context'

export default async function ShopPage() {
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

