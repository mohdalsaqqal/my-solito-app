import {
  readAdminCatalogColumnsState,
  sanitizeColumns,
  writeAdminCatalogColumnsState,
} from '../../../../_lib/admin-catalog-columns-store'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { fail, ok } from '../../../../_lib/response'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'catalog')
    if (session instanceof Response) return session

    const state = await readAdminCatalogColumnsState()
    return ok({ columns: state.productColumns })
  } catch (cause) {
    return fail(
      'ADMIN_PRODUCT_COLUMNS_LIST_UNEXPECTED',
      'Unexpected error while loading product columns.',
      500,
      { scope: 'GET /api/admin/catalog/products/columns', cause }
    )
  }
}

type UpdatePayload = {
  columns?: unknown
}

export async function PUT(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as UpdatePayload
    const columns = sanitizeColumns(body.columns)

    const state = await readAdminCatalogColumnsState()
    state.productColumns = columns
    await writeAdminCatalogColumnsState(state)

    return ok({ columns: state.productColumns })
  } catch (cause) {
    return fail(
      'ADMIN_PRODUCT_COLUMNS_UPDATE_UNEXPECTED',
      'Unexpected error while updating product columns.',
      500,
      { scope: 'PUT /api/admin/catalog/products/columns', cause }
    )
  }
}
