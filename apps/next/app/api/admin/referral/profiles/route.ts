import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { listReferralProfiles, createReferralProfile } from '../../../_lib/referral-profile-store'

type CreateProfileBody = {
  userId?: string
  displayName?: string
  actorType?: 'customer' | 'influencer'
  approved?: boolean
  audienceCount?: number
}

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'read')
    if (session instanceof Response) return session

    const profiles = await listReferralProfiles()
    return ok(profiles)
  } catch (cause) {
    return fail(
      'ADMIN_REFERRAL_PROFILES_GET_UNEXPECTED',
      'Unexpected error while loading referral profiles.',
      500,
      { scope: 'GET /api/admin/referral/profiles', cause }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => null)) ?? null) as CreateProfileBody | null
    if (!body || typeof body !== 'object' || !body.userId || !body.displayName) {
      return fail(
        'ADMIN_REFERRAL_PROFILE_CREATE_INVALID',
        'userId and displayName are required to create a referral.',
        400,
      )
    }

    const origin = new URL(request.url).origin
    const result = await createReferralProfile({
      userId: body.userId,
      userEmail: '',
      displayName: body.displayName,
      actorType: body.actorType === 'influencer' ? 'influencer' : 'customer',
      approved: typeof body.approved === 'boolean' ? body.approved : false,
      audienceCount:
        typeof body.audienceCount === 'number' && Number.isFinite(body.audienceCount)
          ? body.audienceCount
          : undefined,
      shareLinkBase: origin,
    })

    if (!result.created) {
      return fail(
        'ADMIN_REFERRAL_PROFILE_ALREADY_EXISTS',
        'A referral already exists for this user.',
        409,
      )
    }

    return ok(result.profile)
  } catch (cause) {
    return fail(
      'ADMIN_REFERRAL_PROFILES_POST_UNEXPECTED',
      'Unexpected error while creating referral profile.',
      500,
      { scope: 'POST /api/admin/referral/profiles', cause }
    )
  }
}
