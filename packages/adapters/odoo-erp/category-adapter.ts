import type { Category, CategoryProvider, CategoryTreeNode, LocalizedString } from '@real/providers/contracts'
import type { ProviderResult } from '@real/providers/contracts'
import { OdooClient, type OdooCategory } from './client'
import { buildCanonicalMetadata } from '../mock/_shared/canonical-mapper'

function odooCategoryToCanonical(odoo: OdooCategory): Category {
  const row: Record<string, unknown> = {
    id: String(odoo.id),
    name: odoo.name,
    slug: odoo.slug,
    parentId: odoo.parent_id ? String(odoo.parent_id) : undefined,
    image: odoo.image_url,
    isActive: odoo.active,
    sortOrder: odoo.sequence,
    external_category_id: String(odoo.id),
  }

  const metadata = buildCanonicalMetadata({
    row,
    canonicalKeys: ['id', 'name', 'slug', 'parentId', 'image', 'isActive', 'sortOrder'] as const,
    system: 'odoo-erp',
    table: 'product.category',
    schemaVersion: '2026-04-05',
    externalIdField: 'external_category_id',
  })

  return {
    id: String(odoo.id),
    slug: odoo.slug,
    name: { en: odoo.name, ar: odoo.name_ar ?? odoo.name } as LocalizedString,
    parentId: odoo.parent_id ? String(odoo.parent_id) : undefined,
    image: odoo.image_url,
    isActive: odoo.active,
    sortOrder: odoo.sequence,
    ...metadata,
  }
}

function buildTree(categories: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>()
  const roots: CategoryTreeNode[] = []

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] })
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export function createOdooCategoryAdapter(client: OdooClient): CategoryProvider {
  return {
    async list(): Promise<ProviderResult<Category[]>> {
      try {
        const odooCategories = await client.getCategories()
        const categories = odooCategories.map(odooCategoryToCanonical)
        return { ok: true, data: categories }
      } catch (err) {
        return {
          ok: false,
          error: {
            code: 'ODOO_CATEGORY_LIST_FAILED',
            message: err instanceof Error ? err.message : 'Failed to fetch categories from Odoo',
          },
        }
      }
    },

    async tree(): Promise<ProviderResult<CategoryTreeNode[]>> {
      try {
        const odooCategories = await client.getCategories()
        const categories = odooCategories.map(odooCategoryToCanonical)
        return { ok: true, data: buildTree(categories) }
      } catch (err) {
        return {
          ok: false,
          error: {
            code: 'ODOO_CATEGORY_TREE_FAILED',
            message: err instanceof Error ? err.message : 'Failed to build category tree from Odoo',
          },
        }
      }
    },

    async getBySlug(slug: string): Promise<ProviderResult<Category>> {
      try {
        const odooCategories = await client.getCategories()
        const found = odooCategories.find((c) => c.slug === slug)
        if (!found) {
          return {
            ok: false,
            error: { code: 'CATEGORY_NOT_FOUND', message: `Category "${slug}" not found.` },
          }
        }
        return { ok: true, data: odooCategoryToCanonical(found) }
      } catch (err) {
        return {
          ok: false,
          error: {
            code: 'ODOO_CATEGORY_GET_FAILED',
            message: err instanceof Error ? err.message : 'Failed to fetch category from Odoo',
          },
        }
      }
    },
  }
}
