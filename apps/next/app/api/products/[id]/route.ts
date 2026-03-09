import { matchProviderResult } from '@real/providers/contracts'
import { productProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await productProvider.get(id)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 404),
    })
  } catch (cause) {
    return fail(
      'PRODUCT_GET_UNEXPECTED',
      'Unexpected error while fetching product.',
      500,
      { scope: 'GET /api/products/[id]', cause }
    )
  }
}
