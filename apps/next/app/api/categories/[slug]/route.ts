import { categoryProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  try {
    const result = await categoryProvider.getBySlug(slug)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 404),
    })
  } catch (cause) {
    return fail('CATEGORY_GET_UNEXPECTED', 'Unexpected error while fetching category.', 500, {
      scope: 'GET /api/categories/[slug]',
      cause,
    })
  }
}
