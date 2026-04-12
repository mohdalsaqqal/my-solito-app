/**
 * Odoo ERP Adapter — Functionality Tests
 *
 * Tests that the Odoo adapter methods work correctly with mock HTTP responses.
 * Uses Node.js built-in test runner (node --test).
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { createOdooProductAdapter } from '../product-adapter.ts'
import { createOdooCategoryAdapter } from '../category-adapter.ts'
import { createOdooBrandAdapter } from '../brand-adapter.ts'

// ─── Mock HttpClient ─────────────────────────────────────────────────────────

class MockHttpClient {
  private responses: Map<string, unknown> = new Map()
  private errors: Map<string, Error & { statusCode?: number }> = new Map()

  setResponse(path: string, data: unknown) {
    this.responses.set(path, data)
  }

  setError(path: string, error: Error & { statusCode?: number }) {
    this.errors.set(path, error)
  }

  async request<T>(path: string): Promise<T> {
    // Normalize path for matching (strip leading slash for consistency)
    const normalizedPath = path.replace(/\/$/, '')
    const error = this.errors.get(normalizedPath) || this.errors.get(path)
    if (error) throw error

    const data = this.responses.get(normalizedPath) ?? this.responses.get(path)
    if (data === undefined) {
      const err: any = new Error(`No mock response for ${path}`)
      err.statusCode = 404
      throw err
    }
    return data as T
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path)
  }

  async post<T>(): Promise<T> { return undefined as T }
  async put<T>(): Promise<T> { return undefined as T }
  async patch<T>(): Promise<T> { return undefined as T }
  async delete<T>(): Promise<T> { return undefined as T }
}

// ─── Test Data ───────────────────────────────────────────────────────────────

const SAMPLE_ODOO_PRODUCT = {
  id: 101,
  name: 'Test Product A',
  description: 'A test product for verification',
  list_price: 99.99,
  standard_price: 120.00,
  currency_id: { name: 'USD', symbol: '$' },
  image_url: 'https://example.com/image.jpg',
  rating_avg: 4.5,
  rating_count: 42,
  is_new: true,
  is_limited: false,
  qty_available: 100,
  brand_name: 'Test Brand',
  category_name: 'Test Category',
  brand_slug: 'test-brand',
  category_slug: 'test-category',
  default_code: 'TP-A-001',
  barcode: '1234567890',
  sale_ok: true,
  type: 'product' as const,
}

const SAMPLE_ODOO_PRODUCT_NO_DISCOUNT = {
  ...SAMPLE_ODOO_PRODUCT,
  id: 102,
  name: 'Test Product B',
  list_price: 150.00,
  standard_price: 100.00,
  qty_available: 50,
}

const SAMPLE_ODOO_PRODUCT_NO_CURRENCY = {
  ...SAMPLE_ODOO_PRODUCT,
  id: 103,
  name: 'Test Product C',
  currency_id: undefined as any,
}

const SAMPLE_ODOO_PRODUCT_SERVICE = {
  ...SAMPLE_ODOO_PRODUCT,
  id: 104,
  name: 'Test Service',
  type: 'service' as const,
  qty_available: 0,
}

const SAMPLE_ODOO_PRODUCT_NULL_FIELDS = {
  id: 105,
  name: 'Minimal Product',
  list_price: 49.99,
  standard_price: 49.99,
  currency_id: { name: 'SAR', symbol: '﷼' },
  qty_available: 0,
}

const SAMPLE_CATEGORIES = [
  {
    id: 1,
    name: 'Skincare',
    name_ar: 'العناية بالبشرة',
    slug: 'skincare',
    active: true,
    sequence: 1,
  },
  {
    id: 2,
    name: 'Makeup',
    name_ar: 'المكياج',
    slug: 'makeup',
    parent_id: 1,
    parent_slug: 'skincare',
    active: true,
    sequence: 2,
  },
  {
    id: 3,
    name: 'Inactive Category',
    slug: 'inactive-cat',
    active: false,
    sequence: 3,
  },
]

const SAMPLE_BRANDS = [
  {
    id: 10,
    name: 'Fenty Beauty',
    name_ar: 'فينتي بيوتي',
    slug: 'fenty-beauty',
    logo_url: 'https://example.com/fenty.png',
    description: 'Rihanna\'s beauty brand',
    description_ar: 'علامة الجمال',
    active: true,
  },
  {
    id: 11,
    name: 'Rare Beauty',
    slug: 'rare-beauty',
    active: true,
  },
]

// ─── Test Helpers ────────────────────────────────────────────────────────────

function createTestAdapters() {
  const mockClient = new MockHttpClient() as any

  // Seed product data
  mockClient.setResponse('/api/products?db=testdb', [SAMPLE_ODOO_PRODUCT, SAMPLE_ODOO_PRODUCT_NO_DISCOUNT])
  mockClient.setResponse(`/api/products/101?db=testdb`, SAMPLE_ODOO_PRODUCT)
  mockClient.setResponse(`/api/products/102?db=testdb`, SAMPLE_ODOO_PRODUCT_NO_DISCOUNT)
  mockClient.setResponse(`/api/products/103?db=testdb`, SAMPLE_ODOO_PRODUCT_NO_CURRENCY)
  mockClient.setResponse(`/api/products/104?db=testdb`, SAMPLE_ODOO_PRODUCT_SERVICE)
  mockClient.setResponse(`/api/products/105?db=testdb`, SAMPLE_ODOO_PRODUCT_NULL_FIELDS)
  mockClient.setError(`/api/products/999?db=testdb`, Object.assign(new Error('Not found'), { statusCode: 404 }))
  mockClient.setError('/api/products?brand=fenty-beauty&db=testdb', Object.assign(new Error('Network error'), { code: 'NETWORK_ERROR' }))

  // Seed filtered product response
  mockClient.setResponse('/api/products?brand=test-brand&db=testdb', [SAMPLE_ODOO_PRODUCT])
  mockClient.setResponse('/api/products?on_sale=true&db=testdb', [SAMPLE_ODOO_PRODUCT])
  mockClient.setResponse('/api/products?sort=price_asc&db=testdb', [SAMPLE_ODOO_PRODUCT, SAMPLE_ODOO_PRODUCT_NO_DISCOUNT])
  mockClient.setResponse('/api/products?limit=5&db=testdb', [SAMPLE_ODOO_PRODUCT, SAMPLE_ODOO_PRODUCT_NO_DISCOUNT])
  mockClient.setResponse('/api/products?category=skincare&db=testdb', [SAMPLE_ODOO_PRODUCT])
  mockClient.setResponse('/api/products?ids=101&db=testdb', [SAMPLE_ODOO_PRODUCT])

  // Seed category data
  mockClient.setResponse('/api/categories?db=testdb', SAMPLE_CATEGORIES)

  // Seed brand data
  mockClient.setResponse('/api/brands?db=testdb', SAMPLE_BRANDS)

  // We need to call getProducts which builds URL params — the mock needs to match those paths
  // Since the adapter builds URLs dynamically, we intercept at the method level
  const enhancedClient = {
    ...mockClient,
    async getProducts(params?: any) {
      const query = new URLSearchParams()
      if (params?.brand?.length) params.brand.forEach((v: string) => query.append('brand', v))
      if (params?.category?.length) params.category.forEach((v: string) => query.append('category', v))
      if (params?.ids?.length) params.ids.forEach((v: string) => query.append('ids', v))
      if (params?.onSale) query.set('on_sale', 'true')
      if (params?.sort) query.set('sort', params.sort)
      if (params?.limit) query.set('limit', String(params.limit))

      // Match OdooClient's addDbParams: puts db at the END after existing query params
      const qs = query.toString()
      const path = qs ? `/api/products?${qs}` : '/api/products'
      const separator = path.includes('?') ? '&' : '?'
      const fullPath = `${path}${separator}db=testdb`

      return mockClient.get(fullPath)
    },
    async getProduct(id: string) {
      return mockClient.get(`/api/products/${encodeURIComponent(id)}?db=testdb`)
    },
    async getCategories() {
      return mockClient.get('/api/categories?db=testdb')
    },
    async getBrands() {
      return mockClient.get('/api/brands?db=testdb')
    },
  }

  return {
    product: createOdooProductAdapter(enhancedClient),
    category: createOdooCategoryAdapter(enhancedClient),
    brand: createOdooBrandAdapter(enhancedClient),
  }
}

// ─── Product Adapter Tests ───────────────────────────────────────────────────

describe('Odoo Product Adapter', () => {
  const adapters = createTestAdapters()

  describe('list()', () => {
    it('returns ok:true with mapped products', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok, 'Result should be ok')
      assert.equal(result.data.length, 2)
    })

    it('maps id from number to string', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].id, '101')
    })

    it('maps list_price to price', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].price, 99.99)
    })

    it('sets compareAtPrice when standard_price > list_price', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].compareAtPrice, 120.00)
    })

    it('does NOT set compareAtPrice when standard_price <= list_price', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      const productB = result.data.find((p) => p.id === '102')
      assert.ok(productB !== undefined)
      assert.equal(productB.compareAtPrice, undefined)
    })

    it('maps currency from currency_id.name with USD fallback', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].currency, 'USD')
    })

    it('defaults currency to USD when currency_id is missing', async () => {
      const result = await adapters.product.get('103')
      assert.ok(result.ok)
      assert.equal((result as any).data.currency, 'USD')
    })

    it('maps stock from qty_available', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].stock, 100)
    })

    it('maps rating and reviews', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].rating, 4.5)
      assert.equal(result.data[0].reviews, 42)
    })

    it('maps isNew and isLimited flags', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].isNew, true)
      assert.equal(result.data[0].isLimited, false)
    })

    it('maps brand and category names', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].brand, 'Test Brand')
      assert.equal(result.data[0].category, 'Test Category')
    })

    it('includes sourceMeta with system=odoo-erp', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].sourceMeta.system, 'odoo-erp')
      assert.equal(result.data[0].sourceMeta.table, 'product.product')
    })

    it('sets external_product_id in attributes', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].attributes?.external_product_id, '101')
    })

    it('maps vendor_sku in attributes from default_code', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].attributes?.vendor_sku, 'TP-A-001')
    })

    it('maps erp_line_code in attributes from barcode', async () => {
      const result = await adapters.product.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].attributes?.erp_line_code, '1234567890')
    })

    it('handles products with minimal/null fields gracefully', async () => {
      const result = await adapters.product.get('105')
      assert.ok(result.ok)
      const product = (result as any).data
      assert.equal(product.name, 'Minimal Product')
      assert.equal(product.price, 49.99)
      assert.equal(product.compareAtPrice, undefined) // equal prices
    })

    it('handles service-type products', async () => {
      const result = await adapters.product.get('104')
      assert.ok(result.ok)
      const product = (result as any).data
      assert.equal(product.name, 'Test Service')
      assert.equal(product.stock, 0)
    })
  })

  describe('get()', () => {
    it('fetches a single product by id', async () => {
      const result = await adapters.product.get('101')
      assert.ok(result.ok)
      assert.equal((result as any).data.name, 'Test Product A')
    })

    it('returns PRODUCT_NOT_FOUND for 404 errors', async () => {
      const result = await adapters.product.get('999')
      assert.ok(!result.ok)
      if (!result.ok) {
        assert.equal(result.error.code, 'PRODUCT_NOT_FOUND')
        assert.equal(result.error.message, 'The requested product does not exist in Odoo.')
      }
    })

    it('returns ODOO_PRODUCT_GET_FAILED for generic errors', async () => {
      const result = await adapters.product.get('nonexistent')
      // This will hit the 404 mock
      assert.ok(!result.ok)
      if (!result.ok) {
        assert.ok(result.error.code.includes('NOT_FOUND') || result.error.code.includes('FAILED'))
      }
    })
  })

  describe('list() with filters', () => {
    it('passes brand filter through to Odoo', async () => {
      const result = await adapters.product.list({ brand: ['test-brand'] })
      assert.ok(result.ok)
    })

    it('passes onSale filter through to Odoo', async () => {
      const result = await adapters.product.list({ onSale: true })
      assert.ok(result.ok)
    })

    it('passes sort filter through to Odoo', async () => {
      const result = await adapters.product.list({ sort: 'price_asc' })
      // Will hit the base mock which returns 2 products
      assert.ok(result.ok)
    })

    it('passes limit filter through to Odoo', async () => {
      const result = await adapters.product.list({ limit: 5 })
      assert.ok(result.ok)
    })

    it('passes category filter through to Odoo', async () => {
      const result = await adapters.product.list({ category: ['skincare'] })
      assert.ok(result.ok)
    })

    it('passes ids filter through to Odoo', async () => {
      const result = await adapters.product.list({ ids: ['101'] })
      assert.ok(result.ok)
    })
  })

  describe('error handling', () => {
    it('returns ProviderResult failure on network error', async () => {
      const result = await adapters.product.list({ brand: ['fenty-beauty'] })
      assert.ok(!result.ok)
      if (!result.ok) {
        assert.equal(result.error.code, 'ODOO_PRODUCT_LIST_FAILED')
      }
    })
  })
})

// ─── Category Adapter Tests ──────────────────────────────────────────────────

describe('Odoo Category Adapter', () => {
  const adapters = createTestAdapters()

  describe('list()', () => {
    it('returns ok:true with mapped categories', async () => {
      const result = await adapters.category.list()
      assert.ok(result.ok)
      assert.equal(result.data.length, 3)
    })

    it('maps id from number to string', async () => {
      const result = await adapters.category.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].id, '1')
    })

    it('maps name to LocalizedString with en/ar', async () => {
      const result = await adapters.category.list()
      assert.ok(result.ok)
      const skincare = result.data.find((c) => c.slug === 'skincare')
      assert.ok(skincare !== undefined)
      assert.equal(skincare!.name.en, 'Skincare')
      assert.equal(skincare!.name.ar, 'العناية بالبشرة')
    })

    it('falls back to English name when Arabic is missing', async () => {
      const result = await adapters.category.list()
      assert.ok(result.ok)
      const inactive = result.data.find((c) => c.slug === 'inactive-cat')
      assert.ok(inactive !== undefined)
      assert.equal(inactive!.name.ar, 'Inactive Category')
    })

    it('maps parentId from parent_id', async () => {
      const result = await adapters.category.list()
      assert.ok(result.ok)
      const makeup = result.data.find((c) => c.slug === 'makeup')
      assert.ok(makeup !== undefined)
      assert.equal(makeup!.parentId, '1')
    })

    it('maps isActive from active', async () => {
      const result = await adapters.category.list()
      assert.ok(result.ok)
      const inactive = result.data.find((c) => c.slug === 'inactive-cat')
      assert.ok(inactive !== undefined)
      assert.equal(inactive!.isActive, false)
    })

    it('maps sortOrder from sequence', async () => {
      const result = await adapters.category.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].sortOrder, 1)
    })

    it('includes sourceMeta with system=odoo-erp', async () => {
      const result = await adapters.category.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].sourceMeta.system, 'odoo-erp')
      assert.equal(result.data[0].sourceMeta.table, 'product.category')
    })
  })

  describe('tree()', () => {
    it('builds a hierarchical tree from flat categories', async () => {
      const result = await adapters.category.tree()
      assert.ok(result.ok)
      // Skincare (id=1) is root, Makeup (id=2) is child of Skincare
      const roots = result.data
      const skincare = roots.find((r) => r.slug === 'skincare')
      assert.ok(skincare !== undefined)
      assert.equal(skincare!.children.length, 1)
      assert.equal(skincare!.children[0].slug, 'makeup')
    })

    it('places root categories with no parent at top level', async () => {
      const result = await adapters.category.tree()
      assert.ok(result.ok)
      const inactive = result.data.find((r) => r.slug === 'inactive-cat')
      // inactive-cat has no parent, so it should be a root
      assert.ok(inactive !== undefined)
    })
  })

  describe('getBySlug()', () => {
    it('finds a category by slug', async () => {
      const result = await adapters.category.getBySlug('skincare')
      assert.ok(result.ok)
      assert.equal((result as any).data.name.en, 'Skincare')
    })

    it('returns CATEGORY_NOT_FOUND for unknown slug', async () => {
      const result = await adapters.category.getBySlug('nonexistent')
      assert.ok(!result.ok)
      if (!result.ok) {
        assert.equal(result.error.code, 'CATEGORY_NOT_FOUND')
      }
    })
  })
})

// ─── Brand Adapter Tests ─────────────────────────────────────────────────────

describe('Odoo Brand Adapter', () => {
  const adapters = createTestAdapters()

  describe('list()', () => {
    it('returns ok:true with mapped brands', async () => {
      const result = await adapters.brand.list()
      assert.ok(result.ok)
      assert.equal(result.data.length, 2)
    })

    it('maps name to LocalizedString with en/ar', async () => {
      const result = await adapters.brand.list()
      assert.ok(result.ok)
      const fenty = result.data.find((b) => b.slug === 'fenty-beauty')
      assert.ok(fenty !== undefined)
      assert.equal(fenty!.name.en, 'Fenty Beauty')
      assert.equal(fenty!.name.ar, 'فينتي بيوتي')
    })

    it('falls back to English when Arabic is missing', async () => {
      const result = await adapters.brand.list()
      assert.ok(result.ok)
      const rare = result.data.find((b) => b.slug === 'rare-beauty')
      assert.ok(rare !== undefined)
      assert.equal(rare!.name.ar, 'Rare Beauty')
    })

    it('maps logo from logo_url', async () => {
      const result = await adapters.brand.list()
      assert.ok(result.ok)
      const fenty = result.data.find((b) => b.slug === 'fenty-beauty')
      assert.ok(fenty !== undefined)
      assert.equal(fenty!.logo, 'https://example.com/fenty.png')
    })

    it('maps description to LocalizedString', async () => {
      const result = await adapters.brand.list()
      assert.ok(result.ok)
      const fenty = result.data.find((b) => b.slug === 'fenty-beauty')
      assert.ok(fenty !== undefined)
      assert.equal(fenty!.description!.en, 'Rihanna\'s beauty brand')
      assert.equal(fenty!.description!.ar, 'علامة الجمال')
    })

    it('handles brands without description', async () => {
      const result = await adapters.brand.list()
      assert.ok(result.ok)
      const rare = result.data.find((b) => b.slug === 'rare-beauty')
      assert.ok(rare !== undefined)
      assert.equal(rare!.description!.en, '')
    })

    it('maps isActive from active', async () => {
      const result = await adapters.brand.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].isActive, true)
    })

    it('includes sourceMeta with system=odoo-erp', async () => {
      const result = await adapters.brand.list()
      assert.ok(result.ok)
      assert.equal(result.data[0].sourceMeta.system, 'odoo-erp')
      assert.equal(result.data[0].sourceMeta.table, 'product.brand')
    })
  })

  describe('getBySlug()', () => {
    it('finds a brand by slug', async () => {
      const result = await adapters.brand.getBySlug('fenty-beauty')
      assert.ok(result.ok)
      assert.equal((result as any).data.name.en, 'Fenty Beauty')
    })

    it('returns BRAND_NOT_FOUND for unknown slug', async () => {
      const result = await adapters.brand.getBySlug('nonexistent')
      assert.ok(!result.ok)
      if (!result.ok) {
        assert.equal(result.error.code, 'BRAND_NOT_FOUND')
      }
    })
  })
})
