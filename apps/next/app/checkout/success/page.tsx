import { Suspense } from 'react'
import { connection } from 'next/server'
import { getCheckoutSuccessPageInitialData } from '../../../server/services/checkout/checkout-success-page.service'
import { createStorefrontServiceContext } from '../../../server/services/_lib/storefront-service-context'
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
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
  })
  const { cmsHome, products, cart, error } = await getCheckoutSuccessPageInitialData(context)

  return (
    <CheckoutSuccessPageClient
      initialCmsHome={cmsHome}
      initialProducts={products}
      initialCart={cart}
      initialError={error}
    />
  )
}
