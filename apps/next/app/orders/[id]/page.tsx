import { Suspense } from 'react'
import { connection } from 'next/server'
import { getOrderDetailPageInitialData } from '../../../server/services/orders/order-detail.service'
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
  const {
    session,
    cmsHome,
    products,
    cart,
    order,
    error,
  } = await getOrderDetailPageInitialData(id)

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
