import {
  DEFAULT_STORE_ID,
  normalizeReferralValidationRequest,
  validateReferralRequest,
} from '@real/app/lib/referral/referral-schema'
import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'
import { getReferralProfileByCode } from '../../_lib/referral-profile-store'
import { readReferralProgramSettings } from '../../_lib/referral-program-store'

export async function POST(request: Request) {
  const session = await requireAuthSession(request)
  if (session instanceof Response) return session
  try {
    const body = await request.json().catch(() => ({}))
    const normalized = normalizeReferralValidationRequest(body)
    const storeId = DEFAULT_STORE_ID
    const program = await readReferralProgramSettings(storeId)

    const profile = normalized.code ? await getReferralProfileByCode(normalized.code, storeId) : null
    const validation = validateReferralRequest({
      request: normalized,
      program,
      profile,
    })

    if (!validation.eligible) {
      return fail(validation.reasonCode ?? 'REFERRAL_INVALID', 'Referral code is not eligible.', 400)
    }

    return ok(validation)
  } catch (cause) {
    return fail('REFERRAL_VALIDATE_UNEXPECTED', 'Unexpected error while validating referral code.', 500, {
      scope: 'POST /api/referral/validate',
      cause,
    })
  }
}
