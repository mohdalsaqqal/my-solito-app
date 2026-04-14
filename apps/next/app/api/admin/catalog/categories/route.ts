import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { fail, ok } from '../../../_lib/response'
import {
  readAdminCatalogState,
  writeAdminCatalogState,
  slugify,
  AdminCategoryRecord,
} from '../../../_lib/admin-catalog-store'

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'catalog')
    if (session instanceof Response) return session

    const state = await readAdminCatalogState()
    return ok({ categories: state.categories })
  } catch (cause) {
    return fail(
      'ADMIN_CATEGORIES_LIST_UNEXPECTED',
      'Unexpected error while loading categories.',
      500,
      { scope: 'GET /api/admin/catalog/categories', cause }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Partial<AdminCategoryRecord>
    if (!body.nameEn?.trim()) {
      return fail('ADMIN_CATEGORY_INVALID', 'nameEn is required', 400)
    }

    const state = await readAdminCatalogState()
    const now = new Date().toISOString()
    const record: AdminCategoryRecord = {
      id: `cat_${Date.now()}`,
      nameEn: body.nameEn.trim(),
      nameAr: body.nameAr ?? '',
      slug: body.slug?.trim() || slugify(body.nameEn.trim()),
      parentId: body.parentId,
      productCount: 0,
      sortOrder: body.sortOrder ?? state.categories.length,
      status: body.status ?? 'visible',
      sourceId: body.sourceId,
      image: body.image,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      createdAt: now,
      updatedAt: now,
    }

    state.categories.push(record)
    await writeAdminCatalogState(state)
    return ok({ category: record }, 201)
  } catch (cause) {
    return fail(
      'ADMIN_CATEGORY_CREATE_UNEXPECTED',
      'Unexpected error while creating category.',
      500,
      { scope: 'POST /api/admin/catalog/categories', cause }
    )
  }
}
