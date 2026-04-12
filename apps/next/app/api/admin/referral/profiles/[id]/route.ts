import { ReferralActorType } from '@real/app/lib/referral/referral-types'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import {
  getReferralProfileById,
  updateReferralProfile,
} from '../../../../_lib/referral-profile-store'

type UpdateProfileBody = {
  actorType?: ReferralActorType
  approved?: boolean
  displayName?: string
  audienceCount?: number
  code?: string
  shareLink?: string
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const { id } = await context.params
    const current = await getReferralProfileById(id)
    if (!current) {
      return fail('ADMIN_REFERRAL_PROFILE_NOT_FOUND', 'Referral profile was not found.', 404)
    }

    const body = ((await request.json().catch(() => null)) ?? null) as UpdateProfileBody | null
    if (!body || typeof body !== 'object') {
      return fail('ADMIN_REFERRAL_PROFILE_INVALID', 'Request body must be an object.', 400)
    }

    const next = await updateReferralProfile(id, {
      actorType:
        body.actorType === 'customer' || body.actorType === 'influencer'
          ? body.actorType
          : undefined,
      approved: typeof body.approved === 'boolean' ? body.approved : undefined,
      displayName: typeof body.displayName === 'string' ? body.displayName : undefined,
      audienceCount:
        typeof body.audienceCount === 'number' && Number.isFinite(body.audienceCount)
          ? body.audienceCount
          : undefined,
      code: typeof body.code === 'string' ? body.code : undefined,
      shareLink: typeof body.shareLink === 'string' ? body.shareLink : undefined,
    })

    if (!next) {
      return fail('ADMIN_REFERRAL_PROFILE_NOT_FOUND', 'Referral profile was not found.', 404)
    }

    return ok(next)
  } catch (cause) {
    return fail(
      'ADMIN_REFERRAL_PROFILE_PATCH_UNEXPECTED',
      'Unexpected error while updating referral profile.',
      500,
      { scope: 'PATCH /api/admin/referral/profiles/[id]', cause }
    )
  }
}
