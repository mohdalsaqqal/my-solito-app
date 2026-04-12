import { redirect } from 'next/navigation'
import { getPharmacistRouteShellData } from '../_components/pharmacist-route-shell-data'
import PharmacistScanPageClient from './PharmacistScanPageClient'

export default async function PharmacistScanPage() {
  const { session, cmsHome } = await getPharmacistRouteShellData()
  if (!session) {
    redirect('/auth/login?next=/pharmacist/scan')
  }
  if (session.role !== 'pharmacist' && session.role !== 'admin') {
    redirect('/')
  }

  return <PharmacistScanPageClient session={session} cmsHome={cmsHome} />
}
