import { buildReferralAccountSummary, DEFAULT_STORE_ID } from '@real/app/lib/referral/referral-schema'
import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'
import { listReferralLedgerEntriesByProfile } from '../../_lib/referral-ledger-store'
import { getReferralProfileByIdentity } from '../../_lib/referral-profile-store'
import { readReferralProgramSettings } from '../../_lib/referral-program-store'

export async function GET(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const storeId = DEFAULT_STORE_ID
    const program = await readReferralProgramSettings(storeId)
    const profile = await getReferralProfileByIdentity(
      { userId: session.userId, email: session.email },
      storeId,
    )
    const entries = profile ? await listReferralLedgerEntriesByProfile(profile.id, storeId) : []

    return ok(
      buildReferralAccountSummary({
        program,
        profile,
        entries,
      })
    )
  } catch (cause) {
    return fail('ACCOUNT_REFERRAL_UNEXPECTED', 'Unexpected error while fetching referral summary.', 500, {
      scope: 'GET /api/account/referral',
      cause,
    })
  }
}
