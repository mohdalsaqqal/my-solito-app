import { HttpClient, HttpClientConfig } from '../_shared/http-client'

export type OdooConfig = {
  /** Odoo base URL, e.g. https://erp.example.com */
  baseUrl: string
  /** Odoo database name */
  db: string
  /** API key or session token */
  apiKey: string
}

/**
 * Odoo REST API client.
 *
 * Odoo endpoints (custom REST controller pattern):
 * GET  /api/products       → list products
 * GET  /api/products/:id   → get product
 * GET  /api/categories     → list categories
 * GET  /api/brands         → list brands
 */
export class OdooClient extends HttpClient {
  private db: string

  constructor(config: OdooConfig) {
    super({
      baseUrl: config.baseUrl,
      auth: { type: 'api-key', header: 'X-API-Key', value: config.apiKey },
    })
    this.db = config.db
  }

  // Add Odoo-specific query params (db) to every request
  private addDbParams(url: string): string {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}db=${encodeURIComponent(this.db)}`
  }

  async getProducts(params?: {
    brand?: string[]
    category?: string[]
    ids?: string[]
    onSale?: boolean
    sort?: 'newest' | 'bestseller' | 'price_asc' | 'price_desc'
    limit?: number
  }) {
    const query = new URLSearchParams()
    if (params?.brand?.length) params.brand.forEach((v) => query.append('brand', v))
    if (params?.category?.length) params.category.forEach((v) => query.append('category', v))
    if (params?.ids?.length) params.ids.forEach((v) => query.append('ids', v))
    if (params?.onSale) query.set('on_sale', 'true')
    if (params?.sort) query.set('sort', params.sort)
    if (params?.limit) query.set('limit', String(params.limit))

    const qs = query.toString()
    const url = qs ? this.addDbParams(`/api/products?${qs}`) : this.addDbParams('/api/products')
    return this.get<OdooProduct[]>(url)
  }

  async getProduct(id: string) {
    return this.get<OdooProduct>(this.addDbParams(`/api/products/${encodeURIComponent(id)}`))
  }

  async getCategories() {
    return this.get<OdooCategory[]>(this.addDbParams('/api/categories'))
  }

  async getBrands() {
    return this.get<OdooBrand[]>(this.addDbParams('/api/brands'))
  }
}

// ─── Odoo Data Types ─────────────────────────────────────────────────────────
// These represent the shape of data returned from Odoo's REST API.
// They are DIFFERENT from the provider contracts — this adapter maps Odoo → Provider.

export type OdooProduct = {
  id: number | string
  name: string
  description?: string
  list_price: number         // sale price
  standard_price: number     // cost price (for compare)
  currency_id: { name: string; symbol: string }
  image_url?: string
  rating_avg?: number
  rating_count?: number
  is_new?: boolean
  is_limited?: boolean
  qty_available: number      // available stock
  brand_name?: string
  category_name?: string
  category_slug?: string
  brand_slug?: string
  default_code?: string      // internal reference / SKU
  barcode?: string
  sale_ok?: boolean          // whether product is sellable
  type?: 'product' | 'consu' | 'service'
  create_date?: string
}

export type OdooCategory = {
  id: number | string
  name: string
  name_ar?: string
  slug: string
  parent_id?: number | string
  parent_slug?: string
  image_url?: string
  active: boolean
  sequence: number
  children?: OdooCategory[]
}

export type OdooBrand = {
  id: number | string
  name: string
  name_ar?: string
  slug: string
  logo_url?: string
  description?: string
  description_ar?: string
  active: boolean
}
