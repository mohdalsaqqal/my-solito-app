import { requireAdminDomainSession } from '../../../../../_lib/request-auth'
import { fail, ok } from '../../../../../_lib/response'
import {
  readAdminCatalogState,
  writeAdminCatalogState,
  slugify,
  AdminBrandRecord,
} from '../../../../../_lib/admin-catalog-store'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const state = await readAdminCatalogState()
    const index = state.brands.findIndex((b) => b.id === params.id)
    if (index === -1) return fail('ADMIN_BRAND_NOT_FOUND', 'Brand not found', 404)

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Partial<AdminBrandRecord>
    const existing = state.brands[index]!
    const updated: AdminBrandRecord = {
      ...existing,
      ...body,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      slug: body.slug?.trim() || (body.nameEn ? slugify(body.nameEn) : existing.slug),
    }

    state.brands[index] = updated
    await writeAdminCatalogState(state)
    return ok({ brand: updated })
  } catch (cause) {
    return fail(
      'ADMIN_BRAND_UPDATE_UNEXPECTED',
      'Unexpected error while updating brand.',
      500,
      { scope: `PATCH /api/admin/catalog/brands/${params.id}`, cause }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const state = await readAdminCatalogState()
    const index = state.brands.findIndex((b) => b.id === params.id)
    if (index === -1) return fail('ADMIN_BRAND_NOT_FOUND', 'Brand not found', 404)

    state.brands.splice(index, 1)
    await writeAdminCatalogState(state)
    return ok({ deleted: true })
  } catch (cause) {
    return fail(
      'ADMIN_BRAND_DELETE_UNEXPECTED',
      'Unexpected error while deleting brand.',
      500,
      { scope: `DELETE /api/admin/catalog/brands/${params.id}`, cause }
    )
  }
}
