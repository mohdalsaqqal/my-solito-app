import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    console.error(`[postgresql-mapping] FAIL missing ${relativePath}`)
    process.exit(1)
  }
  return readFileSync(fullPath, 'utf8')
}

function assert(label, condition) {
  if (!condition) {
    console.error(`[postgresql-mapping] FAIL ${label}`)
    process.exit(1)
  }
  console.log(`[postgresql-mapping] PASS ${label}`)
}

const runbook = read('docs/delivery/runbooks/custom-postgresql-adapter-mapping.md')
const envExample = read('.env.example')
const catalogContracts = read('packages/providers/contracts/CatalogProviders.ts')
const orderContract = read('packages/providers/contracts/OrderProvider.ts')

assert('runbook defines provider registry architecture', /Provider registry[\s\S]*Custom PostgreSQL adapter/.test(runbook))
assert('runbook keeps adapter under packages/adapters/postgresql', /packages\/adapters\/postgresql/.test(runbook))
assert('runbook documents merchant postgres env vars', /MERCHANT_POSTGRES_URL/.test(runbook))
assert('runbook maps product fields', /Canonical Product Mapping/.test(runbook) && /sourceMeta\.externalId/.test(runbook))
assert('runbook maps categories', /Category Mapping/.test(runbook))
assert('runbook maps brands', /Brand Mapping/.test(runbook))
assert('runbook covers order write-back', /OrderProvider\.place/.test(runbook))
assert('runbook covers idempotency unique key', /tenantId \+ idempotencyKey/.test(runbook))
assert('runbook requires parameterized SQL', /parameterized SQL/.test(runbook))
assert('runbook covers read-only merchant DB behavior', /read-only/.test(runbook))

assert('env example documents MERCHANT_POSTGRES_URL', /MERCHANT_POSTGRES_URL/.test(envExample))
assert('env example documents MERCHANT_POSTGRES_SCHEMA', /MERCHANT_POSTGRES_SCHEMA/.test(envExample))
assert('env example documents MERCHANT_POSTGRES_SSL', /MERCHANT_POSTGRES_SSL/.test(envExample))
assert('env example documents MERCHANT_POSTGRES_READONLY', /MERCHANT_POSTGRES_READONLY/.test(envExample))

assert('ProductQueryProvider contract exists', /interface ProductQueryProvider/.test(catalogContracts))
assert('CategoryProvider contract exists', /interface CategoryProvider/.test(catalogContracts))
assert('BrandProvider contract exists', /interface BrandProvider/.test(catalogContracts))
assert('OrderProvider contract exposes place', /place\?\(input:\s*PlaceOrderInput\)/.test(orderContract))

console.log('[postgresql-mapping] All checks passed')
