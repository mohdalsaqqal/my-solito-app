import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getAccountPageInitialData } from '../../server/services/account/account-page.service'
import { AccountPageClient } from './AccountPageClient'

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageContent />
    </Suspense>
  )
}

async function AccountPageContent() {
  await connection()
  const data = await getAccountPageInitialData()

  if (!data.session) {
    redirect('/auth/login?next=/account')
  }

  return (
    <AccountPageClient
      initialSession={data.session}
      initialCmsHome={data.cmsHome}
      initialProducts={data.products}
      initialCart={data.cart}
      initialOrders={data.orders}
      initialOverview={data.overview}
      initialAddresses={data.addresses}
      initialLoyaltyHistory={data.loyaltyHistory}
      initialLoyaltyWallet={data.loyaltyWallet}
      initialWishlist={data.wishlist}
      initialTests={data.tests}
      initialAccountQr={data.accountQr}
      initialReferralSummary={data.referralSummary}
      initialError={data.error}
    />
  )
}
