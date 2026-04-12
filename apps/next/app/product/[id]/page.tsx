import { getProductPageInitialData } from '../../../server/services/product/product-page.service'
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
  const {
    product,
    products,
    cmsHome,
    reviews,
    error,
    reviewsError,
  } = await getProductPageInitialData(id)

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
