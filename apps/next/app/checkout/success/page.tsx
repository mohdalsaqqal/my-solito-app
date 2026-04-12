import { Suspense } from 'react'
import { connection } from 'next/server'
import { getCheckoutSuccessPageInitialData } from '../../../server/services/checkout/checkout-success-page.service'
import { CheckoutSuccessPageClient } from './CheckoutSuccessPageClient'

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessPageContent />
    </Suspense>
  )
}

async function CheckoutSuccessPageContent() {
  await connection()
  const { cmsHome, products, cart, error } = await getCheckoutSuccessPageInitialData()

  return (
    <CheckoutSuccessPageClient
      initialCmsHome={cmsHome}
      initialProducts={products}
      initialCart={cart}
      initialError={error}
    />
  )
}
