import { adminVendorProvider } from '@real/providers'
import { VendorUpdateInput } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = requireAdminDomainSession(request, 'marketplace')
    if (session instanceof Response) return session

    const { id } = await context.params
    const result = await adminVendorProvider.getVendor(id)
    if (!result.ok) return fail(result.error.code, result.error.message, 404)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_VENDOR_DETAIL_UNEXPECTED', 'Unexpected error while loading vendor detail.', 500, {
      scope: 'GET /api/admin/vendors/[id]',
      cause,
    })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = requireAdminDomainSession(request, 'marketplace', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Partial<VendorUpdateInput>
    const { id } = await context.params
    const result = await adminVendorProvider.updateVendor(id, body)
    if (!result.ok) return fail(result.error.code, result.error.message, 404)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_VENDOR_UPDATE_UNEXPECTED', 'Unexpected error while updating vendor.', 500, {
      scope: 'PATCH /api/admin/vendors/[id]',
      cause,
    })
  }
}

