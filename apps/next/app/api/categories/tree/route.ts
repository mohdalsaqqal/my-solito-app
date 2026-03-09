import { categoryProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'

export async function GET() {
  try {
    const result = await categoryProvider.tree()
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail('CATEGORY_TREE_UNEXPECTED', 'Unexpected error while fetching category tree.', 500, {
      scope: 'GET /api/categories/tree',
      cause,
    })
  }
}
