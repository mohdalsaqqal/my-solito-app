import { getProductPageInitialData } from '../../../server/services/product/product-page.service'
import { createStorefrontServiceContext } from '../../../server/services/_lib/storefront-service-context'
import { ProductPageClient } from './ProductPageClient'

type ProductPageParams = {
  id: string
}

export default async function ProductPage({
  params,
}: {
  params: Promise<ProductPageParams>
}) {
  const { id } = await params
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
  })
  const {
    product,
    products,
    cmsHome,
    reviews,
    error,
    reviewsError,
  } = await getProductPageInitialData(id, context)

  return (
    <ProductPageClient
      productId={id}
      initialProduct={product}
      initialProducts={products}
      initialCmsHome={cmsHome}
      initialReviews={reviews}
      initialError={error}
      initialReviewsError={reviewsError}
    />
  )
}
