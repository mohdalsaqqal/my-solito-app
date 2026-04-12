import 'server-only'

import type { PharmacistBootstrapData } from '../../../server/services/pharmacist/pharmacist-bootstrap.service'
import { getPharmacistBootstrapData } from '../../../server/services/pharmacist/pharmacist-bootstrap.service'

export type PharmacistRouteShellData = PharmacistBootstrapData

export async function getPharmacistRouteShellData(): Promise<PharmacistRouteShellData> {
  return getPharmacistBootstrapData()
}
