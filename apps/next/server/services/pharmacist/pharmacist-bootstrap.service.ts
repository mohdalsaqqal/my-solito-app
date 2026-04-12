import { authProvider } from '@real/providers'
import type { AuthSession } from '@real/providers/contracts'
import type { CMSHome } from '@real/app/lib/types'
import { getCachedHomeCmsResponseData } from '../home/home-cms.service'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

export type PharmacistBootstrapData = {
  session: AuthSession | null
  cmsHome: CMSHome | null
}

export async function getPharmacistBootstrapData(
  context: Pick<StorefrontServiceContext, 'requestUrl'>,
) {
  const [sessionResult, cmsResult] = await Promise.allSettled([
    authProvider.getSession(),
    getCachedHomeCmsResponseData(context.requestUrl),
  ])

  const session =
    sessionResult.status === 'fulfilled' && sessionResult.value.ok ? sessionResult.value.data : null
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null

  return {
    session,
    cmsHome,
  } satisfies PharmacistBootstrapData
}
