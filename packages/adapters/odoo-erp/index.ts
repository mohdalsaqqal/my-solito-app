import type { ProductProvider, CategoryProvider, BrandProvider } from '@real/providers/contracts'
import { OdooClient, type OdooConfig } from './client'
import { createOdooProductAdapter } from './product-adapter'
import { createOdooCategoryAdapter } from './category-adapter'
import { createOdooBrandAdapter } from './brand-adapter'

export type OdooAdapters = {
  productProvider: ProductProvider
  categoryProvider: CategoryProvider
  brandProvider: BrandProvider
}

/**
 * Create Odoo adapters from environment variables.
 *
 * Required env vars:
 *   ODOO_BASE_URL   — e.g. https://erp.example.com
 *   ODOO_DB         — Odoo database name
 *   ODOO_API_KEY    — API key or session token
 *
 * Returns null if env vars are not configured (caller should fall back to mock).
 */
export function createOdooAdapters(config?: Partial<OdooConfig>): OdooAdapters | null {
  const baseUrl = config?.baseUrl ?? process.env.ODOO_BASE_URL
  const db = config?.db ?? process.env.ODOO_DB
  const apiKey = config?.apiKey ?? process.env.ODOO_API_KEY

  if (!baseUrl || !db || !apiKey) {
    return null
  }

  const client = new OdooClient({ baseUrl, db, apiKey })

  return {
    productProvider: createOdooProductAdapter(client),
    categoryProvider: createOdooCategoryAdapter(client),
    brandProvider: createOdooBrandAdapter(client),
  }
}

export { OdooClient } from './client'
export type { OdooProduct, OdooCategory, OdooBrand, OdooConfig } from './client'
export { createOdooProductAdapter } from './product-adapter'
export { createOdooCategoryAdapter } from './category-adapter'
export { createOdooBrandAdapter } from './brand-adapter'
