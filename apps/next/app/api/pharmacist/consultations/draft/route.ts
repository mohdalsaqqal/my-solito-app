import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'
import { PharmacistConsultationBodySchema } from '../../../_lib/validation-schemas'
import { createPharmacistConsultationDraft } from '../../../../../server/services/pharmacist/pharmacist-consultation.service'

export async function POST(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }
    const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>
    const parsed = PharmacistConsultationBodySchema.safeParse(body)
    if (!parsed.success) {
      return fail('PHARMACIST_DRAFT_INVALID', parsed.error.issues[0]?.message ?? 'Invalid consultation draft.', 400)
    }

    const result = await createPharmacistConsultationDraft(session, parsed.data)

    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, error.code === 'AUTH_FORBIDDEN' ? 403 : 400),
    })
  } catch (cause) {
    return fail('PHARMACIST_DRAFT_UNEXPECTED', 'Unexpected error while creating consultation draft.', 500, {
      scope: 'POST /api/pharmacist/consultations/draft',
      cause,
    })
  }
}
