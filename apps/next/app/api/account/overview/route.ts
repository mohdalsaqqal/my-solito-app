import { accountProvider, cmsProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const cmsResult = await cmsProvider.getHome()
    const loyaltyRules = cmsResult.ok ? cmsResult.data.identity?.customer?.loyalty : undefined

    const result = await accountProvider.getOverview({
      userId: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    }, loyaltyRules)

    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail('ACCOUNT_OVERVIEW_UNEXPECTED', 'Unexpected error while fetching account overview.', 500, {
      scope: 'GET /api/account/overview',
      cause,
    })
  }
}
