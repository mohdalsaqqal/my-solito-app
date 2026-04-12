import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import {
  listReferralLedgerEntries,
  listReferralLedgerEntriesByProfile,
} from '../../../_lib/referral-ledger-store'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'read')
    if (session instanceof Response) return session

    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')?.trim()
    const entries = profileId
      ? await listReferralLedgerEntriesByProfile(profileId)
      : await listReferralLedgerEntries()

    return ok(entries)
  } catch (cause) {
    return fail(
      'ADMIN_REFERRAL_LEDGER_GET_UNEXPECTED',
      'Unexpected error while loading referral ledger.',
      500,
      { scope: 'GET /api/admin/referral/ledger', cause }
    )
  }
}
