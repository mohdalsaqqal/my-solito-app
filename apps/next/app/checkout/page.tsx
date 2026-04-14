import { Suspense } from 'react'
import { connection } from 'next/server'
import { getCheckoutPageInitialData } from '../../server/services/checkout/checkout-page.service'
import { createStorefrontServiceContext } from '../../server/services/_lib/storefront-service-context'
import { CheckoutPageClient } from './CheckoutPageClient'

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPageContent />
    </Suspense>
  )
}

async function CheckoutPageContent() {
  await connection()
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
  })
  const {
    products,
    cart,
    cmsHome,
    accountAddresses,
    loyaltyWallet,
    error,
  } = await getCheckoutPageInitialData(context)

  return (
    <CheckoutPageClient
      initialProducts={products}
      initialCart={cart}
      initialCmsHome={cmsHome}
      initialAccountAddresses={accountAddresses}
      initialLoyaltyWallet={loyaltyWallet}
      initialError={error}
    />
  )
}
