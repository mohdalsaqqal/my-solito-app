import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createMeilisearchSearchAdapter } from './index'

test('meilisearch adapter searches configured tenant index and normalizes payload', async () => {
  const originalFetch = globalThis.fetch
  const requests: Array<{ url: string; body?: string }> = []

  globalThis.fetch = async (input, init) => {
    requests.push({
      url: String(input),
      body: typeof init?.body === 'string' ? init.body : undefined,
    })

    return new Response(
      JSON.stringify({
        estimatedTotalHits: 1,
        processingTimeMs: 7,
        facetDistribution: {
          brand: { 'Real Beauty': 1 },
          category: { Serum: 1 },
        },
        facetStats: {
          price: { min: 19, max: 19 },
        },
        hits: [
          {
            id: 'variant-1',
            name: 'Glow Serum',
            description: 'Brightening serum',
            price: 19,
            currency: 'USD',
            image_url: 'https://cdn.example.com/glow.jpg',
            brand_name: 'Real Beauty',
            category: 'Serum',
            compare_at_price: 25,
            discount_label: '24% off',
          },
        ],
      }),
      { status: 200 },
    )
  }

  try {
    const adapter = createMeilisearchSearchAdapter({
      host: 'https://search.example.com/',
      apiKey: 'secret',
      indexName: 'products_{tenantId}',
    })

    const result = await adapter.search(
      {
        query: 'glow',
        locale: 'en',
        storeId: 'store-1',
        filters: { brands: ['Real Beauty'], categories: ['Serum'], minPrice: 10, maxPrice: 30, inStock: true },
        sort: 'price_asc',
      },
      { tenantId: 'tenant-1', storeId: 'store-1' },
    )

    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(requests[0]?.url, 'https://search.example.com/indexes/products_tenant-1/search')
    const requestBody = JSON.parse(requests[0]?.body ?? '{}')
    assert.equal(requestBody.q, 'glow')
    assert.deepEqual(requestBody.sort, ['price:asc'])
    assert.deepEqual(requestBody.filter, [
      'brand IN ["Real Beauty"]',
      'category IN ["Serum"]',
      'price >= 10',
      'price <= 30',
      'stock > 0',
    ])
    assert.ok(requestBody.facets.includes('brand'))
    assert.ok(requestBody.facets.includes('price'))
    assert.equal(result.data.products[0]?.id, 'variant-1')
    assert.equal(result.data.products[0]?.name, 'Glow Serum')
    assert.equal(result.data.suggestions[0]?.type, 'product')
    assert.equal(result.data.suggestions[0]?.brandName, 'Real Beauty')
    assert.equal(result.data.popularBrands[0], 'Real Beauty')
    assert.equal(result.data.facets?.brands[0]?.value, 'Real Beauty')
    assert.equal(result.data.facets?.categories[0]?.value, 'Serum')
    assert.equal(result.data.facets?.price?.min, 19)
    assert.equal(result.data.meta?.totalHits, 1)
    assert.equal(result.data.meta?.processingTimeMs, 7)
    assert.equal(result.data.meta?.indexName, 'products_tenant-1')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('meilisearch adapter exposes health for configured index', async () => {
  const originalFetch = globalThis.fetch

  const requests: string[] = []
  globalThis.fetch = async (input) => {
    requests.push(String(input))
    if (String(input).endsWith('/health')) {
      return new Response(JSON.stringify({ status: 'available' }), { status: 200 })
    }
    return new Response(
      JSON.stringify({
        filterableAttributes: ['brand', 'category', 'price', 'stock'],
        sortableAttributes: ['price', 'reviews', 'createdAt'],
        typoTolerance: { enabled: true },
      }),
      { status: 200 },
    )
  }

  try {
    const adapter = createMeilisearchSearchAdapter({
      host: 'https://search.example.com',
      indexName: 'products_{storeId}',
    })

    const result = await adapter.health?.({ tenantId: 'tenant-1', storeId: 'store-1' })

    assert.equal(result?.ok, true)
    if (!result?.ok) return
    assert.equal(requests[0], 'https://search.example.com/health')
    assert.equal(requests[1], 'https://search.example.com/indexes/products_store-1/settings')
    assert.equal(result.data.indexName, 'products_store-1')
    assert.equal(result.data.indexed, true)
    assert.deepEqual(result.data.filterableAttributes, ['brand', 'category', 'price', 'stock'])
    assert.deepEqual(result.data.sortableAttributes, ['price', 'reviews', 'createdAt'])
    assert.equal(result.data.typoToleranceEnabled, true)
  } finally {
    globalThis.fetch = originalFetch
  }
})
