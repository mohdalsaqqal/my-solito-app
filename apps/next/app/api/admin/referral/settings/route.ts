import { normalizeReferralProgramSettings } from '@real/app/lib/referral/referral-schema'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import {
  readReferralProgramSettings,
  writeReferralProgramSettings,
} from '../../../_lib/referral-program-store'

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'read')
    if (session instanceof Response) return session

    const settings = await readReferralProgramSettings()
    return ok(settings)
  } catch (cause) {
    return fail(
      'ADMIN_REFERRAL_SETTINGS_GET_UNEXPECTED',
      'Unexpected error while loading referral settings.',
      500,
      { scope: 'GET /api/admin/referral/settings', cause }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => null)) ?? null) as Record<string, unknown> | null
    if (!body || typeof body !== 'object') {
      return fail('ADMIN_REFERRAL_SETTINGS_INVALID', 'Request body must be an object.', 400)
    }

    const existing = await readReferralProgramSettings()
    const next = normalizeReferralProgramSettings({
      ...existing,
      ...body,
      policy: {
        ...existing.policy,
        ...(body.policy && typeof body.policy === 'object' ? body.policy : {}),
      },
    })

    await writeReferralProgramSettings(next)
    return ok(next)
  } catch (cause) {
    return fail(
      'ADMIN_REFERRAL_SETTINGS_PUT_UNEXPECTED',
      'Unexpected error while saving referral settings.',
      500,
      { scope: 'PUT /api/admin/referral/settings', cause }
    )
  }
}
