#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

let failed = 0

function pass(label) {
  console.log(`[operations-observability] PASS ${label}`)
}

function fail(label, detail = '') {
  failed += 1
  console.error(`[operations-observability] FAIL ${label}${detail ? `: ${detail}` : ''}`)
}

function read(path) {
  if (!existsSync(path)) {
    fail(`missing ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

function expectIncludes(label, content, needle) {
  if (content.includes(needle)) {
    pass(label)
  } else {
    fail(label, `missing ${needle}`)
  }
}

const route = read('apps/next/app/api/health/route.ts')
const service = read('apps/next/server/services/operations/health.service.ts')
const test = read('apps/next/server/services/operations/health.service.test.ts')
const uptimeRunbook = read('docs/delivery/runbooks/uptime-monitoring.md')
const incidentRunbook = read('docs/delivery/runbooks/incident-response.md')
const handbook = read('docs/delivery/runbooks/OPERATOR_HANDBOOK_INDEX.md')
const packageJson = read('package.json')
const deliveryVerifier = read('scripts/verify-delivery.mjs')

expectIncludes('health route exists and calls service', route, 'getOperationsHealth')
expectIncludes('health route is no-store', route, 'Cache-Control')
expectIncludes('health route can return 503', route, "health.status === 'unhealthy' ? 503 : 200")
expectIncludes('health service reports provider readiness', service, 'providerReadiness')
expectIncludes('health service reports search provider health', service, 'searchProvider.health')
expectIncludes('health service reports notification status', service, 'getNotificationStatus')
expectIncludes('health service exposes runtime uptime', service, 'uptimeSeconds')
expectIncludes('health test covers operations payload', test, 'getOperationsHealth returns runtime')
expectIncludes('uptime runbook references health endpoint', uptimeRunbook, 'GET /api/health')
expectIncludes('uptime runbook covers unhealthy alerts', uptimeRunbook, 'data.status` equals `unhealthy`')
expectIncludes('incident runbook covers rollback', incidentRunbook, 'vercel rollback')
expectIncludes('incident runbook covers EAS republish', incidentRunbook, 'update:republish')
expectIncludes('operator handbook links uptime runbook', handbook, 'uptime-monitoring.md')
expectIncludes('operator handbook links incident runbook', handbook, 'incident-response.md')
expectIncludes('package exposes operations verifier', packageJson, '"verify:operations-observability"')
expectIncludes('delivery verifier has operations gate', deliveryVerifier, "'operations-observability'")

const shell = process.platform === 'win32' ? 'cmd.exe' : 'sh'
const shellArgs =
  process.platform === 'win32'
    ? ['/d', '/s', '/c']
    : ['-lc']
const result = spawnSync(
  shell,
  [...shellArgs, 'npx --no-install tsx --test apps/next/server/services/operations/health.service.test.ts'],
  {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  },
)

if (result.status === 0) {
  pass('operations health focused test passes')
} else {
  fail('operations health focused test passes', `${result.stdout}${result.stderr}`)
}

if (failed > 0) {
  console.error(`[operations-observability] ${failed} failed`)
  process.exit(1)
}

console.log('[operations-observability] all checks passed')
