import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { fail, ok } from '../../../_lib/response'
import {
  readAdminCatalogState,
  writeAdminCatalogState,
  slugify,
  AdminBrandRecord,
} from '../../../_lib/admin-catalog-store'

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'catalog')
    if (session instanceof Response) return session

    const state = await readAdminCatalogState()
    return ok({ brands: state.brands })
  } catch (cause) {
    return fail(
      'ADMIN_BRANDS_LIST_UNEXPECTED',
      'Unexpected error while loading brands.',
      500,
      { scope: 'GET /api/admin/catalog/brands', cause }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Partial<AdminBrandRecord>
    if (!body.nameEn?.trim()) {
      return fail('ADMIN_BRAND_INVALID', 'nameEn is required', 400)
    }

    const state = await readAdminCatalogState()
    const now = new Date().toISOString()
    const record: AdminBrandRecord = {
      id: `brand_${Date.now()}`,
      nameEn: body.nameEn.trim(),
      nameAr: body.nameAr ?? '',
      slug: body.slug?.trim() || slugify(body.nameEn.trim()),
      productCount: 0,
      status: body.status ?? 'visible',
      sourceId: body.sourceId,
      logoUrl: body.logoUrl,
      description: body.description,
      websiteUrl: body.websiteUrl,
      createdAt: now,
      updatedAt: now,
    }

    state.brands.push(record)
    await writeAdminCatalogState(state)
    return ok({ brand: record }, 201)
  } catch (cause) {
    return fail(
      'ADMIN_BRAND_CREATE_UNEXPECTED',
      'Unexpected error while creating brand.',
      500,
      { scope: 'POST /api/admin/catalog/brands', cause }
    )
  }
}
