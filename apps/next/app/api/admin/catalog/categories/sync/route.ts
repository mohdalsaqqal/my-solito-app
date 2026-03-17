import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { fail, ok } from '../../../../_lib/response'
import {
  readAdminCatalogState,
  writeAdminCatalogState,
  slugify,
  AdminCategoryRecord,
} from '../../../../_lib/admin-catalog-store'
import { generatedMockProductRows } from '@real/adapters/mock/product/generated-mock-erp-data'

// Source row shape — real sources may also carry subcategory / path fields
type SourceRow = {
  category?: string
  subcategory?: string   // optional second-level field (e.g. "moisturizers")
  subsubcategory?: string // optional third-level field (e.g. "serums")
  image?: string
}

// Known top-level label map (en + ar). Leaf nodes get title-cased names by default.
const KNOWN_LABELS: Record<string, { en: string; ar: string }> = {
  skincare:     { en: 'Skincare',    ar: 'العناية بالبشرة' },
  makeup:       { en: 'Makeup',      ar: 'المكياج' },
  haircare:     { en: 'Haircare',    ar: 'العناية بالشعر' },
  suncare:      { en: 'Suncare',     ar: 'العناية الشمسية' },
  bodycare:     { en: 'Bodycare',    ar: 'العناية بالجسم' },
  nailcare:     { en: 'Nailcare',    ar: 'العناية بالأظافر' },
  babycare:     { en: 'Baby Care',   ar: 'العناية بالأطفال' },
  fragrance:    { en: 'Fragrance',   ar: 'العطور' },
}

function titleCase(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function labelsFor(slug: string): { en: string; ar: string } {
  return KNOWN_LABELS[slug] ?? { en: titleCase(slug), ar: titleCase(slug) }
}

/**
 * Derives a list of category paths from product rows.
 *
 * Supported source shapes (auto-detected):
 *  1. category = "skincare"                       → ["skincare"]
 *  2. category = "skincare/moisturizers"          → ["skincare", "skincare/moisturizers"]
 *  3. category = "skincare", subcategory = "moisturizers"
 *                                                 → ["skincare", "skincare/moisturizers"]
 *  4. category + subcategory + subsubcategory     → 3-level path
 *
 * Returns a map of fullPath → { productCount, image }.
 * Parent paths get productCount = 0 when first auto-created (updated by children later).
 */
function derivePathsFromProducts(): Map<string, { productCount: number; image?: string }> {
  const paths = new Map<string, { productCount: number; image?: string }>()

  const bump = (path: string, image?: string, countLeaf = false) => {
    const existing = paths.get(path) ?? { productCount: 0, image }
    if (countLeaf) existing.productCount += 1
    existing.image ||= image
    paths.set(path, existing)
  }

  for (const row of generatedMockProductRows as SourceRow[]) {
    if (!row.category) continue

    const segments: string[] = []

    if (row.category.includes('/')) {
      // Pattern 2: path string already encoded in category field
      segments.push(...row.category.split('/').map((s) => s.trim()).filter(Boolean))
    } else {
      // Patterns 1, 3, 4: separate fields
      segments.push(row.category.trim())
      if (row.subcategory?.trim()) segments.push(row.subcategory.trim())
      if (row.subsubcategory?.trim()) segments.push(row.subsubcategory.trim())
    }

    // Ensure every ancestor path node exists (not counted as leaf)
    for (let depth = 0; depth < segments.length - 1; depth++) {
      const ancestorPath = segments.slice(0, depth + 1).join('/')
      bump(ancestorPath, row.image, false)
    }

    // Leaf node gets the product counted
    const leafPath = segments.join('/')
    bump(leafPath, row.image, true)
  }

  return paths
}

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    const pathMap = derivePathsFromProducts()
    const state = await readAdminCatalogState()
    const now = new Date().toISOString()

    // Sort paths so parents are always processed before children
    const sortedPaths = [...pathMap.keys()].sort((a, b) => {
      const depthA = a.split('/').length
      const depthB = b.split('/').length
      return depthA !== depthB ? depthA - depthB : a.localeCompare(b)
    })

    // Build a live sourceId → id index so children can find their parent's admin id
    const sourceIdToAdminId = new Map<string, string>(
      state.categories
        .filter((c) => c.sourceId)
        .map((c) => [c.sourceId as string, c.id])
    )

    let created = 0
    let updated = 0

    for (const fullPath of sortedPaths) {
      const { productCount, image } = pathMap.get(fullPath)!
      const segments = fullPath.split('/')
      const leafSlug = segments[segments.length - 1]
      const parentPath = segments.length > 1 ? segments.slice(0, -1).join('/') : undefined
      const parentAdminId = parentPath ? sourceIdToAdminId.get(parentPath) : undefined
      const labels = labelsFor(leafSlug)

      const existing = state.categories.find((c) => c.sourceId === fullPath)

      if (existing) {
        existing.productCount = productCount
        existing.image = image ?? existing.image
        // Wire parentId if not already set (e.g. first sync that reveals hierarchy)
        if (parentAdminId && !existing.parentId) existing.parentId = parentAdminId
        if (!existing.nameEn || existing.nameEn === existing.slug) existing.nameEn = labels.en
        if (!existing.nameAr || existing.nameAr === existing.slug) existing.nameAr = labels.ar
        existing.updatedAt = now
        updated++
      } else {
        const id = `cat_${Date.now()}_${slugify(fullPath.replace(/\//g, '-'))}`
        const record: AdminCategoryRecord = {
          id,
          nameEn: labels.en,
          nameAr: labels.ar,
          slug: slugify(leafSlug),
          parentId: parentAdminId,
          productCount,
          sortOrder: state.categories.length * 10,
          status: 'visible',
          sourceId: fullPath,
          image,
          createdAt: now,
          updatedAt: now,
        }
        state.categories.push(record)
        sourceIdToAdminId.set(fullPath, id)
        created++
      }
    }

    await writeAdminCatalogState(state)
    return ok({ synced: { created, updated, total: sortedPaths.length } })
  } catch (cause) {
    return fail(
      'ADMIN_CATEGORY_SYNC_UNEXPECTED',
      'Unexpected error while syncing categories.',
      500,
      { scope: 'POST /api/admin/catalog/categories/sync', cause }
    )
  }
}
