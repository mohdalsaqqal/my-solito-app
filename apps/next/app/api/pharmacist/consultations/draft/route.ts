import { pharmacistProvider } from '@real/providers'
import { PharmacistConsultationInput, matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'

export async function POST(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }
    if (session.role !== 'pharmacist' && session.role !== 'admin') {
      return fail('AUTH_FORBIDDEN', 'Pharmacist access is required.', 403)
    }

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as Partial<PharmacistConsultationInput>
    const result = await pharmacistProvider.createConsultationDraft({
      customerId: payload.customerId ?? '',
      title: payload.title ?? '',
      summary: payload.summary ?? '',
      notes: payload.notes ?? '',
      metrics: Array.isArray(payload.metrics) ? payload.metrics : [],
      recommendedProductIds: Array.isArray(payload.recommendedProductIds) ? payload.recommendedProductIds : [],
    })

    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 400),
    })
  } catch (cause) {
    return fail('PHARMACIST_DRAFT_UNEXPECTED', 'Unexpected error while creating consultation draft.', 500, {
      scope: 'POST /api/pharmacist/consultations/draft',
      cause,
    })
  }
}

