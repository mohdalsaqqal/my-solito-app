import { ensureRequestConnection } from '../../../_lib/route-connection'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'
import { searchPharmacistProducts } from '../../../../../server/services/pharmacist/pharmacist-consultation.service'

export async function GET(request: Request) {
  try {
    await ensureRequestConnection()
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }
    const url = new URL(request.url)
    const query = url.searchParams.get('q') ?? ''
    const result = await searchPharmacistProducts(session, query)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, error.code === 'AUTH_FORBIDDEN' ? 403 : 400),
    })
  } catch (cause) {
    return fail('PHARMACIST_PRODUCT_SEARCH_UNEXPECTED', 'Unexpected error while searching products.', 500, {
      scope: 'GET /api/pharmacist/products/search',
      cause,
    })
  }
}
