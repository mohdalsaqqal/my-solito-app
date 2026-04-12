import { redirect } from 'next/navigation'
import { getPharmacistRouteShellData } from '../../_components/pharmacist-route-shell-data'
import PharmacistCustomerPageClient from './PharmacistCustomerPageClient'

export default async function PharmacistCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { session, cmsHome } = await getPharmacistRouteShellData()
  if (!session) {
    redirect(`/auth/login?next=/pharmacist/customer/${id}`)
  }
  if (session.role !== 'pharmacist' && session.role !== 'admin') {
    redirect('/')
  }

  return <PharmacistCustomerPageClient session={session} cmsHome={cmsHome} />
}
