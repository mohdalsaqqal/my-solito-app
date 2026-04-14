import { Suspense } from 'react'
import { connection } from 'next/server'
import { getCartPageInitialData } from '../../server/services/cart/cart-page.service'
import { createStorefrontServiceContext } from '../../server/services/_lib/storefront-service-context'
import CartPageIsland from './CartPageIsland'

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartPageContent />
    </Suspense>
  )
}

async function CartPageContent() {
  await connection()
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
  })
  const { products, cart, cmsHome, error } = await getCartPageInitialData(context)

  return (
    <CartPageIsland
      initialProducts={products}
      initialCart={cart}
      initialCmsHome={cmsHome}
      initialError={error}
    />
  )
}
