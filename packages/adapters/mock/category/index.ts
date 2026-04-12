import { CategoryProvider, Category, CategoryTreeNode } from '@real/providers/contracts'
import { buildCanonicalMetadata } from '../_shared/canonical-mapper'
import { generatedMockProductRows } from '../product/generated-mock-erp-data'

type SourceProductRow = {
  category?: string
  image?: string
}

type SourceCategoryRow = {
  id: string
  slug: string
  name: { en: string; ar: string }
  parentId?: string
  image?: string
  isActive: boolean
  sortOrder: number
  external_category_id: string
  department_code: string
  seo_title?: string
  nav_badge?: string
  merchandising_rank?: number
  regional_visibility?: string[]
  product_count?: number
}

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

const CATEGORY_ORDER = ['makeup', 'skincare', 'haircare', 'suncare', 'bodycare', 'nailcare', 'babycare', 'fragrance']

const sourceProducts = generatedMockProductRows as SourceProductRow[]

function buildSourceCategories(): SourceCategoryRow[] {
  const grouped = new Map<string, { productCount: number; image?: string }>()

  for (const row of sourceProducts) {
    if (!row.category) continue
    const current = grouped.get(row.category) ?? { productCount: 0, image: row.image }
    current.productCount += 1
    current.image ||= row.image
    grouped.set(row.category, current)
  }

  return CATEGORY_ORDER.filter((slug) => grouped.has(slug)).map((slug, index) => {
    const meta = grouped.get(slug)!
    const labels = CATEGORY_LABELS[slug] ?? {
      en: slug.charAt(0).toUpperCase() + slug.slice(1),
      ar: slug.charAt(0).toUpperCase() + slug.slice(1),
    }

    return {
      id: `cat-${slug}`,
      slug,
      name: labels,
      image: meta.image,
      isActive: true,
      sortOrder: (index + 1) * 10,
      external_category_id: `ODOO-C-${100 + index}`,
      department_code: 'DEPT-BEAUTY',
      seo_title: `${labels.en} Products`,
      nav_badge: index < 2 ? 'Top' : undefined,
      merchandising_rank: index + 1,
      regional_visibility: ['MENA', 'EU'],
      product_count: meta.productCount,
    }
  })
}

const sourceCategories = buildSourceCategories()

const canonicalCategoryKeys = [
  'id',
  'slug',
  'name',
  'parentId',
  'image',
  'isActive',
  'sortOrder',
] as const

function toCanonicalCategory(row: SourceCategoryRow): Category {
  const metadata = buildCanonicalMetadata({
    row: row as unknown as Record<string, unknown>,
    canonicalKeys: canonicalCategoryKeys,
    system: 'mock-erp',
    table: 'categories',
    schemaVersion: '2026-03-15',
    externalIdField: 'external_category_id',
  })

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    parentId: row.parentId,
    image: row.image,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    ...metadata,
  }
}

const categories = sourceCategories.map(toCanonicalCategory)

function buildTree(list: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>()
  const roots: CategoryTreeNode[] = []
  for (const item of list) {
    map.set(item.id, { ...item, children: [] })
  }
  for (const item of list) {
    const node = map.get(item.id)
    if (!node) continue
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)?.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder)
    for (const node of nodes) sortNodes(node.children)
  }
  sortNodes(roots)
  return roots
}

let cachedTree: CategoryTreeNode[] | null = null

export const mockCategoryAdapter: CategoryProvider = {
  async list() {
    return {
      ok: true,
      data: [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    }
  },
  async tree() {
    if (!cachedTree) {
      cachedTree = buildTree(categories)
    }
    return { ok: true, data: cachedTree }
  },
  async getBySlug(slug: string) {
    const found = categories.find((item) => item.slug === slug)
    if (!found) {
      return {
        ok: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'The requested category does not exist.',
        },
      }
    }
    return { ok: true, data: found }
  },
}
