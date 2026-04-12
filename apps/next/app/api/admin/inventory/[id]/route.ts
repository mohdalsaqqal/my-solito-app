import { adminInventoryProvider } from '@real/providers'
import { InventoryUpdateInput } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = requireAdminDomainSession(request, 'inventory')
    if (session instanceof Response) return session

    const { id } = await context.params
    const result = await adminInventoryProvider.getInventory(id)
    if (!result.ok) return fail(result.error.code, result.error.message, 404)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_INVENTORY_DETAIL_UNEXPECTED', 'Unexpected error while loading inventory detail.', 500, {
      scope: 'GET /api/admin/inventory/[id]',
      cause,
    })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = requireAdminDomainSession(request, 'inventory', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Partial<InventoryUpdateInput>
    const { id } = await context.params
    const result = await adminInventoryProvider.updateInventory(id, body)
    if (!result.ok) return fail(result.error.code, result.error.message, 404)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_INVENTORY_UPDATE_UNEXPECTED', 'Unexpected error while updating inventory.', 500, {
      scope: 'PATCH /api/admin/inventory/[id]',
      cause,
    })
  }
}

