import type { AuthSession } from '@real/providers/contracts'
import type { CMSHome } from '@real/app/lib/types'
import { getCachedHomeCmsResponseData } from '../home/home-cms.service'
import { createStorefrontServiceRequest, type StorefrontServiceContext } from '../_lib/storefront-service-context'
import { resolveNormalizedSessionFromRequest } from '../auth'

export type PharmacistBootstrapData = {
  session: AuthSession | null
  cmsHome: CMSHome | null
}

export async function getPharmacistBootstrapData(
  context: Pick<StorefrontServiceContext, 'requestUrl' | 'requestHeaders'>,
) {
  const request = createStorefrontServiceRequest(context)
  const [sessionResult, cmsResult] = await Promise.allSettled([
    resolveNormalizedSessionFromRequest(request),
    getCachedHomeCmsResponseData(context.requestUrl),
  ])

  const session =
    sessionResult.status === 'fulfilled' ? sessionResult.value : null
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null

  return {
    session,
    cmsHome,
  } satisfies PharmacistBootstrapData
}
