import { accountProvider, cmsProvider } from '@real/providers'
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

    const [overviewResult, historyResult] = await Promise.all([
      accountProvider.getOverview({
        userId: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      }, loyaltyRules),
      accountProvider.listLoyaltyHistory(session.userId),
    ])
    const walletResult = await accountProvider.getLoyaltyWallet(session.userId, session.role, loyaltyRules)

    if (!overviewResult.ok) {
      return fail(overviewResult.error.code, overviewResult.error.message, 500)
    }
    if (!historyResult.ok) {
      return fail(historyResult.error.code, historyResult.error.message, 500)
    }
    if (!walletResult.ok) {
      return fail(walletResult.error.code, walletResult.error.message, 500)
    }

    return ok({
      summary: overviewResult.data.loyaltySummary,
      wallet: walletResult.data,
      history: historyResult.data,
    })
  } catch (cause) {
    return fail('ACCOUNT_LOYALTY_UNEXPECTED', 'Unexpected error while fetching loyalty data.', 500, {
      scope: 'GET /api/account/loyalty',
      cause,
    })
  }
}
