import { Suspense } from 'react'
import { connection } from 'next/server'
import { getCheckoutPageInitialData } from '../../server/services/checkout/checkout-page.service'
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
  const {
    products,
    cart,
    cmsHome,
    accountAddresses,
    loyaltyWallet,
    error,
  } = await getCheckoutPageInitialData()

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
