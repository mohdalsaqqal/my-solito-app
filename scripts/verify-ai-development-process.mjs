import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
let failures = 0

function pass(message) {
  console.log(`[ai-development-process] PASS ${message}`)
}

function fail(message) {
  failures += 1
  console.error(`[ai-development-process] FAIL ${message}`)
}

function content(path) {
  const fullPath = resolve(root, path)
  if (!existsSync(fullPath)) {
    fail(`missing ${path}`)
    return ''
  }
  pass(`${path} exists`)
  return readFileSync(fullPath, 'utf8')
}

function includes(path, needle, message) {
  const text = content(path)
  if (!text) return
  if (text.includes(needle)) pass(message)
  else fail(`${path} missing ${needle}`)
}

const requiredFiles = [
  'AGENTS.md',
  'SESSION-STATE.md',
  'RECENT_CONTEXT.md',
  'MEMORY.md',
  'checklist.md',
  'docs/delivery/WORKFLOW.md',
  'docs/delivery/DELIVERY_MATRIX.md',
  'docs/delivery/BLOCKERS.md',
  'graphify-out/GRAPH_REPORT.md',
  'graphify-out/contexts/apps-next-api/GRAPH_REPORT.md',
  'graphify-out/contexts/apps-next-services/GRAPH_REPORT.md',
  'graphify-out/contexts/packages-providers/GRAPH_REPORT.md',
  'graphify-out/contexts/packages-adapters/GRAPH_REPORT.md',
  'graphify-out/contexts/packages-app/GRAPH_REPORT.md',
  'graphify-out/contexts/packages-ui/GRAPH_REPORT.md',
]

for (const path of requiredFiles) content(path)

includes('AGENTS.md', 'Mandatory Startup Protocol', 'AGENTS documents startup protocol')
includes('AGENTS.md', 'Memory Update Rule', 'AGENTS documents memory updates')
includes('AGENTS.md', 'Delivery Workflow', 'AGENTS links delivery workflow')
includes('AGENTS.md', 'Parallel Agent Dispatch', 'AGENTS documents parallel dispatch')
includes('AGENTS.md', 'caveman: active', 'AGENTS requires caveman status reporting')
includes('AGENTS.md', '`graphify`: `checked`', 'AGENTS requires graphify status reporting')
includes('docs/delivery/WORKFLOW.md', 'Ticket Format', 'workflow documents ticket format')
includes('docs/delivery/WORKFLOW.md', 'Work Session Loop', 'workflow documents session loop')
includes('docs/delivery/WORKFLOW.md', 'Verification Rule', 'workflow documents verification rule')
includes('docs/delivery/DELIVERY_MATRIX.md', 'ai-development-process', 'delivery matrix includes AI process gate')
includes('package.json', 'verify:ai-development-process', 'package exposes AI process verifier')
includes('scripts/verify-delivery.mjs', "'ai-development-process'", 'delivery verifier has AI process gate')
includes('scripts/verify-delivery.mjs', 'ai:', 'delivery verifier has AI profile')
includes('checklist.md', 'AI-Augmented Development Process', 'checklist tracks AI process aspect')

if (failures > 0) {
  console.error(`[ai-development-process] ${failures} check(s) failed`)
  process.exit(1)
}

console.log('[ai-development-process] all checks passed')
