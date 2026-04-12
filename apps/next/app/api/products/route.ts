import { fail, ok } from '../_lib/response'
import { listProductsForRequest } from '../../../server/services/catalog/product-list.service'

export async function GET(request: Request): Promise<Response> {
  try {
    const result = await listProductsForRequest(request)
    if (result.ok) {
      return ok(result.data)
    }
    return fail(result.error.code, result.error.message, 500)
  } catch (cause) {
    return fail(
      'PRODUCT_LIST_UNEXPECTED',
      'Unexpected error while fetching products.',
      500,
      { scope: 'GET /api/products', cause }
    )
  }
}
