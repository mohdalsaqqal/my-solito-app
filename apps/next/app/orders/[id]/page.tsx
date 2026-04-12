import { Suspense } from 'react'
import { connection } from 'next/server'
import { getOrderDetailPageInitialData } from '../../../server/services/orders/order-detail.service'
import { createStorefrontServiceContext } from '../../../server/services/_lib/storefront-service-context'
import { OrderDetailPageClient } from './OrderDetailPageClient'

type OrderDetailPageProps = {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  return (
    <Suspense fallback={null}>
      <OrderDetailPageContent params={params} />
    </Suspense>
  )
}

async function OrderDetailPageContent({
  params,
}: OrderDetailPageProps) {
  await connection()
  const { id } = await params
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
  })
  const {
    session,
    cmsHome,
    products,
    cart,
    order,
    error,
  } = await getOrderDetailPageInitialData(id, context)

  return (
    <OrderDetailPageClient
      initialSession={session}
      initialCmsHome={cmsHome}
      initialProducts={products}
      initialCart={cart}
      initialOrder={order}
      initialError={error}
    />
  )
}
