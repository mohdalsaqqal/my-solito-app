import type { Brand, BrandProvider, LocalizedString } from '@real/providers/contracts'
import type { ProviderResult } from '@real/providers/contracts'
import { OdooClient, type OdooBrand } from './client'
import { buildCanonicalMetadata } from '../mock/_shared/canonical-mapper'

function odooBrandToCanonical(odoo: OdooBrand): Brand {
  const row: Record<string, unknown> = {
    id: String(odoo.id),
    name: odoo.name,
    slug: odoo.slug,
    logo: odoo.logo_url,
    description: odoo.description,
    isActive: odoo.active,
    external_brand_id: String(odoo.id),
  }

  const metadata = buildCanonicalMetadata({
    row,
    canonicalKeys: ['id', 'name', 'slug', 'logo', 'description', 'isActive'] as const,
    system: 'odoo-erp',
    table: 'product.brand',
    schemaVersion: '2026-04-05',
    externalIdField: 'external_brand_id',
  })

  return {
    id: String(odoo.id),
    slug: odoo.slug,
    name: { en: odoo.name, ar: odoo.name_ar ?? odoo.name } as LocalizedString,
    logo: odoo.logo_url,
    description: { en: odoo.description ?? '', ar: odoo.description_ar ?? odoo.description ?? '' } as LocalizedString,
    isActive: odoo.active,
    ...metadata,
  }
}

export function createOdooBrandAdapter(client: OdooClient): BrandProvider {
  return {
    async list(): Promise<ProviderResult<Brand[]>> {
      try {
        const odooBrands = await client.getBrands()
        return { ok: true, data: odooBrands.map(odooBrandToCanonical) }
      } catch (err) {
        return {
          ok: false,
          error: {
            code: 'ODOO_BRAND_LIST_FAILED',
            message: err instanceof Error ? err.message : 'Failed to fetch brands from Odoo',
          },
        }
      }
    },

    async getBySlug(slug: string): Promise<ProviderResult<Brand>> {
      try {
        const odooBrands = await client.getBrands()
        const found = odooBrands.find((b) => b.slug === slug)
        if (!found) {
          return {
            ok: false,
            error: { code: 'BRAND_NOT_FOUND', message: `Brand "${slug}" not found.` },
          }
        }
        return { ok: true, data: odooBrandToCanonical(found) }
      } catch (err) {
        return {
          ok: false,
          error: {
            code: 'ODOO_BRAND_GET_FAILED',
            message: err instanceof Error ? err.message : 'Failed to fetch brand from Odoo',
          },
        }
      }
    },
  }
}
