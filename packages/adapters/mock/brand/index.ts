import { BrandProvider, Brand } from '@real/providers/contracts'
import { buildCanonicalMetadata } from '../_shared/canonical-mapper'
import { generatedMockProductRows } from '../product/generated-mock-erp-data'

type SourceProductRow = {
  brand?: string
  category?: string
  csv_brand_label?: string
  external_product_id?: string
}

type SourceBrandRow = {
  id: string
  slug: string
  name: { en: string; ar: string }
  logo?: string
  description?: { en: string; ar: string }
  isActive: boolean
  external_brand_id: string
  vendor_code: string
  assortment_categories?: string[]
  product_count?: number
}

const sourceProducts = generatedMockProductRows as SourceProductRow[]

function formatBrandName(slug: string, label?: string) {
  if (label && label.trim()) return label.trim()
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function dedupe<T>(values: T[]) {
  return Array.from(new Set(values))
}

function buildSourceBrands(): SourceBrandRow[] {
  const grouped = new Map<
    string,
    {
      label?: string
      categories: string[]
      productCount: number
    }
  >()

  for (const row of sourceProducts) {
    if (!row.brand) continue
    const current = grouped.get(row.brand) ?? {
      label: row.csv_brand_label,
      categories: [],
      productCount: 0,
    }
    current.label ||= row.csv_brand_label
    if (row.category) current.categories.push(row.category)
    current.productCount += 1
    grouped.set(row.brand, current)
  }

  return Array.from(grouped.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([slug, entry], index) => {
      const englishName = formatBrandName(slug, entry.label)
      const categories = dedupe(entry.categories).sort()
      const categorySummary = categories.length > 0 ? categories.join(', ') : 'beauty essentials'
      return {
        id: `brand-${slug}`,
        slug,
        name: { en: englishName, ar: englishName },
        isActive: true,
        description: {
          en: `${englishName} assortment from the mock ERP across ${categorySummary}.`,
          ar: `${englishName} assortment from the mock ERP across ${categorySummary}.`,
        },
        external_brand_id: `ODOO-B-${String(index + 201).padStart(3, '0')}`,
        vendor_code: `VND-${slug.replace(/-/g, '').slice(0, 10).toUpperCase()}`,
        assortment_categories: categories,
        product_count: entry.productCount,
      }
    })
}

const sourceBrands = buildSourceBrands()

const canonicalBrandKeys = [
  'id',
  'slug',
  'name',
  'logo',
  'description',
  'isActive',
] as const

function toCanonicalBrand(row: SourceBrandRow): Brand {
  const metadata = buildCanonicalMetadata({
    row: row as unknown as Record<string, unknown>,
    canonicalKeys: canonicalBrandKeys,
    system: 'mock-erp',
    table: 'brands',
    schemaVersion: '2026-03-15',
    externalIdField: 'external_brand_id',
  })

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logo: row.logo,
    description: row.description,
    isActive: row.isActive,
    ...metadata,
  }
}

const brands = sourceBrands.map(toCanonicalBrand)

export const mockBrandAdapter: BrandProvider = {
  async list() {
    return { ok: true, data: brands }
  },
  async getBySlug(slug: string) {
    const found = brands.find((item) => item.slug === slug)
    if (!found) {
      return {
        ok: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: 'The requested brand does not exist.',
        },
      }
    }
    return { ok: true, data: found }
  },
}
