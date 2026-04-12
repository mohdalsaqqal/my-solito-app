/**
 * Odoo ERP Adapter — Data Mapping Tests
 *
 * Verifies that Odoo data types are correctly mapped to provider contracts.
 * Tests edge cases, null handling, currency defaults, and metadata population.
 * Uses Node.js built-in test runner (node --test).
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

// ─── Mock HttpClient (same as functionality tests) ──────────────────────────

class MockHttpClient {
  private responses: Map<string, unknown> = new Map()

  setResponse(path: string, data: unknown) {
    this.responses.set(path, data)
  }

  async get<T>(path: string): Promise<T> {
    const data = this.responses.get(path)
    if (data === undefined) {
      const err: any = new Error(`No mock for ${path}`)
      err.statusCode = 404
      throw err
    }
    return data as T
  }

  async post<T>(): Promise<T> { return undefined as T }
  async put<T>(): Promise<T> { return undefined as T }
  async patch<T>(): Promise<T> { return undefined as T }
  async delete<T>(): Promise<T> { return undefined as T }
  async request<T>(path: string): Promise<T> {
    return this.get(path)
  }
}

// ─── Import adapters dynamically ─────────────────────────────────────────────
// We import after defining the mock to ensure the test is self-contained.

import { createOdooProductAdapter } from '../product-adapter.ts'
import { createOdooCategoryAdapter } from '../category-adapter.ts'
import { createOdooBrandAdapter } from '../brand-adapter.ts'

function createEnhancedClient(mockClient: MockHttpClient) {
  return {
    ...mockClient,
    async getProducts(_params?: any) {
      return mockClient.get('/api/products?db=testdb')
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
}

// ─── Data Mapping Tests ──────────────────────────────────────────────────────

describe('Odoo → Canonical Data Mapping', () => {
  describe('Product ID mapping', () => {
    it('maps numeric Odoo id to string canonical id', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/101?db=testdb', {
        id: 101,
        name: 'Numeric ID Product',
        list_price: 50,
        standard_price: 60,
        currency_id: { name: 'USD', symbol: '$' },
        qty_available: 10,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('101')

      assert.ok(result.ok)
      const data = (result as any).data
      assert.equal(typeof data.id, 'string')
      assert.equal(data.id, '101')
    })

    it('maps string Odoo id to string canonical id', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/abc-123?db=testdb', {
        id: 'abc-123',
        name: 'String ID Product',
        list_price: 25,
        standard_price: 25,
        currency_id: { name: 'EUR', symbol: '€' },
        qty_available: 5,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('abc-123')

      assert.ok(result.ok)
      const data = (result as any).data
      assert.equal(data.id, 'abc-123')
      assert.equal(typeof data.id, 'string')
    })
  })

  describe('Price mapping', () => {
    it('maps list_price to price', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'Price Test',
        list_price: 75.50,
        standard_price: 90,
        currency_id: { name: 'USD' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      assert.equal((result as any).data.price, 75.50)
    })

    it('sets compareAtPrice when standard_price > list_price', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'On Sale',
        list_price: 80,
        standard_price: 100,
        currency_id: { name: 'USD' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      assert.equal((result as any).data.compareAtPrice, 100)
    })

    it('does NOT set compareAtPrice when standard_price === list_price', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/2?db=testdb', {
        id: 2,
        name: 'Regular Price',
        list_price: 50,
        standard_price: 50,
        currency_id: { name: 'USD' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('2')

      assert.ok(result.ok)
      assert.equal((result as any).data.compareAtPrice, undefined)
    })

    it('does NOT set compareAtPrice when standard_price < list_price', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/3?db=testdb', {
        id: 3,
        name: 'Marked Up',
        list_price: 120,
        standard_price: 80,
        currency_id: { name: 'USD' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('3')

      assert.ok(result.ok)
      assert.equal((result as any).data.compareAtPrice, undefined)
    })
  })

  describe('Currency mapping', () => {
    it('uses currency_id.name when present', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'SAR Product',
        list_price: 100,
        standard_price: 100,
        currency_id: { name: 'SAR', symbol: '﷼' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      assert.equal((result as any).data.currency, 'SAR')
    })

    it('defaults to USD when currency_id is undefined', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'No Currency',
        list_price: 100,
        standard_price: 100,
        currency_id: undefined,
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      assert.equal((result as any).data.currency, 'USD')
    })

    it('defaults to USD when currency_id.name is missing', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'Missing Name',
        list_price: 100,
        standard_price: 100,
        currency_id: { symbol: '$' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      assert.equal((result as any).data.currency, 'USD')
    })
  })

  describe('Stock mapping', () => {
    it('maps qty_available to stock', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'Stocky',
        list_price: 10,
        standard_price: 10,
        currency_id: { name: 'USD' },
        qty_available: 42,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      assert.equal((result as any).data.stock, 42)
    })

    it('handles zero stock', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'Out of Stock',
        list_price: 10,
        standard_price: 10,
        currency_id: { name: 'USD' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      assert.equal((result as any).data.stock, 0)
    })
  })

  describe('Category LocalizedString mapping', () => {
    it('maps name/name_ar to LocalizedString {en, ar}', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/categories?db=testdb', [
        {
          id: 1,
          name: 'Perfumes',
          name_ar: 'العطور',
          slug: 'perfumes',
          active: true,
          sequence: 1,
        },
      ])

      const adapter = createOdooCategoryAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      const cat = result.data[0]
      assert.equal(cat.name.en, 'Perfumes')
      assert.equal(cat.name.ar, 'العطور')
    })

    it('falls back to English name when name_ar is absent', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/categories?db=testdb', [
        {
          id: 1,
          name: 'Only English',
          slug: 'only-en',
          active: true,
          sequence: 1,
        },
      ])

      const adapter = createOdooCategoryAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      const cat = result.data[0]
      assert.equal(cat.name.ar, 'Only English')
    })
  })

  describe('Brand LocalizedString mapping', () => {
    it('maps name/name_ar to LocalizedString {en, ar}', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/brands?db=testdb', [
        {
          id: 10,
          name: 'Maybelline',
          name_ar: 'ميبيلين',
          slug: 'maybelline',
          logo_url: 'https://example.com/maybelline.png',
          active: true,
        },
      ])

      const adapter = createOdooBrandAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      const brand = result.data[0]
      assert.equal(brand.name.en, 'Maybelline')
      assert.equal(brand.name.ar, 'ميبيلين')
    })

    it('maps logo_url to logo', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/brands?db=testdb', [
        {
          id: 10,
          name: 'Logo Brand',
          slug: 'logo-brand',
          logo_url: 'https://cdn.example.com/logo.png',
          active: true,
        },
      ])

      const adapter = createOdooBrandAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      assert.equal(result.data[0].logo, 'https://cdn.example.com/logo.png')
    })

    it('maps description to LocalizedString with fallback', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/brands?db=testdb', [
        {
          id: 10,
          name: 'Desc Brand',
          slug: 'desc-brand',
          description: 'English description',
          description_ar: 'الوصف العربي',
          active: true,
        },
      ])

      const adapter = createOdooBrandAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      const brand = result.data[0]
      assert.equal(brand.description!.en, 'English description')
      assert.equal(brand.description!.ar, 'الوصف العربي')
    })

    it('handles missing description gracefully', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/brands?db=testdb', [
        {
          id: 10,
          name: 'No Desc',
          slug: 'no-desc',
          active: true,
        },
      ])

      const adapter = createOdooBrandAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      const brand = result.data[0]
      assert.equal(brand.description!.en, '')
      assert.equal(brand.description!.ar, '')
    })
  })

  describe('Canonical metadata', () => {
    it('sets sourceMeta.system to odoo-erp for products', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'Meta Test',
        list_price: 10,
        standard_price: 10,
        currency_id: { name: 'USD' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      const data = (result as any).data
      assert.equal(data.sourceMeta.system, 'odoo-erp')
      assert.equal(data.sourceMeta.table, 'product.product')
      assert.ok(data.sourceMeta.schemaVersion)
      assert.ok(data.sourceMeta.syncedAt)
    })

    it('sets sourceMeta.system to odoo-erp for categories', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/categories?db=testdb', [
        { id: 1, name: 'Cat', slug: 'cat', active: true, sequence: 1 },
      ])

      const adapter = createOdooCategoryAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      assert.equal(result.data[0].sourceMeta.system, 'odoo-erp')
      assert.equal(result.data[0].sourceMeta.table, 'product.category')
    })

    it('sets sourceMeta.system to odoo-erp for brands', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/brands?db=testdb', [
        { id: 1, name: 'Brand', slug: 'brand', active: true },
      ])

      const adapter = createOdooBrandAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      assert.equal(result.data[0].sourceMeta.system, 'odoo-erp')
      assert.equal(result.data[0].sourceMeta.table, 'product.brand')
    })

    it('populates mappedColumns in sourceMeta', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'Cols Test',
        list_price: 10,
        standard_price: 10,
        currency_id: { name: 'USD' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      const data = (result as any).data
      assert.ok(Array.isArray(data.sourceMeta.mappedColumns))
      assert.ok(data.sourceMeta.mappedColumns.length > 0)
    })

    it('sets externalId in sourceMeta', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/42?db=testdb', {
        id: 42,
        name: 'External ID Test',
        list_price: 10,
        standard_price: 10,
        currency_id: { name: 'USD' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('42')

      assert.ok(result.ok)
      const data = (result as any).data
      assert.equal(data.sourceMeta.externalId, '42')
    })
  })

  describe('Null/undefined field handling', () => {
    it('handles product with all optional fields missing', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'Bare Minimum',
        list_price: 5,
        standard_price: 5,
        currency_id: { name: 'USD' },
        qty_available: 0,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      const data = (result as any).data
      assert.equal(data.description, undefined)
      assert.equal(data.image, undefined)
      assert.equal(data.rating, undefined)
      assert.equal(data.reviews, undefined)
      assert.equal(data.isNew, undefined)
      assert.equal(data.isLimited, undefined)
      assert.equal(data.brand, undefined)
      assert.equal(data.category, undefined)
    })

    it('handles category without parent_id', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/categories?db=testdb', [
        { id: 1, name: 'Root', slug: 'root', active: true, sequence: 1 },
      ])

      const adapter = createOdooCategoryAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      assert.equal(result.data[0].parentId, undefined)
    })

    it('handles brand without logo_url', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/brands?db=testdb', [
        { id: 1, name: 'No Logo', slug: 'no-logo', active: true },
      ])

      const adapter = createOdooBrandAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      assert.equal(result.data[0].logo, undefined)
    })
  })

  describe('Non-sale product types', () => {
    it('handles type=service products', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'Consultation Service',
        description: 'A 30-min consultation',
        list_price: 200,
        standard_price: 0,
        currency_id: { name: 'SAR' },
        qty_available: 0,
        type: 'service',
        sale_ok: false,
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      const data = (result as any).data
      assert.equal(data.name, 'Consultation Service')
      assert.equal(data.price, 200)
      assert.equal(data.stock, 0)
      // compareAtPrice should not be set (standard_price 0 < list_price 200)
      assert.equal(data.compareAtPrice, undefined)
    })

    it('handles type=consu products', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products/1?db=testdb', {
        id: 1,
        name: 'Consumable',
        list_price: 15,
        standard_price: 8,
        currency_id: { name: 'USD' },
        qty_available: 500,
        type: 'consu',
      })

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.get('1')

      assert.ok(result.ok)
      assert.equal((result as any).data.name, 'Consumable')
    })
  })

  describe('List → multiple products mapping', () => {
    it('maps all products in a list response', async () => {
      const mock = new MockHttpClient()
      mock.setResponse('/api/products?db=testdb', [
        { id: 1, name: 'Product One', list_price: 10, standard_price: 15, currency_id: { name: 'USD' }, qty_available: 100 },
        { id: 2, name: 'Product Two', list_price: 20, standard_price: 20, currency_id: { name: 'EUR' }, qty_available: 0 },
        { id: 3, name: 'Product Three', list_price: 30, standard_price: 25, currency_id: { name: 'SAR' }, qty_available: 5 },
      ])

      const adapter = createOdooProductAdapter(createEnhancedClient(mock) as any)
      const result = await adapter.list()

      assert.ok(result.ok)
      assert.equal(result.data.length, 3)

      // Product One: compareAtPrice set (15 > 10)
      assert.equal(result.data[0].compareAtPrice, 15)
      assert.equal(result.data[0].currency, 'USD')

      // Product Two: no compareAtPrice (20 === 20)
      assert.equal(result.data[1].compareAtPrice, undefined)
      assert.equal(result.data[1].currency, 'EUR')

      // Product Three: no compareAtPrice (25 < 30)
      assert.equal(result.data[2].compareAtPrice, undefined)
      assert.equal(result.data[2].currency, 'SAR')
    })
  })
})
