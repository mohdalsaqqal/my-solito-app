import type { Product, ProductProvider } from '@real/providers/contracts'
import type { ProductFilter } from '@real/providers/contracts'
import type { ProviderResult } from '@real/providers/contracts'
import { OdooClient, type OdooProduct } from './client'
import { buildCanonicalMetadata } from '../mock/_shared/canonical-mapper'

function odooProductToCanonical(odoo: OdooProduct): Product {
  const row: Record<string, unknown> = {
    id: String(odoo.id),
    name: odoo.name,
    description: odoo.description,
    price: odoo.list_price,
    compareAtPrice: odoo.standard_price > odoo.list_price ? odoo.standard_price : undefined,
    currency: odoo.currency_id?.name ?? 'USD',
    image: odoo.image_url,
    rating: odoo.rating_avg,
    reviews: odoo.rating_count,
    isNew: odoo.is_new,
    isLimited: odoo.is_limited,
    stock: odoo.qty_available,
    brand: odoo.brand_name,
    category: odoo.category_name,
    external_product_id: String(odoo.id),
    vendor_sku: odoo.default_code ?? '',
    erp_line_code: odoo.barcode ?? '',
  }

  const metadata = buildCanonicalMetadata({
    row,
    canonicalKeys: ['id', 'name', 'description', 'price', 'currency', 'image', 'rating', 'reviews', 'isNew', 'isLimited', 'stock', 'brand', 'category'] as const,
    system: 'odoo-erp',
    table: 'product.product',
    schemaVersion: '2026-04-05',
    externalIdField: 'external_product_id',
  })

  return {
    id: String(odoo.id),
    name: odoo.name,
    description: odoo.description,
    price: odoo.list_price,
    compareAtPrice: odoo.standard_price > odoo.list_price ? odoo.standard_price : undefined,
    currency: odoo.currency_id?.name ?? 'USD',
    image: odoo.image_url,
    rating: odoo.rating_avg,
    reviews: odoo.rating_count,
    isNew: odoo.is_new,
    isLimited: odoo.is_limited,
    stock: odoo.qty_available,
    brand: odoo.brand_name,
    category: odoo.category_name,
    ...metadata,
  }
}

export function createOdooProductAdapter(client: OdooClient): ProductProvider {
  return {
    async list(filters?: ProductFilter): Promise<ProviderResult<Product[]>> {
      try {
        const odooProducts = await client.getProducts({
          brand: filters?.brand,
          category: filters?.category,
          ids: filters?.ids,
          onSale: filters?.onSale,
          sort: filters?.sort,
          limit: filters?.limit,
        })

        return { ok: true, data: odooProducts.map(odooProductToCanonical) }
      } catch (err) {
        return {
          ok: false,
          error: {
            code: 'ODOO_PRODUCT_LIST_FAILED',
            message: err instanceof Error ? err.message : 'Failed to fetch products from Odoo',
          },
        }
      }
    },

    async get(id: string): Promise<ProviderResult<Product>> {
      try {
        const odooProduct = await client.getProduct(id)
        return { ok: true, data: odooProductToCanonical(odooProduct) }
      } catch (err) {
        if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode?: number }).statusCode === 404) {
          return {
            ok: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'The requested product does not exist in Odoo.',
            },
          }
        }
        return {
          ok: false,
          error: {
            code: 'ODOO_PRODUCT_GET_FAILED',
            message: err instanceof Error ? err.message : 'Failed to fetch product from Odoo',
          },
        }
      }
    },
  }
}
