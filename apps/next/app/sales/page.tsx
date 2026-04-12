import { getHomePageInitialData } from '../../server/services/home/home-page.service'
import { SalesPageClient } from './SalesPageClient'

export default async function SalesPage() {
  const { products, cmsHome, error } = await getHomePageInitialData()

  return (
    <SalesPageClient
      initialProducts={products}
      initialCmsHome={cmsHome}
      initialError={error}
    />
  )
}
