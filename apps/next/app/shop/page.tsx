import { ShopPageClient } from './ShopPageClient'
import { getHomePageInitialData } from '../../server/services/home/home-page.service'

export default async function ShopPage() {
  const { products, cmsHome, error } = await getHomePageInitialData()

  return (
    <ShopPageClient
      initialProducts={products}
      initialCmsHome={cmsHome}
      initialError={error}
    />
  )
}

