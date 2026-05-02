import { createOdooAdapters } from '@real/adapters/odoo-erp'

const args = new Set(process.argv.slice(2))
const FULL = args.has('--full')

const TIMEOUT_MS = 10_000

function log(message: string) {
  console.log(`[odoo-smoke:live] ${message}`)
}

function fail(message: string) {
  console.error(`[odoo-smoke:live] FAIL: ${message}`)
  process.exitCode = 1
}

function assert(label: string, condition: unknown) {
  if (!condition) {
    fail(label)
    return
  }
  log(`PASS ${label}`)
}

async function withTimeout<T>(promise: Promise<T>, label: string, ms = TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms: ${label}`)), ms)
  })
  try {
    const result = await Promise.race([promise, timeout])
    clearTimeout(timer!)
    return result as T
  } catch (err) {
    clearTimeout(timer!)
    throw err
  }
}

const adapters = createOdooAdapters()
if (!adapters) {
  fail('createOdooAdapters() returned null — check ODOO_BASE_URL, ODOO_DB, ODOO_API_KEY')
  process.exit(1)
}

const { productProvider, categoryProvider, brandProvider } = adapters

// ── Health check ───────────────────────────────────────────────────────

log('Health check: live API calls')

try {
  const products = await withTimeout(productProvider.list(), 'productProvider.list()')
  assert('productProvider.list() returns ok', products.ok === true)
  assert('productProvider.list() returns array', Array.isArray(products.data))
  if (products.data && products.data.length > 0) {
    const p = products.data[0]
    assert('product has id (string)', typeof p.id === 'string')
    assert('product has name', typeof p.name === 'string')
    assert('product has price', typeof p.price === 'number')
    assert('product has sourceMeta', p.sourceMeta !== undefined)
    assert('product sourceMeta.system is odoo-erp', p.sourceMeta?.system === 'odoo-erp')
  }
} catch (err: any) {
  fail(`productProvider.list(): ${err.message}`)
}

try {
  const categories = await withTimeout(categoryProvider.list(), 'categoryProvider.list()')
  assert('categoryProvider.list() returns ok', categories.ok === true)
  assert('categoryProvider.list() returns array', Array.isArray(categories.data))
} catch (err: any) {
  fail(`categoryProvider.list(): ${err.message}`)
}

try {
  const brands = await withTimeout(brandProvider.list(), 'brandProvider.list()')
  assert('brandProvider.list() returns ok', brands.ok === true)
  assert('brandProvider.list() returns array', Array.isArray(brands.data))
} catch (err: any) {
  fail(`brandProvider.list(): ${err.message}`)
}

// GET /api/products/:id
try {
  const list = await withTimeout(productProvider.list({ limit: 1 }), 'product list for get')
  if (list.ok && list.data && list.data.length > 0) {
    const id = list.data[0].id
    const product = await withTimeout(productProvider.get(id), `productProvider.get(${id})`)
    assert(`productProvider.get(${id}) returns ok`, product.ok === true)
    assert(`productProvider.get(${id}) correct id`, String(product.data?.id) === String(id))
  } else {
    log('SKIP productProvider.get — no products available')
  }
} catch (err: any) {
  fail(`productProvider.get: ${err.message}`)
}

log('Health check OK')

if (!FULL) {
  log('Done. Use --full for adapter contract execution.')
  process.exit(process.exitCode || 0)
}

// ── Full smoke ─────────────────────────────────────────────────────────

log('Full smoke: adapter contract execution')

try {
  const products = await withTimeout(productProvider.list(), 'productProvider.list() (full)')
  assert('productProvider.list() returns ok (full)', products.ok === true)
  for (const p of (products.data ?? []).slice(0, 10)) {
    assert(`product ${p.id} sourceMeta.system odoo-erp`, p.sourceMeta?.system === 'odoo-erp')
  }
} catch (err: any) {
  fail(`productProvider.list() (full): ${err.message}`)
}

try {
  const categories = await withTimeout(categoryProvider.list(), 'categoryProvider.list() (full)')
  assert('categoryProvider.list() returns ok (full)', categories.ok === true)
  for (const c of (categories.data ?? []).slice(0, 10)) {
    assert(`category ${c.id} sourceMeta.system odoo-erp`, c.sourceMeta?.system === 'odoo-erp')
  }
} catch (err: any) {
  fail(`categoryProvider.list() (full): ${err.message}`)
}

try {
  const tree = await withTimeout(categoryProvider.tree(), 'categoryProvider.tree()')
  assert('categoryProvider.tree() returns ok', tree.ok === true)
  assert('categoryProvider.tree() returns array', Array.isArray(tree.data))
  if (tree.data && tree.data.length > 0) {
    assert('tree root nodes have children', Array.isArray(tree.data[0].children))
  }
} catch (err: any) {
  fail(`categoryProvider.tree(): ${err.message}`)
}

// getBySlug: category
try {
  const list = await withTimeout(categoryProvider.list(), 'category list for slug')
  if (list.ok && list.data && list.data.length > 0) {
    const slug = list.data[0].slug
    const result = await withTimeout(categoryProvider.getBySlug(slug), `categoryProvider.getBySlug(${slug})`)
    assert(`categoryProvider.getBySlug(${slug}) ok`, result.ok === true)
  } else {
    log('SKIP categoryProvider.getBySlug — no categories')
  }
} catch (err: any) {
  fail(`categoryProvider.getBySlug: ${err.message}`)
}

try {
  const brands = await withTimeout(brandProvider.list(), 'brandProvider.list() (full)')
  assert('brandProvider.list() returns ok (full)', brands.ok === true)
  for (const b of (brands.data ?? []).slice(0, 10)) {
    assert(`brand ${b.id} sourceMeta.system odoo-erp`, b.sourceMeta?.system === 'odoo-erp')
  }
} catch (err: any) {
  fail(`brandProvider.list() (full): ${err.message}`)
}

// getBySlug: brand
try {
  const list = await withTimeout(brandProvider.list(), 'brand list for slug')
  if (list.ok && list.data && list.data.length > 0) {
    const slug = list.data[0].slug
    const result = await withTimeout(brandProvider.getBySlug(slug), `brandProvider.getBySlug(${slug})`)
    assert(`brandProvider.getBySlug(${slug}) ok`, result.ok === true)
  } else {
    log('SKIP brandProvider.getBySlug — no brands')
  }
} catch (err: any) {
  fail(`brandProvider.getBySlug: ${err.message}`)
}

log('Full smoke OK')

if (process.exitCode) {
  fail('One or more checks failed.')
} else {
  log('All checks passed.')
}
process.exit(process.exitCode || 0)
