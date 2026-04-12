import { headers } from 'next/headers'
import { authProvider } from '@real/providers'
import type { AuthSession } from '@real/providers/contracts'
import type { CMSHome } from '@real/app/lib/types'
import { getCachedHomeCmsResponseData } from '../home/home-cms.service'

export type PharmacistBootstrapData = {
  session: AuthSession | null
  cmsHome: CMSHome | null
}

export async function getPharmacistBootstrapData() {
  const requestHeaders = new Headers(await headers())
  const request = new Request('http://internal.local/api/cms/home', {
    headers: requestHeaders,
  })

  const [sessionResult, cmsResult] = await Promise.allSettled([
    authProvider.getSession(),
    getCachedHomeCmsResponseData(request.url),
  ])

  const session =
    sessionResult.status === 'fulfilled' && sessionResult.value.ok ? sessionResult.value.data : null
  const cmsHome = cmsResult.status === 'fulfilled' ? cmsResult.value.payload : null

  return {
    session,
    cmsHome,
  } satisfies PharmacistBootstrapData
}
