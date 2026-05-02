import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    console.error(`[meilisearch-smoke] FAIL missing ${relativePath}`)
    process.exit(1)
  }
  return readFileSync(fullPath, 'utf8')
}

function assert(label, condition) {
  if (!condition) {
    console.error(`[meilisearch-smoke] FAIL ${label}`)
    process.exit(1)
  }
  console.log(`[meilisearch-smoke] PASS ${label}`)
}

const adapter = read('packages/adapters/meilisearch/index.ts')
const adapterIndex = read('packages/adapters/index.ts')
const registry = read('packages/providers/registry.ts')
const envExample = read('.env.example')
const runbook = read('docs/delivery/runbooks/meilisearch-adapter.md')
const searchContract = read('packages/providers/contracts/SearchProvider.ts')

assert('meilisearch adapter exports factory', /createMeilisearchSearchAdapter/.test(adapter))
assert('meilisearch adapter exports env factory', /createMeilisearchSearchAdapterFromEnv/.test(adapter))
assert('adapter posts to Meilisearch index search endpoint', /\/indexes\/.+\/search/.test(adapter))
assert('adapter implements health', /async health/.test(adapter) && /\/health/.test(adapter))
assert('adapter requests facets', /facets: \[/.test(adapter))
assert('adapter sends filters', /filter: buildFilter/.test(adapter))
assert('adapter sends sort', /sort: buildSort/.test(adapter))
assert('adapter health checks index settings', /\/settings/.test(adapter))
assert('root adapter barrel exports meilisearch', /export \* from '\.\/meilisearch'/.test(adapterIndex))
assert('provider registry imports meilisearch factory', /createMeilisearchSearchAdapterFromEnv/.test(registry))
assert('provider registry selects meilisearch search provider', /meilisearchSearchAdapter \?\? mockSearchAdapter/.test(registry))
assert('SearchProvider contract exists', /export type SearchProvider =/.test(searchContract))

assert('env example documents USE_MEILISEARCH', /USE_MEILISEARCH/.test(envExample))
assert('env example documents MEILISEARCH_HOST', /MEILISEARCH_HOST/.test(envExample))
assert('env example documents MEILISEARCH_API_KEY', /MEILISEARCH_API_KEY/.test(envExample))
assert('env example documents MEILISEARCH_PRODUCTS_INDEX', /MEILISEARCH_PRODUCTS_INDEX/.test(envExample))

assert('runbook covers architecture', /SearchProvider[\s\S]*Meilisearch adapter/.test(runbook))
assert('runbook covers document contract', /Document Contract/.test(runbook))
assert('runbook covers indexing pipeline', /Indexing Pipeline/.test(runbook))
assert('runbook notes adapter selected by env', /USE_MEILISEARCH=true/.test(runbook))
assert('runbook covers facet and sort settings', /filterableAttributes/.test(runbook) && /sortableAttributes/.test(runbook))

const result = spawnSync(
  process.platform === 'win32' ? 'cmd.exe' : 'sh',
  process.platform === 'win32'
    ? ['/d', '/s', '/c', 'yarn --cwd packages/adapters node ../../node_modules/tsx/dist/cli.mjs --test meilisearch/index.test.ts']
    : ['-lc', 'yarn --cwd packages/adapters node ../../node_modules/tsx/dist/cli.mjs --test meilisearch/index.test.ts'],
  {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  },
)

process.exit(result.status ?? 1)
