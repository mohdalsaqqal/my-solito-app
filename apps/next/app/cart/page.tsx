import { Suspense } from 'react'
import { connection } from 'next/server'
import { getCartPageInitialData } from '../../server/services/cart/cart-page.service'
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
  const { products, cart, cmsHome, error } = await getCartPageInitialData()

  return (
    <CartPageIsland
      initialProducts={products}
      initialCart={cart}
      initialCmsHome={cmsHome}
      initialError={error}
    />
  )
}
