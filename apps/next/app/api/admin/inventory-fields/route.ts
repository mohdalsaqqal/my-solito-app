import { adminInventoryProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'inventory')
    if (session instanceof Response) return session

    const result = await adminInventoryProvider.inventoryFields()
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    return ok(result.data)
  } catch (cause) {
    return fail(
      'ADMIN_INVENTORY_FIELDS_UNEXPECTED',
      'Unexpected error while loading inventory fields.',
      500,
      {
        scope: 'GET /api/admin/inventory-fields',
        cause,
      }
    )
  }
}
