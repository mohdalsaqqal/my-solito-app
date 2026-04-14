import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { getAccountTestDetailPageInitialData } from '../../../../server/services/account/account-test-detail.service'
import { createStorefrontServiceContext } from '../../../../server/services/_lib/storefront-service-context'
import AccountTestDetailPageIsland from './AccountTestDetailPageIsland'

type AccountTestDetailPageProps = {
  params: Promise<{ id: string }>
}

export default function AccountTestDetailPage({ params }: AccountTestDetailPageProps) {
  return (
    <Suspense fallback={null}>
      <AccountTestDetailPageContent params={params} />
    </Suspense>
  )
}

async function AccountTestDetailPageContent({ params }: AccountTestDetailPageProps) {
  await connection()
  return <AccountTestDetailPageResolved params={await params} />
}

async function AccountTestDetailPageResolved({ params }: { params: { id: string } }) {
  const { id } = params
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
  })
  const data = await getAccountTestDetailPageInitialData(id, context)

  if (!data.session) {
    redirect(`/auth/login?next=/account/tests/${id}`)
  }

  return (
    <AccountTestDetailPageIsland
      initialSession={data.session}
      initialCmsHome={data.cmsHome}
      initialProducts={data.products}
      initialCart={data.cart}
      initialTest={data.test}
      initialError={data.error}
    />
  )
}
