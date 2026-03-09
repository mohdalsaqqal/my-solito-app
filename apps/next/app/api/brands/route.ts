import { brandProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../_lib/response'

export async function GET() {
  try {
    const result = await brandProvider.list()
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail('BRAND_LIST_UNEXPECTED', 'Unexpected error while fetching brands.', 500, {
      scope: 'GET /api/brands',
      cause,
    })
  }
}
