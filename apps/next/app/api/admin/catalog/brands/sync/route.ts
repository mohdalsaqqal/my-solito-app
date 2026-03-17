import { requireAdminDomainSession } from '../../../../../../_lib/request-auth'
import { fail, ok } from '../../../../../../_lib/response'
import {
  readAdminCatalogState,
  writeAdminCatalogState,
  slugify,
  AdminBrandRecord,
} from '../../../../../../_lib/admin-catalog-store'
import { generatedMockProductRows } from '@real/adapters/mock/product/generated-mock-erp-data'

type SourceRow = { brand?: string; csv_brand_label?: string }

function formatBrandName(slug: string, label?: string): string {
  if (label?.trim()) return label.trim()
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function deriveFromProducts(): Array<{ slug: string; nameEn: string; productCount: number }> {
  const grouped = new Map<string, { label?: string; productCount: number }>()
  for (const row of generatedMockProductRows as SourceRow[]) {
    if (!row.brand) continue
    const current = grouped.get(row.brand) ?? { label: row.csv_brand_label, productCount: 0 }
    current.label ||= row.csv_brand_label
    current.productCount += 1
    grouped.set(row.brand, current)
  }
  return [...grouped.entries()].map(([slug, entry]) => ({
    slug,
    nameEn: formatBrandName(slug, entry.label),
    productCount: entry.productCount,
  }))
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

    for (const { slug, nameEn, productCount } of derived) {
      const sourceId = slug
      const existing = state.brands.find((b) => b.sourceId === sourceId)

      if (existing) {
        // Source-owned fields only — never overwrite admin overrides
        existing.productCount = productCount
        // nameEn: only fill if admin hasn't customised it yet
        if (!existing.nameEn || existing.nameEn === existing.slug) existing.nameEn = nameEn
        if (!existing.nameAr || existing.nameAr === existing.slug) existing.nameAr = nameEn
        existing.updatedAt = now
        updated++
      } else {
        const record: AdminBrandRecord = {
          id: `brand_${Date.now()}_${slug}`,
          nameEn,
          nameAr: nameEn,
          slug: slugify(slug),
          productCount,
          status: 'visible',
          sourceId,
          createdAt: now,
          updatedAt: now,
        }
        state.brands.push(record)
        created++
      }
    }

    await writeAdminCatalogState(state)
    return ok({ synced: { created, updated, total: derived.length } })
  } catch (cause) {
    return fail(
      'ADMIN_BRAND_SYNC_UNEXPECTED',
      'Unexpected error while syncing brands.',
      500,
      { scope: 'POST /api/admin/catalog/brands/sync', cause }
    )
  }
}
