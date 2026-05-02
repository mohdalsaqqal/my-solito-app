import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
let failures = 0

function pass(message) {
  console.log(`[documentation-knowledge] PASS ${message}`)
}

function fail(message) {
  failures += 1
  console.error(`[documentation-knowledge] FAIL ${message}`)
}

function file(path) {
  const fullPath = resolve(root, path)
  if (!existsSync(fullPath)) {
    fail(`missing ${path}`)
    return ''
  }
  pass(`${path} exists`)
  return readFileSync(fullPath, 'utf8')
}

function includes(path, needle, message) {
  const content = file(path)
  if (!content) return
  if (content.includes(needle)) pass(message)
  else fail(`${path} missing ${needle}`)
}

const requiredDocs = [
  'AGENTS.md',
  'docs/architecture-index.md',
  'docs/production-blueprint.md',
  'docs/saas-migration.md',
  'docs/eas-runbook.md',
  'docs/delivery/CLIENT_HANDOFF_PACK.md',
  'docs/delivery/PRODUCTION_BLOCKERS.md',
  'docs/delivery/DELIVERY_MATRIX.md',
  'docs/delivery/runbooks/OPERATOR_HANDBOOK_INDEX.md',
  'docs/delivery/runbooks/cms-store-manager.md',
  'docs/delivery/runbooks/odoo-connection.md',
  'docs/delivery/runbooks/custom-payment-gateway.md',
  'docs/delivery/runbooks/platform-operations.md',
  'docs/delivery/runbooks/component-catalog.md',
]

for (const doc of requiredDocs) file(doc)

includes('docs/delivery/runbooks/OPERATOR_HANDBOOK_INDEX.md', 'component-catalog.md', 'operator index links component catalog')
includes('docs/delivery/runbooks/OPERATOR_HANDBOOK_INDEX.md', 'platform-operations.md', 'operator index links platform operations')
includes('docs/delivery/runbooks/component-catalog.md', 'Storybook Status', 'component catalog documents Storybook status')
includes('docs/delivery/runbooks/cms-store-manager.md', 'publish', 'CMS guide covers publish flow')
includes('docs/delivery/CLIENT_HANDOFF_PACK.md', 'Odoo', 'handoff pack covers Odoo')
includes('docs/delivery/CLIENT_HANDOFF_PACK.md', 'payment', 'handoff pack covers payment')
includes('docs/delivery/PRODUCTION_BLOCKERS.md', 'Detection', 'production blockers include detection steps')
includes('docs/delivery/DELIVERY_MATRIX.md', 'documentation-knowledge', 'delivery matrix includes documentation gate')
includes('package.json', 'verify:documentation-knowledge', 'package exposes documentation verifier')
includes('scripts/verify-delivery.mjs', "'documentation-knowledge'", 'delivery verifier has documentation gate')
includes('scripts/verify-delivery.mjs', 'docs:', 'delivery verifier has docs profile')
includes('checklist.md', 'Component catalog', 'checklist records component catalog status')

if (failures > 0) {
  console.error(`[documentation-knowledge] ${failures} check(s) failed`)
  process.exit(1)
}

console.log('[documentation-knowledge] all checks passed')
