import { fail, ok } from '../../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../../_lib/request-auth'
import { regenerateReferralProfileCode } from '../../../../../_lib/referral-profile-store'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const { id } = await context.params
    const origin = new URL(request.url).origin
    const profile = await regenerateReferralProfileCode(id, { shareLinkBase: origin })
    if (!profile) {
      return fail('ADMIN_REFERRAL_PROFILE_NOT_FOUND', 'Referral profile was not found.', 404)
    }

    return ok(profile)
  } catch (cause) {
    return fail(
      'ADMIN_REFERRAL_PROFILE_REGENERATE_UNEXPECTED',
      'Unexpected error while regenerating referral code.',
      500,
      { scope: 'POST /api/admin/referral/profiles/[id]/regenerate', cause },
    )
  }
}
