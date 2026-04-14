import { getHomePageInitialData } from '../../server/services/home/home-page.service'
import { createStorefrontServiceContext } from '../../server/services/_lib/storefront-service-context'
import { SalesPageClient } from './SalesPageClient'

export default async function SalesPage() {
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
  })
  const { products, cmsHome, error } = await getHomePageInitialData(context)

  return (
    <SalesPageClient
      initialProducts={products}
      initialCmsHome={cmsHome}
      initialError={error}
    />
  )
}
