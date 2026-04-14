import { ensureRequestConnection } from '../_lib/route-connection'
import { fail, ok } from '../_lib/response'
import { getSearchPayload } from '../../../server/services/search/search.service'

export async function GET(request: Request) {
  try {
    await ensureRequestConnection()
    const payload = await getSearchPayload(request)
    return ok(payload)
  } catch (cause) {
    return fail('SEARCH_UNEXPECTED', 'Unexpected error while fetching search suggestions.', 500, {
      scope: 'GET /api/search',
      cause,
    })
  }
}
