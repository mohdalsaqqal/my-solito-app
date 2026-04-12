import { redirect } from 'next/navigation'
import { getPharmacistRouteShellData } from '../../../_components/pharmacist-route-shell-data'
import PharmacistNewTestPageClient from './PharmacistNewTestPageClient'

export default async function PharmacistNewTestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { session, cmsHome } = await getPharmacistRouteShellData()
  if (!session) {
    redirect(`/auth/login?next=/pharmacist/customer/${id}/new-test`)
  }
  if (session.role !== 'pharmacist' && session.role !== 'admin') {
    redirect('/')
  }

  return <PharmacistNewTestPageClient session={session} cmsHome={cmsHome} />
}
