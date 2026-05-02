import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
let failures = 0

function pass(message) {
  console.log(`[launch-post-launch] PASS ${message}`)
}

function fail(message) {
  failures += 1
  console.error(`[launch-post-launch] FAIL ${message}`)
}

function read(path) {
  const fullPath = resolve(root, path)
  if (!existsSync(fullPath)) {
    fail(`missing ${path}`)
    return ''
  }
  pass(`${path} exists`)
  return readFileSync(fullPath, 'utf8')
}

function includes(path, needle, message) {
  const text = read(path)
  if (!text) return
  if (text.includes(needle)) pass(message)
  else fail(`${path} missing ${needle}`)
}

const requiredDocs = [
  'docs/delivery/runbooks/launch-post-launch.md',
  'docs/delivery/runbooks/client-onboarding.md',
  'docs/delivery/runbooks/sla-support.md',
  'docs/delivery/runbooks/platform-operations.md',
  'docs/delivery/runbooks/staging-deployment.md',
  'docs/delivery/CLIENT_HANDOFF_PACK.md',
  'docs/delivery/PRODUCTION_BLOCKERS.md',
]

for (const doc of requiredDocs) read(doc)

includes('docs/delivery/runbooks/launch-post-launch.md', 'Beta Client Plan', 'launch runbook covers beta plan')
includes('docs/delivery/runbooks/launch-post-launch.md', 'Migration Checklist', 'launch runbook covers migration')
includes('docs/delivery/runbooks/launch-post-launch.md', 'Go-Live Checklist', 'launch runbook covers go-live')
includes('docs/delivery/runbooks/launch-post-launch.md', 'SLA And Support Channels', 'launch runbook covers support channels')
includes('docs/delivery/runbooks/launch-post-launch.md', 'First 48 Hours', 'launch runbook covers first 48 hours')
includes('docs/delivery/runbooks/launch-post-launch.md', 'Feedback Loop', 'launch runbook covers feedback loop')
includes('docs/delivery/runbooks/OPERATOR_HANDBOOK_INDEX.md', 'launch-post-launch.md', 'operator index links launch runbook')
includes('docs/delivery/DELIVERY_MATRIX.md', 'launch-post-launch', 'delivery matrix includes launch gate')
includes('package.json', 'verify:launch-post-launch', 'package exposes launch verifier')
includes('scripts/verify-delivery.mjs', "'launch-post-launch'", 'delivery verifier has launch gate')
includes('scripts/verify-delivery.mjs', 'launch:', 'delivery verifier has launch profile')
includes('checklist.md', 'Launch/post-launch smoke', 'checklist records launch verifier')

if (failures > 0) {
  console.error(`[launch-post-launch] ${failures} check(s) failed`)
  process.exit(1)
}

console.log('[launch-post-launch] all checks passed')
