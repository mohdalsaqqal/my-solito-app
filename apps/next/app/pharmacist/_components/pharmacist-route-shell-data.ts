import 'server-only'

import type { PharmacistBootstrapData } from '../../../server/services/pharmacist/pharmacist-bootstrap.service'
import { getPharmacistBootstrapData } from '../../../server/services/pharmacist/pharmacist-bootstrap.service'
import { createStorefrontServiceContext } from '../../../server/services/_lib/storefront-service-context'

export type PharmacistRouteShellData = PharmacistBootstrapData

export async function getPharmacistRouteShellData(): Promise<PharmacistRouteShellData> {
  const context = await createStorefrontServiceContext({
    pathname: '/api/cms/home',
  })
  return getPharmacistBootstrapData(context)
}
