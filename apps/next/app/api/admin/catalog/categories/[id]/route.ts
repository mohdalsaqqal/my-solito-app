import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { fail, ok } from '../../../../_lib/response'
import {
  readAdminCatalogState,
  writeAdminCatalogState,
  slugify,
  AdminCategoryRecord,
} from '../../../../_lib/admin-catalog-store'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const { id } = await params
    const state = await readAdminCatalogState()
    const index = state.categories.findIndex((c: AdminCategoryRecord) => c.id === id)
    if (index === -1) return fail('ADMIN_CATEGORY_NOT_FOUND', 'Category not found', 404)

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Partial<AdminCategoryRecord>
    const existing = state.categories[index]!
    const updated: AdminCategoryRecord = {
      ...existing,
      ...body,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      slug: body.slug?.trim() || (body.nameEn ? slugify(body.nameEn) : existing.slug),
    }

    state.categories[index] = updated
    await writeAdminCatalogState(state)
    return ok({ category: updated })
  } catch (cause) {
    const { id } = await params.catch(() => ({ id: 'unknown' }))
    return fail(
      'ADMIN_CATEGORY_UPDATE_UNEXPECTED',
      'Unexpected error while updating category.',
      500,
      { scope: `PATCH /api/admin/catalog/categories/${id}`, cause }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const { id } = await params
    const state = await readAdminCatalogState()
    const index = state.categories.findIndex((c: AdminCategoryRecord) => c.id === id)
    if (index === -1) return fail('ADMIN_CATEGORY_NOT_FOUND', 'Category not found', 404)

    state.categories.splice(index, 1)
    await writeAdminCatalogState(state)
    return ok({ deleted: true })
  } catch (cause) {
    const { id } = await params.catch(() => ({ id: 'unknown' }))
    return fail(
      'ADMIN_CATEGORY_DELETE_UNEXPECTED',
      'Unexpected error while deleting category.',
      500,
      { scope: `DELETE /api/admin/catalog/categories/${id}`, cause }
    )
  }
}
