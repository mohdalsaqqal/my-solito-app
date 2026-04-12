import { redirect } from 'next/navigation'
import { getPharmacistRouteShellData } from '../../../_components/pharmacist-route-shell-data'
import PharmacistReviewPageClient from './PharmacistReviewPageClient'

export default async function PharmacistReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { session, cmsHome } = await getPharmacistRouteShellData()
  if (!session) {
    redirect(`/auth/login?next=/pharmacist/customer/${id}/review`)
  }
  if (session.role !== 'pharmacist' && session.role !== 'admin') {
    redirect('/')
  }

  return <PharmacistReviewPageClient session={session} cmsHome={cmsHome} />
}
