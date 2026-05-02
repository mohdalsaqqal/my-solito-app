import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    console.error(`[search-discovery-smoke] FAIL missing ${relativePath}`)
    process.exit(1)
  }
  return readFileSync(fullPath, 'utf8')
}

function assert(label, condition) {
  if (!condition) {
    console.error(`[search-discovery-smoke] FAIL ${label}`)
    process.exit(1)
  }
  console.log(`[search-discovery-smoke] PASS ${label}`)
}

function run(label, command) {
  console.log(`[search-discovery-smoke] RUN ${label}`)
  const result = spawnSync(
    process.platform === 'win32' ? 'cmd.exe' : 'sh',
    process.platform === 'win32' ? ['/d', '/s', '/c', command] : ['-lc', command],
    {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    },
  )

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1)
  }
}

const contract = read('packages/providers/contracts/SearchProvider.ts')
const searchService = read('apps/next/server/services/search/search.service.ts')
const meilisearchAdapter = read('packages/adapters/meilisearch/index.ts')
const mockSearchAdapter = read('packages/adapters/mock/search/index.ts')
const syncScript = read('scripts/sync-meilisearch-products.ts')
const runbook = read('docs/delivery/runbooks/meilisearch-adapter.md')

assert('SearchProvider supports filters', /export type SearchProviderFilters/.test(contract))
assert('SearchProvider supports sort', /export type SearchProviderSort/.test(contract))
assert('SearchProvider returns facets', /export type SearchProviderFacets/.test(contract))
assert('SearchProvider health reports typo tolerance', /typoToleranceEnabled/.test(contract))
assert('search service parses brand filters', /listParam\(params, 'brand'\)/.test(searchService))
assert('search service parses category filters', /listParam\(params, 'category'\)/.test(searchService))
assert('search service parses sort', /parseSort/.test(searchService))
assert('meilisearch adapter requests facets', /facets: \[/.test(meilisearchAdapter))
assert('meilisearch adapter sends filters', /filter: buildFilter/.test(meilisearchAdapter))
assert('meilisearch adapter sends sort', /sort: buildSort/.test(meilisearchAdapter))
assert('meilisearch health checks settings', /\/settings/.test(meilisearchAdapter))
assert('mock search adapter returns facets', /buildFacets/.test(mockSearchAdapter))
assert('indexing script normalizes products', /toMeilisearchProductDocument/.test(syncScript))
assert('indexing script writes settings', /meilisearchProductSettings/.test(syncScript))
assert('indexing script writes documents', /documents\?primaryKey=id/.test(syncScript))
assert('runbook covers filterable attributes', /filterableAttributes/.test(runbook))
assert('runbook covers sortable attributes', /sortableAttributes/.test(runbook))

run(
  'search service focused tests',
  'yarn --cwd apps/next node --max-old-space-size=4096 ../../node_modules/tsx/dist/cli.mjs --test --test-concurrency=1 server/services/search/search.service.test.ts',
)
run(
  'meilisearch adapter focused tests',
  'yarn --cwd packages/adapters node ../../node_modules/tsx/dist/cli.mjs --test meilisearch/index.test.ts',
)
run(
  'meilisearch indexing dry-run',
  'yarn node node_modules/tsx/dist/cli.mjs scripts/sync-meilisearch-products.ts --dry-run',
)
