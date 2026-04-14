import { adminProductProvider } from '@real/providers'
import { ProductUpsertInput } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as ProductUpsertInput
    if (!body.title?.trim()) return fail('ADMIN_PRODUCT_TITLE_REQUIRED', 'Product title is required.', 400)

    const result = await adminProductProvider.createProduct(body)
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    return ok(result.data, 201)
  } catch (cause) {
    return fail('ADMIN_PRODUCT_CREATE_UNEXPECTED', 'Unexpected error while creating product.', 500, {
      scope: 'POST /api/admin/products/create',
      cause,
    })
  }
}

