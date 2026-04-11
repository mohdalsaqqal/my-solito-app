#!/usr/bin/env node
// guard-hygiene.mjs — Constitution Principle XV + XVI (HY-001 through HY-012)
// Invoked as: node scripts/guard-hygiene.mjs [--since <ref>] [--verbose] [--json]

import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.cwd()
const VERSION = 1

// ─── Hygiene Rules SEED ─────────────────────────────────────────────
const HYGIENE_RULES = [
  {
    id: 'HY-001', principle: 'XV', severity: 'FAIL',
    description: 'AI tool vendor directories MUST be in .gitignore',
    check: checkVendorGitignore,
  },
  {
    id: 'HY-002', principle: 'XV', severity: 'FAIL',
    description: 'Audit/snapshot files are forbidden at repo root',
    check: checkForbiddenRootFiles,
  },
  {
    id: 'HY-003', principle: 'XV', severity: 'FAIL',
    description: 'Parallel *_old.md source-of-truth files are forbidden at repo root',
    check: checkOldMdFiles,
  },
  {
    id: 'HY-004', principle: 'XV', severity: 'FAIL',
    description: 'Planning files forbidden outside docs/plans/',
    check: checkPlanningFiles,
  },
  {
    id: 'HY-005', principle: 'XV', severity: 'FAIL',
    description: 'Current-snapshot files forbidden at repo root',
    check: checkSnapshotFiles,
  },
  {
    id: 'HY-006', principle: 'XV', severity: 'FAIL',
    description: 'Audit report files forbidden at repo root',
    check: checkAuditFiles,
  },
  {
    id: 'HY-007', principle: 'XV', severity: 'FAIL',
    description: 'Build artifacts (.next/, dist/, .turbo/, coverage/) MUST be gitignored',
    check: checkBuildArtifactGitignore,
  },
  {
    id: 'HY-008', principle: 'XV', severity: 'WARN',
    description: 'Mass staged deletions detected',
    check: checkStagedDeletions,
  },
  {
    id: 'HY-009', principle: 'XVI', severity: 'FAIL',
    description: 'Memory override (NODE_OPTIONS=--max-old-space-size=*) must have documented root cause',
    check: checkMemoryOverride,
  },
  {
    id: 'HY-010', principle: 'XVI', severity: 'FAIL',
    description: 'Workspace exclusion must have documented reason',
    check: checkWorkspaceExclusion,
  },
  {
    id: 'HY-011', principle: 'XVI', severity: 'FAIL',
    description: 'Framework-tier dependencies MUST be pinned (no ^ or ~ ranges)',
    check: checkFrameworkPins,
  },
  {
    id: 'HY-012', principle: 'XV', severity: 'FAIL',
    description: 'Plan-like markdown forbidden at repo root (use docs/plans/)',
    check: checkPlanFiles,
  },
]

const VENDOR_DIRS = [
  '.adal/', '.augment/', '.cline/', '.codebuddy/', '.commandcode/',
  '.continue/', '.crush/', '.cursor/', '.factory/', '.goose/',
  '.iflow/', '.junie/', '.kilocode/', '.kiro/', '.kode/',
  '.mcpjam/', '.mux/', '.neovate/', '.openhands/', '.pi/',
  '.pochi/', '.qoder/', '.roo/', '.trae/', '.vibe/',
  '.windsurf/', '.zencoder/',
]

const FORBIDDEN_ROOT_PATTERNS = [
  /^.*_audit\.md$/i,
  /^.*_old\.md$/i,
  /^current-.*-snapshot\.md$/i,
  /^issues\.md$/i,
]

const AUDIT_FILES = ['AUDIT_REPORT.md']
const SNAPSHOT_FILES_PATTERNS = [/^current-.*-snapshot\.md$/i]
const PLANNING_FILES = ['plan.md', 'requirements.md']

const FRAMEWORK_DEPS = [
  'next', 'react', 'react-dom', 'react-native',
  'react-native-reanimated', 'react-native-web', 'typescript',
]

// ─── CLI parsing ─────────────────────────────────────────────────────
const args = process.argv.slice(2)
const verbose = args.includes('--verbose')
const json = args.includes('--json')
const sinceIdx = args.indexOf('--since')
const sinceRef = sinceIdx !== -1 ? args[sinceIdx + 1] : null

// ─── Escape hatch ────────────────────────────────────────────────────
if (process.env.SKIP_GUARD_HYGIENE === '1') {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    if (branch === 'main') {
      console.error('SKIP_GUARD_HYGIENE is ignored on main branch. Exiting 1.')
      process.exit(1)
    }
  } catch { /* not a git repo */ }
  console.log('⚠ SKIP_GUARD_HYGIENE=1 — check skipped (non-main branch)')
  process.exit(0)
}

// ─── Findings ────────────────────────────────────────────────────────
const findings = []

function addFinding(ruleId, severity, path, message, principle) {
  findings.push({ ruleId, severity, path: path || 'repo-root', message, principle })
}

// ─── Rule Check Implementations ──────────────────────────────────────

function checkVendorGitignore() {
  const gitignorePath = join(ROOT, '.gitignore')
  if (!existsSync(gitignorePath)) {
    addFinding('HY-001', 'FAIL', '.gitignore', '.gitignore file missing', 'XV')
    return
  }
  const content = readFileSync(gitignorePath, 'utf8')
  for (const dir of VENDOR_DIRS) {
    const name = dir.replace('/', '')
    if (!content.includes(name)) {
      addFinding('HY-001', 'FAIL', '.gitignore', `${dir} not in .gitignore. (Constitution Principle XV)`, 'XV')
    }
  }
}

function checkForbiddenRootFiles() {
  let files
  try { files = readdirSync(ROOT) } catch { return }
  for (const file of files) {
    const stat = statSync(join(ROOT, file))
    if (!stat.isFile()) continue
    if (!file.endsWith('.md')) continue
    for (const pattern of FORBIDDEN_ROOT_PATTERNS) {
      if (pattern.test(file)) {
        addFinding('HY-002', 'FAIL', file,
          `Audit/snapshot files are forbidden at repo root. Move to docs/archive/ or delete. (Constitution Principle XV)`, 'XV')
      }
    }
  }
}

function checkOldMdFiles() {
  let files
  try { files = readdirSync(ROOT) } catch { return }
  for (const file of files) {
    if (file.endsWith('_old.md')) {
      addFinding('HY-003', 'FAIL', file,
        `Parallel *_old.md source-of-truth files are forbidden. Use AGENTS.md as the single source. (Constitution Principle XV)`, 'XV')
    }
  }
}

function checkPlanningFiles() {
  let files
  try { files = readdirSync(ROOT) } catch { return }
  for (const file of files) {
    if (PLANNING_FILES.includes(file.toLowerCase())) {
      addFinding('HY-004', 'FAIL', file,
        `Planning files must live under docs/plans/. Move ${file} to docs/plans/. (Constitution Principle XV)`, 'XV')
    }
  }
}

function checkSnapshotFiles() {
  let files
  try { files = readdirSync(ROOT) } catch { return }
  for (const file of files) {
    for (const pattern of SNAPSHOT_FILES_PATTERNS) {
      if (pattern.test(file)) {
        addFinding('HY-005', 'FAIL', file,
          `Current-snapshot files are forbidden at repo root. (Constitution Principle XV)`, 'XV')
      }
    }
  }
}

function checkAuditFiles() {
  let files
  try { files = readdirSync(ROOT) } catch { return }
  for (const file of files) {
    if (AUDIT_FILES.includes(file)) {
      addFinding('HY-006', 'FAIL', file,
        `Audit report files are forbidden at repo root. Move to docs/archive/. (Constitution Principle XV)`, 'XV')
    }
  }
}

function checkBuildArtifactGitignore() {
  const gitignorePath = join(ROOT, '.gitignore')
  if (!existsSync(gitignorePath)) return
  const content = readFileSync(gitignorePath, 'utf8')
  const artifacts = ['.next/', 'dist/', '.turbo/', 'coverage/']
  for (const artifact of artifacts) {
    const name = artifact.replace('/', '')
    if (!content.includes(name)) {
      addFinding('HY-007', 'FAIL', '.gitignore',
        `${artifact} MUST be gitignored. (Constitution Principle XV)`, 'XV')
    }
  }
}

function checkStagedDeletions() {
  try {
    const output = execSync('git diff --cached --diff-filter=D --name-only', { encoding: 'utf8', cwd: ROOT })
    const deletedFiles = output.trim().split('\n').filter(Boolean)
    if (deletedFiles.length > 50) {
      addFinding('HY-008', 'WARN', 'working-tree',
        `${deletedFiles.length} files staged for deletion. Commit or restore before pushing.`, 'XV')
    }
  } catch { /* not a git repo or git not available */ }
}

function checkMemoryOverride() {
  const runbookPath = join(ROOT, 'docs', 'plans', '003-hygiene-remediation-runbook.md')
  const runbookExists = existsSync(runbookPath)
  const packageFiles = findPackageJsonFiles(ROOT)
  for (const pkgPath of packageFiles) {
    try {
      const content = readFileSync(pkgPath, 'utf8')
      const relPath = relative(ROOT, pkgPath)
      if (content.includes('--max-old-space-size=')) {
        if (!runbookExists) {
          addFinding('HY-009', 'FAIL', relPath,
            `Memory override found but runbook does not exist. Create docs/plans/003-hygiene-remediation-runbook.md. (Constitution Principle XVI)`, 'XVI')
        }
      }
    } catch { /* skip */ }
  }
}

function checkWorkspaceExclusion() {
  const rootPkg = join(ROOT, 'package.json')
  if (!existsSync(rootPkg)) return
  const content = readFileSync(rootPkg, 'utf8')
  const runbookPath = join(ROOT, 'docs', 'plans', '003-hygiene-remediation-runbook.md')
  const runbookExists = existsSync(runbookPath)
  try {
    const pkg = JSON.parse(content)
    const workspaces = pkg.workspaces || []
    const exclusions = workspaces.filter(w => typeof w === 'string' && w.startsWith('!'))
    if (exclusions.length > 0 && !runbookExists) {
      addFinding('HY-010', 'FAIL', 'package.json',
        `Workspace exclusion(s) ${exclusions.join(', ')} found but runbook does not exist. Document reason in docs/plans/003-hygiene-remediation-runbook.md. (Constitution Principle XVI)`, 'XVI')
    }
  } catch { /* skip */ }
}

function checkFrameworkPins() {
  const packageFiles = findPackageJsonFiles(ROOT)
  for (const pkgPath of packageFiles) {
    try {
      const content = readFileSync(pkgPath, 'utf8')
      const relPath = relative(ROOT, pkgPath)
      const pkg = JSON.parse(content)
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
      for (const dep of FRAMEWORK_DEPS) {
        if (allDeps[dep] && (/[\^~]/.test(allDeps[dep]))) {
          addFinding('HY-011', 'FAIL', relPath,
            `Framework pin violation: "${dep}": "${allDeps[dep]}" — must be exact. Remove ^ or ~ and pin to version resolved in yarn.lock. (Constitution Principle XVI)`, 'XVI')
        }
      }
    } catch { /* skip */ }
  }
}

function checkPlanFiles() {
  let files
  try { files = readdirSync(ROOT) } catch { return }
  const planLikePatterns = [
    /^plan\.md$/i,
    /^requirements\.md$/i,
    /^tasks\.md$/i,
  ]
  for (const file of files) {
    const stat = statSync(join(ROOT, file))
    if (!stat.isFile()) continue
    for (const pattern of planLikePatterns) {
      if (pattern.test(file)) {
        addFinding('HY-012', 'FAIL', file,
          `Plan-like file "${file}" found at repo root. Active plans must live under docs/plans/. (Constitution Principle XV, FR-012)`, 'XV')
      }
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function findPackageJsonFiles(root) {
  const results = []
  const EXCLUDE_DIRS = new Set([
    'node_modules',
    '.claude',
    '.agent',
    '.agents',
    'my-clone',
    'real-cosmetics-admin',
    'src',
    'luxeglow-market',
    'strapi',
  ])
  function walk(dir) {
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (EXCLUDE_DIRS.has(entry.name)) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (entry.name === 'package.json') results.push(full)
    }
  }
  walk(root)
  return results
}

// ─── Execute all rules ───────────────────────────────────────────────
for (const rule of HYGIENE_RULES) {
  try {
    await rule.check()
  } catch (err) {
    addFinding(rule.id, 'FAIL', 'script-error', `${rule.id}: ${err.message}`, rule.principle)
  }
}

// ─── Output ──────────────────────────────────────────────────────────
const failCount = findings.filter(f => f.severity === 'FAIL').length
const warnCount = findings.filter(f => f.severity === 'WARN').length
const passCount = HYGIENE_RULES.length - failCount - warnCount
const exitCode = failCount > 0 ? 1 : 0

if (json) {
  const output = {
    script: 'guard-hygiene',
    version: VERSION,
    exitCode,
    findings,
    summary: { fail: failCount, warn: warnCount, pass: passCount },
  }
  console.log(JSON.stringify(output, null, 2))
} else {
  console.log('guard-hygiene v' + VERSION + ' — Principle XV enforcement')
  console.log('─'.repeat(50))
  if (findings.length === 0) {
    console.log('✓ All hygiene checks pass — no findings.')
  }
  for (const f of findings) {
    const icon = f.severity === 'FAIL' ? '✖ FAIL' : f.severity === 'WARN' ? '! WARN' : '✓ PASS'
    console.log(`${icon}  ${f.ruleId}  ${f.path}`)
    console.log(`        ${f.message}`)
    console.log()
  }
  if (findings.length > 0) {
    console.log(`${failCount} FAIL, ${warnCount} WARN, ${passCount} PASS — exit ${exitCode}`)
  } else {
    console.log('Hygiene OK')
  }
}

process.exit(exitCode)
