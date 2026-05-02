import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const args = new Set(process.argv.slice(2))
const HEALTH = args.has('--health')
const FULL = args.has('--full')

function log(message) {
  console.log(`[odoo-smoke] ${message}`)
}

function fail(message) {
  console.error(`[odoo-smoke] FAIL: ${message}`)
  process.exitCode = 1
}

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    fail(`missing ${relativePath}`)
    return ''
  }
  return readFileSync(fullPath, 'utf8')
}

function assert(label, condition) {
  if (!condition) {
    fail(label)
    return
  }
  log(`PASS ${label}`)
}

// ── Step 0: Topology check ────────────────────────────────────────────────

log('Step 0: topology check')

const odooIndex = existsSync(join(rootDir, 'packages', 'adapters', 'odoo-erp', 'index.ts'))
const odooClient = existsSync(join(rootDir, 'packages', 'adapters', 'odoo-erp', 'client.ts'))
const odooProduct = existsSync(join(rootDir, 'packages', 'adapters', 'odoo-erp', 'product-adapter.ts'))
const odooCategory = existsSync(join(rootDir, 'packages', 'adapters', 'odoo-erp', 'category-adapter.ts'))
const odooBrand = existsSync(join(rootDir, 'packages', 'adapters', 'odoo-erp', 'brand-adapter.ts'))
const providerRegistry = read('packages/providers/registry.ts')
const catalogContracts = read('packages/providers/contracts/CatalogProviders.ts')

assert('packages/adapters/odoo-erp/ exists', odooIndex && odooClient && odooProduct && odooCategory && odooBrand)
assert('odoo-erp module exports createOdooAdapters', /createOdooAdapters/.test(read('packages/adapters/odoo-erp/index.ts')))
assert('odoo-erp module exports OdooClient', /OdooClient/.test(read('packages/adapters/odoo-erp/index.ts')))
assert('odoo-erp module exports createOdooProductAdapter', /createOdooProductAdapter/.test(read('packages/adapters/odoo-erp/index.ts')))
assert('odoo-erp module exports createOdooCategoryAdapter', /createOdooCategoryAdapter/.test(read('packages/adapters/odoo-erp/index.ts')))
assert('odoo-erp module exports createOdooBrandAdapter', /createOdooBrandAdapter/.test(read('packages/adapters/odoo-erp/index.ts')))

// ── Step 1: Static smoke (no Odoo required) ────────────────────────────

log('Step 1: static smoke')

// Env file checks
const envFile = read('.env')
assert('.env has USE_MOCK=false', /^USE_MOCK\s*=\s*false/m.test(envFile))
assert('.env has ODOO_BASE_URL', /^ODOO_BASE_URL\s*=/m.test(envFile))
assert('.env has ODOO_DB', /^ODOO_DB\s*=/m.test(envFile))
assert('.env has ODOO_API_KEY', /^ODOO_API_KEY\s*=/m.test(envFile))
assert('.env has STRICT_PROVIDER_READINESS=true', /^STRICT_PROVIDER_READINESS\s*=\s*true/m.test(envFile))

// Env example file checks (portable reference)
const envExample = read('.env.example')
assert('.env.example documents ODOO_BASE_URL', /ODOO_BASE_URL/.test(envExample))
assert('.env.example documents ODOO_DB', /ODOO_DB/.test(envExample))
assert('.env.example documents ODOO_API_KEY', /ODOO_API_KEY/.test(envExample))
assert('.env.example documents USE_MOCK=false', /USE_MOCK\s*=\s*false/.test(envExample))

// Provider contract checks (source-level, no real Odoo)
assert('CategoryProvider contract defines list', /list\(\):\s*Promise/.test(catalogContracts))
assert('CategoryProvider contract defines tree', /tree\(\):\s*Promise/.test(catalogContracts))
assert('CategoryProvider contract defines getBySlug', /getBySlug\(slug:\s*string\)/.test(catalogContracts))
assert('BrandProvider contract defines list', /BrandProvider[\s\S]*list\(\):\s*Promise/.test(catalogContracts))
assert('BrandProvider contract defines getBySlug', /BrandProvider[\s\S]*getBySlug\(slug:\s*string\)/.test(catalogContracts))

// Adapter method conformance (source-level)
const productAdapter = read('packages/adapters/odoo-erp/product-adapter.ts')
const categoryAdapter = read('packages/adapters/odoo-erp/category-adapter.ts')
const brandAdapter = read('packages/adapters/odoo-erp/brand-adapter.ts')

assert('product-adapter exports createOdooProductAdapter', /createOdooProductAdapter/.test(productAdapter))
assert('product-adapter defines list method', /list/.test(productAdapter))
assert('product-adapter defines get method', /\bget\(id/.test(productAdapter) || /\bget\s*\(/.test(productAdapter))

assert('category-adapter exports createOdooCategoryAdapter', /createOdooCategoryAdapter/.test(categoryAdapter))
assert('category-adapter defines list method', /list/.test(categoryAdapter))
assert('category-adapter defines tree method', /tree/.test(categoryAdapter))
assert('category-adapter defines getBySlug method', /getBySlug/.test(categoryAdapter))

assert('brand-adapter exports createOdooBrandAdapter', /createOdooBrandAdapter/.test(brandAdapter))
assert('brand-adapter defines list method', /list/.test(brandAdapter))
assert('brand-adapter defines getBySlug method', /getBySlug/.test(brandAdapter))

// Data mapping functions exist
assert('product-adapter has odooProductToCanonical mapping', /odooProductToCanonical/.test(productAdapter))
assert('category-adapter maps LocalizedString (name_ar)', /name_ar/.test(categoryAdapter))
assert('brand-adapter maps LocalizedString (name_ar)', /name_ar/.test(brandAdapter))

// Registry wires Odoo adapters
assert('provider registry imports createOdooAdapters', /createOdooAdapters/.test(providerRegistry))
assert('provider registry calls createOdooAdapters', /createOdooAdapters\(\)/.test(providerRegistry))

// Runbook exists
const runbook = read('docs/delivery/runbooks/odoo-connection.md')
assert('Odoo runbook exists', runbook.length > 0)
assert('runbook covers ODOO_BASE_URL', /ODOO_BASE_URL/.test(runbook))
assert('runbook covers ODOO_DB', /ODOO_DB/.test(runbook))
assert('runbook covers ODOO_API_KEY', /ODOO_API_KEY/.test(runbook))
assert('runbook covers /api/products endpoint', /\/api\/products/.test(runbook))
assert('runbook covers /api/categories endpoint', /\/api\/categories/.test(runbook))
assert('runbook covers /api/brands endpoint', /\/api\/brands/.test(runbook))
assert('runbook covers data mapping', /odooProductToCanonical|Data Mapping/.test(runbook))
assert('runbook covers troubleshooting', /Troubleshooting/.test(runbook))
assert('runbook covers production checklist', /Production Switch Checklist/.test(runbook))
assert('runbook covers OrderProvider.place write-back path', /OrderProvider\.place/.test(runbook))
assert('runbook covers order write-back idempotency', /idempotency/i.test(runbook))
assert('runbook covers outbound order fields', /Required Outbound Order Fields/.test(runbook))
assert('runbook covers status mapping', /Status Mapping/.test(runbook))
assert('runbook covers write-back failure behavior', /Failure Behavior/.test(runbook))
assert('runbook separates payment settlement from order status', /Payment settlement is separate from order status/.test(runbook))
assert('runbook covers live order write-back verification', /Live Verification When Client Odoo Is Ready/.test(runbook))

const orderContract = read('packages/providers/contracts/OrderProvider.ts')
assert('OrderProvider contract exposes place', /place\?\(input:\s*PlaceOrderInput\)/.test(orderContract))
assert('OrderProvider place input carries pricingQuoteId', /pricingQuoteId:\s*string/.test(orderContract))

const paymentNetworksOrderAdapter = read('packages/adapters/payment-networks/order-adapter.ts')
assert(
  'payment-network order adapter delegates order CRUD to another OrderProvider',
  /Order CRUD[\s\S]*separate adapter/.test(paymentNetworksOrderAdapter),
)

// Data mapping test exists
const mappingTests = read('packages/adapters/odoo-erp/__tests__/odoo-data-mapping.test.ts')
assert('odoo data mapping tests exist', mappingTests.length > 0)
assert('mapping tests cover price mapping', /list_price.*price/.test(mappingTests))
assert('mapping tests cover currency default USD', /USD/.test(mappingTests))
assert('mapping tests cover sourceMeta.system odoo-erp', /odoo-erp/.test(mappingTests))

log('Step 1 OK — all static checks pass')

// ── Health / Full smoke (requires real Odoo) ───────────────────────────

if (!HEALTH && !FULL) {
  log('Done. Use --health for live API checks, --full for full provider execution.')
  log('Both require real Odoo credentials in .env.')
  process.exit(process.exitCode || 0)
}

log('Step 2+: live checks require tsx runtime and real Odoo credentials')

try {
  const { spawnSync } = await import('node:child_process')
  const flags = FULL ? '--full' : '--health'

  // Re-run self via tsx so @real/* path aliases and TypeScript resolve
  const selfPath = join(rootDir, 'scripts', 'smoke-odoo-connection.mjs')
  const liveScript = join(rootDir, 'scripts', 'smoke-odoo-connection-live.ts')

  if (!existsSync(liveScript)) {
    fail(`live smoke script missing: ${liveScript}`)
    log('The --health and --full flags require a TypeScript companion script (smoke-odoo-connection-live.ts)')
    log('that imports adapters via @real/* and executes live API calls.')
    process.exit(1)
  }

  const result = spawnSync('npx', ['tsx', liveScript, flags], {
    cwd: rootDir,
    stdio: 'inherit',
    timeout: 60_000,
  })

  if (result.status !== 0) {
    process.exitCode = result.status || 1
  }
} catch (err) {
  fail(`live smoke failed: ${err.message}`)
}

if (process.exitCode) {
  fail('One or more checks failed.')
} else {
  log('All checks passed.')
}
process.exit(process.exitCode || 0)
