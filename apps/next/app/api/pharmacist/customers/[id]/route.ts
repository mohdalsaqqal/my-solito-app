import { pharmacistProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }
    if (session.role !== 'pharmacist' && session.role !== 'admin') {
      return fail('AUTH_FORBIDDEN', 'Pharmacist access is required.', 403)
    }

    const { id } = await params
    const result = await pharmacistProvider.getCustomerProfile(id)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, error.code === 'PHARMACIST_CUSTOMER_NOT_FOUND' ? 404 : 400),
    })
  } catch (cause) {
    return fail('PHARMACIST_CUSTOMER_UNEXPECTED', 'Unexpected error while fetching customer profile.', 500, {
      scope: 'GET /api/pharmacist/customers/[id]',
      cause,
    })
  }
}

