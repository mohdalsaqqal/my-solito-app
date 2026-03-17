import { requireAdminDomainSession } from '../../../../../../_lib/request-auth'
import { fail, ok } from '../../../../../../_lib/response'
import {
  readAdminCatalogState,
  writeAdminCatalogState,
  slugify,
  AdminCategoryRecord,
} from '../../../../../../_lib/admin-catalog-store'
import { generatedMockProductRows } from '@real/adapters/mock/product/generated-mock-erp-data'

type SourceRow = { category?: string; image?: string }

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  skincare: { en: 'Skincare', ar: 'العناية بالبشرة' },
  makeup: { en: 'Makeup', ar: 'المكياج' },
  haircare: { en: 'Haircare', ar: 'العناية بالشعر' },
  suncare: { en: 'Suncare', ar: 'العناية الشمسية' },
  bodycare: { en: 'Bodycare', ar: 'العناية بالجسم' },
  nailcare: { en: 'Nailcare', ar: 'العناية بالأظافر' },
  babycare: { en: 'Baby Care', ar: 'العناية بالأطفال' },
  fragrance: { en: 'Fragrance', ar: 'العطور' },
}

function deriveFromProducts(): Array<{ slug: string; productCount: number; image?: string }> {
  const grouped = new Map<string, { productCount: number; image?: string }>()
  for (const row of generatedMockProductRows as SourceRow[]) {
    if (!row.category) continue
    const current = grouped.get(row.category) ?? { productCount: 0, image: row.image }
    current.productCount += 1
    current.image ||= row.image
    grouped.set(row.category, current)
  }
  return [...grouped.entries()].map(([slug, entry]) => ({ slug, ...entry }))
}

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const derived = deriveFromProducts()
    const state = await readAdminCatalogState()
    const now = new Date().toISOString()
    let created = 0
    let updated = 0

    for (const { slug, productCount, image } of derived) {
      const sourceId = slug
      const existing = state.categories.find((c) => c.sourceId === sourceId)
      const labels = CATEGORY_LABELS[slug] ?? {
        en: slug.charAt(0).toUpperCase() + slug.slice(1),
        ar: slug.charAt(0).toUpperCase() + slug.slice(1),
      }

      if (existing) {
        // Source-owned fields only — never overwrite admin overrides
        existing.productCount = productCount
        existing.image = image ?? existing.image
        // nameEn/nameAr: only fill if admin hasn't customised them (still equal to slug-derived default)
        if (!existing.nameEn || existing.nameEn === existing.slug) existing.nameEn = labels.en
        if (!existing.nameAr || existing.nameAr === existing.slug) existing.nameAr = labels.ar
        existing.updatedAt = now
        updated++
      } else {
        const record: AdminCategoryRecord = {
          id: `cat_${Date.now()}_${slug}`,
          nameEn: labels.en,
          nameAr: labels.ar,
          slug: slugify(slug),
          productCount,
          sortOrder: state.categories.length * 10,
          status: 'visible',
          sourceId,
          image,
          createdAt: now,
          updatedAt: now,
        }
        state.categories.push(record)
        created++
      }
    }

    await writeAdminCatalogState(state)
    return ok({ synced: { created, updated, total: derived.length } })
  } catch (cause) {
    return fail(
      'ADMIN_CATEGORY_SYNC_UNEXPECTED',
      'Unexpected error while syncing categories.',
      500,
      { scope: 'POST /api/admin/catalog/categories/sync', cause }
    )
  }
}
