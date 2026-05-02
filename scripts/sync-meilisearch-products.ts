import { productProvider } from '@real/providers'
import type { Product } from '@real/providers/contracts'
import { pathToFileURL } from 'node:url'

type MeilisearchProductDocument = {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  image?: string
  brand?: string
  category?: string
  stock?: number
  reviews?: number
  createdAt: string
  href: string
}

type SyncOptions = {
  dryRun: boolean
  tenantId: string
  storeId: string
  host?: string
  apiKey?: string
  indexName: string
}

export function resolveMeilisearchIndexName(template: string, tenantId: string, storeId: string) {
  return template.replaceAll('{tenantId}', tenantId).replaceAll('{storeId}', storeId)
}

export function toMeilisearchProductDocument(product: Product): MeilisearchProductDocument {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    image: product.image,
    brand: product.brand,
    category: product.category,
    stock: product.stock,
    reviews: product.reviews,
    createdAt: new Date().toISOString(),
    href: `/product/${encodeURIComponent(product.id)}`,
  }
}

export function meilisearchProductSettings() {
  return {
    searchableAttributes: ['name', 'description', 'brand', 'category'],
    filterableAttributes: ['brand', 'category', 'price', 'stock'],
    sortableAttributes: ['price', 'reviews', 'createdAt'],
    typoTolerance: {
      enabled: true,
    },
  }
}

function readOptions(argv: string[]): SyncOptions {
  const dryRun = argv.includes('--dry-run')
  return {
    dryRun,
    tenantId: process.env.TENANT_ID ?? 'default',
    storeId: process.env.STORE_ID ?? 'default',
    host: process.env.MEILISEARCH_HOST,
    apiKey: process.env.MEILISEARCH_API_KEY,
    indexName: process.env.MEILISEARCH_PRODUCTS_INDEX ?? 'products_{tenantId}',
  }
}

function headers(apiKey?: string) {
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  }
}

async function writeJson(host: string, path: string, apiKey: string | undefined, body: unknown) {
  const response = await fetch(`${host.replace(/\/+$/, '')}${path}`, {
    method: 'PUT',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Meilisearch ${path} returned ${response.status}.`)
  }
}

async function postJson(host: string, path: string, apiKey: string | undefined, body: unknown) {
  const response = await fetch(`${host.replace(/\/+$/, '')}${path}`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Meilisearch ${path} returned ${response.status}.`)
  }
}

export async function syncMeilisearchProducts(options: SyncOptions) {
  const productsResult = await productProvider.list({ limit: 10000 })
  if (!productsResult.ok) {
    throw new Error(productsResult.error.message)
  }

  const indexName = resolveMeilisearchIndexName(options.indexName, options.tenantId, options.storeId)
  const documents = productsResult.data.map(toMeilisearchProductDocument)

  if (options.dryRun) {
    return { indexName, documents, dryRun: true }
  }

  if (!options.host) {
    throw new Error('MEILISEARCH_HOST is required unless --dry-run is used.')
  }

  await writeJson(
    options.host,
    `/indexes/${encodeURIComponent(indexName)}/settings`,
    options.apiKey,
    meilisearchProductSettings(),
  )
  await postJson(
    options.host,
    `/indexes/${encodeURIComponent(indexName)}/documents?primaryKey=id`,
    options.apiKey,
    documents,
  )

  return { indexName, documents, dryRun: false }
}

async function main() {
  const result = await syncMeilisearchProducts(readOptions(process.argv.slice(2)))
  console.log(
    `[meilisearch-sync] ${result.dryRun ? 'dry-run ' : ''}indexed ${result.documents.length} products into ${result.indexName}`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((cause) => {
    console.error(`[meilisearch-sync] ${cause instanceof Error ? cause.message : String(cause)}`)
    process.exit(1)
  })
}
