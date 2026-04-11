#!/usr/bin/env node
// list-service-files.mjs — Lists service files and checks test parity
// Invoked as: node scripts/list-service-files.mjs [--check-parity]

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

const ROOT = process.cwd()
const SERVICES_DIR = join(ROOT, 'apps', 'next', 'server', 'services')
const HYGIENE_MARKER = '// @hygiene-exempt'

// ─── CLI ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const checkParity = args.includes('--check-parity')

// ─── Discover service files ──────────────────────────────────────────
function findTsFiles(dir) {
  const results = []
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return results }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) { results.push(...findTsFiles(full)); continue }
    if (extname(entry.name) === '.ts' && !entry.name.endsWith('.test.ts')) {
      results.push(full)
    }
  }
  return results
}

const serviceFiles = findTsFiles(SERVICES_DIR)

if (!checkParity) {
  // Just list files
  for (const f of serviceFiles) {
    const rel = relative(ROOT, f)
    const content = readFileSync(f, 'utf8')
    const first10 = content.split(/\r?\n/).slice(0, 10).join('\n')
    const exempt = first10.includes(HYGIENE_MARKER)
    console.log(rel + (exempt ? '  [exempt]' : ''))
  }
  process.exit(0)
}

// ─── Parity check ────────────────────────────────────────────────────
let failures = 0
const uncovered = []

for (const svcPath of serviceFiles) {
  const content = readFileSync(svcPath, 'utf8')
  const first10 = content.split(/\r?\n/).slice(0, 10).join('\n')
  if (first10.includes(HYGIENE_MARKER)) continue

  const relPath = relative(ROOT, svcPath)
  const testPath = svcPath.replace(/\.ts$/, '.test.ts')

  if (!existsSync(testPath)) {
    uncovered.push(relPath)
    console.error(`✖ FAIL  ${relPath} — no test file at ${relative(ROOT, testPath)}`)
    failures++
    continue
  }

  // Check for happy path + failure path tests
  const testContent = readFileSync(testPath, 'utf8')
  const hasHappy = /happy\s+path/i.test(testContent)
  const hasFailure = /failure\s+path/i.test(testContent)

  if (!hasHappy) {
    uncovered.push(relPath + ' (missing happy path test)')
    console.error(`✖ FAIL  ${relPath} — no test matching /happy\\s+path/i`)
    failures++
  }
  if (!hasFailure) {
    uncovered.push(relPath + ' (missing failure path test)')
    console.error(`✖ FAIL  ${relPath} — no test matching /failure\\s+path/i`)
    failures++
  }
}

if (failures === 0) {
  console.log(`✓ Parity OK — ${serviceFiles.length} service files, all covered.`)
  process.exit(0)
} else {
  console.error(`\n${failures} parity failure(s). ${uncovered.length} file(s) need test coverage.`)
  process.exit(1)
}
