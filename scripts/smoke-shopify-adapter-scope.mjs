import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    console.error(`[shopify-scope] FAIL missing ${relativePath}`)
    process.exit(1)
  }
  return readFileSync(fullPath, 'utf8')
}

function assert(label, condition) {
  if (!condition) {
    console.error(`[shopify-scope] FAIL ${label}`)
    process.exit(1)
  }
  console.log(`[shopify-scope] PASS ${label}`)
}

const runbook = read('docs/delivery/runbooks/shopify-adapter-scope.md')
const envExample = read('.env.example')
const catalogContracts = read('packages/providers/contracts/CatalogProviders.ts')
const orderContract = read('packages/providers/contracts/OrderProvider.ts')

assert('runbook defines provider registry architecture', /Provider registry[\s\S]*Shopify adapter/.test(runbook))
assert('runbook keeps Shopify under packages/adapters/shopify', /packages\/adapters\/shopify/.test(runbook))
assert('runbook documents Shopify env vars', /SHOPIFY_STORE_DOMAIN/.test(runbook) && /SHOPIFY_ADMIN_ACCESS_TOKEN/.test(runbook))
assert('runbook maps products and variants', /variant\.id[\s\S]*variant external ID/.test(runbook))
assert('runbook maps collections to categories', /collections map to canonical categories/.test(runbook))
assert('runbook maps vendors to brands', /vendors map to brands/.test(runbook))
assert('runbook covers OrderProvider.place write-back', /OrderProvider\.place/.test(runbook))
assert('runbook covers idempotency', /idempotency/i.test(runbook))
assert('runbook covers webhook signature verification', /SHOPIFY_WEBHOOK_SECRET/.test(runbook) && /verify/.test(runbook))
assert('runbook covers pagination and rate limits', /Pagination And Rate Limits/.test(runbook))

assert('env example documents SHOPIFY_STORE_DOMAIN', /SHOPIFY_STORE_DOMAIN/.test(envExample))
assert('env example documents SHOPIFY_ADMIN_ACCESS_TOKEN', /SHOPIFY_ADMIN_ACCESS_TOKEN/.test(envExample))
assert('env example documents SHOPIFY_ADMIN_API_VERSION', /SHOPIFY_ADMIN_API_VERSION/.test(envExample))
assert('env example documents SHOPIFY_WEBHOOK_SECRET', /SHOPIFY_WEBHOOK_SECRET/.test(envExample))

assert('ProductQueryProvider contract exists', /interface ProductQueryProvider/.test(catalogContracts))
assert('CategoryProvider contract exists', /interface CategoryProvider/.test(catalogContracts))
assert('BrandProvider contract exists', /interface BrandProvider/.test(catalogContracts))
assert('OrderProvider contract exposes place', /place\?\(input:\s*PlaceOrderInput\)/.test(orderContract))

console.log('[shopify-scope] All checks passed')
