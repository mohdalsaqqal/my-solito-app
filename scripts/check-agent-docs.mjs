#!/usr/bin/env node
// check-agent-docs.mjs — Constitution Principle XIV enforcement
// Invoked as: node scripts/check-agent-docs.mjs [--verbose] [--json]

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const VERSION = 1

// ─── Shim descriptors ────────────────────────────────────────────────
const SHIM_PATHS = [
  'CLAUDE.md',
  'GEMINI.md',
  '.github/copilot-instructions.md',
  '.codex/context.md',
  '.qwen/PROJECT_SUMMARY.md',
  '.impeccable.md',
]

// Phrases that belong ONLY in AGENTS.md / constitution — forbidden in shims
const FORBIDDEN_PHRASES = [
  'Server Components MUST NOT call internal Route Handlers',
  'Reintroducing apiClient in Server Components',
  'Tokens over hardcoded values',
  'Adapters over direct external calls',
  'Providers over adapter imports',
  'Server layer owns all data access',
  'CMS controls content, not layout',
  'Do not reintroduce public Touchable',
  'No className in packages/app',
]

const POINTER_PHRASE = 'agents.md is the source of truth'
const AGENTS_MD_PATH = join(ROOT, 'AGENTS.md')
const LINE_CEILING = 150

// ─── CLI parsing ─────────────────────────────────────────────────────
const args = process.argv.slice(2)
const verbose = args.includes('--verbose')
const json = args.includes('--json')

// ─── Escape hatch ────────────────────────────────────────────────────
if (process.env.SKIP_GUARD_AGENT_DOCS === '1') {
  try {
    const { execSync } = await import('node:child_process')
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    if (branch === 'main') {
      console.error('SKIP_GUARD_AGENT_DOCS is ignored on main branch. Exiting 1.')
      process.exit(1)
    }
  } catch { /* not a git repo */ }
  console.log('⚠ SKIP_GUARD_AGENT_DOCS=1 — check skipped (non-main branch)')
  process.exit(0)
}

// ─── Helpers ─────────────────────────────────────────────────────────
function readLines(filePath) {
  const content = readFileSync(filePath, 'utf8')
  return content.split(/\r?\n/)
}

function hasSourceOfTruthHeading(lines, ceiling) {
  return lines
    .slice(0, ceiling)
    .some(line => /^##\s+source of truth\s*$/i.test(line.trim()))
}

// ─── Step 1: Verify AGENTS.md has Source of Truth section ────────────
const findings = []
const shimResults = []

function addFinding(ruleId, severity, path, message, principle) {
  findings.push({ ruleId, severity, path, message, principle })
}

// Check AGENTS.md SoT section
let sotPresent = false
try {
  const agentsLines = readLines(AGENTS_MD_PATH)
  if (hasSourceOfTruthHeading(agentsLines, 30)) {
    sotPresent = true
  } else {
    addFinding('AD-000', 'FAIL', 'AGENTS.md',
      'Missing "## Source of Truth" section in the first 30 lines of AGENTS.md. (Constitution Principle XIV)', 'XIV')
  }
} catch {
  addFinding('AD-000', 'FAIL', 'AGENTS.md',
    'AGENTS.md not found. (Constitution Principle XIV)', 'XIV')
}

// ─── Step 2: Check each shim ─────────────────────────────────────────
for (const shimPath of SHIM_PATHS) {
  const fullPath = join(ROOT, shimPath)
  if (!existsSync(fullPath)) {
    addFinding('AD-001', 'FAIL', shimPath,
      `Shim file missing: ${shimPath}. (Constitution Principle XIV)`, 'XIV')
    shimResults.push({ path: shimPath, lineCount: 0, pointerPresent: false, forbiddenMatches: [], status: 'FAIL' })
    continue
  }

  const lines = readLines(fullPath)
  const lineCount = lines.length
  const first30 = lines.slice(0, 30).join('\n').toLowerCase()
  const pointerPresent = first30.includes(POINTER_PHRASE)

  const forbiddenMatches = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const phrase of FORBIDDEN_PHRASES) {
      if (line.toLowerCase().includes(phrase.toLowerCase())) {
        forbiddenMatches.push({ line: i + 1, phrase })
      }
    }
  }

  const hasForbid = forbiddenMatches.length > 0
  const overCeiling = lineCount > LINE_CEILING

  let status = 'PASS'
  if (hasForbid) status = 'FAIL'
  if (!pointerPresent) status = 'FAIL'

  if (!pointerPresent) {
    addFinding('AD-002', 'FAIL', `${shimPath}:1`,
      `Missing pointer to AGENTS.md in first 30 lines. Add "AGENTS.md is the source of truth" near the top. (Constitution Principle XIV)`, 'XIV')
  }

  if (overCeiling) {
    addFinding('AD-003', 'WARN', shimPath,
      `${lineCount} lines (ceiling ${LINE_CEILING}) — review recommended. (Constitution Principle XIV)`, 'XIV')
  }

  for (const match of forbiddenMatches) {
    addFinding('AD-004', 'FAIL', `${shimPath}:${match.line}`,
      `Duplicated architecture rule — matched phrase: "${match.phrase}". This phrase belongs only in AGENTS.md. Remove or replace with: "See AGENTS.md for architecture rules." (Constitution Principle XIV)`, 'XIV')
  }

  shimResults.push({ path: shimPath, lineCount, pointerPresent, forbiddenMatches, status })
}

// ─── Output ──────────────────────────────────────────────────────────
const failCount = findings.filter(f => f.severity === 'FAIL').length
const warnCount = findings.filter(f => f.severity === 'WARN').length
const passCount = shimResults.filter(s => s.status === 'PASS' && !(findings.some(f => f.path === s.path && f.severity === 'FAIL'))).length
const exitCode = failCount > 0 ? 1 : 0

if (json) {
  const output = {
    script: 'check-agent-docs',
    version: VERSION,
    exitCode,
    shims: shimResults,
    summary: { fail: failCount, warn: warnCount, pass: 1 + passCount }, // +1 for AGENTS.md SoT
  }
  console.log(JSON.stringify(output, null, 2))
} else {
  console.log('check-agent-docs v' + VERSION + ' — Principle XIV enforcement')
  console.log('─'.repeat(50))

  // AGENTS.md SoT
  if (sotPresent) {
    console.log('✓ PASS  AGENTS.md           Source of Truth section present')
  } else {
    console.log('✖ FAIL  AGENTS.md           Missing Source of Truth section')
  }

  for (const shim of shimResults) {
    if (shim.status === 'FAIL') {
      console.log('✖ FAIL  ' + shim.path.padEnd(20) + (shim.forbiddenMatches.length > 0
        ? `${shim.forbiddenMatches.length} forbidden phrase(s) found`
        : 'missing pointer paragraph'))
      for (const m of shim.forbiddenMatches) {
        console.log(`        Line ${m.line}: "${m.phrase}"`)
      }
    } else if (shim.lineCount > LINE_CEILING) {
      console.log('! WARN  ' + shim.path.padEnd(20) + `${shim.lineCount} lines (ceiling ${LINE_CEILING}) — review recommended`)
    } else {
      console.log('✓ PASS  ' + shim.path.padEnd(20) + `${shim.lineCount} lines, pointer present, no forbidden phrases`)
    }
  }

  console.log()
  console.log(`${failCount} FAIL, ${warnCount} WARN — exit ${exitCode}`)
}

process.exit(exitCode)
