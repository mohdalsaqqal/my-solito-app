import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SCRIPT = 'node scripts/check-agent-docs.mjs'
const TMP_DIR = join(process.cwd(), '_test_agent_docs_tmp')

function setup() {
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true })
  mkdirSync(TMP_DIR, { recursive: true })
  // Copy AGENTS.md and shims to tmp
  const files = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.impeccable.md']
  // Minimal setup for clean state
}

function cleanup() {
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true })
}

test('check-agent-docs - clean state passes (happy path)', async () => {
  // Current state should pass since shims are rewritten
  const output = execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
  assert.ok(output.includes('PASS') || output.includes('exit 0'), 'Should pass on clean state')
  cleanup()
})

test('check-agent-docs - missing pointer fails (failure path)', async () => {
  // Temporarily modify CLAUDE.md to remove pointer
  const original = readFileSync('CLAUDE.md', 'utf8')
  const broken = original.replace('AGENTS.md is the source of truth', 'some other text')
  writeFileSync('CLAUDE.md', broken)
  try {
    const output = execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
    assert.fail('Should have exited non-zero')
  } catch (e) {
    assert.ok(e.stdout?.includes('FAIL') || e.stderr?.includes('FAIL'), 'Should report FAIL for missing pointer')
    assert.ok(e.status !== 0, 'Should exit non-zero')
  } finally {
    writeFileSync('CLAUDE.md', original)
  }
})

test('check-agent-docs - forbidden phrase fails (failure path)', async () => {
  const original = readFileSync('.impeccable.md', 'utf8')
  const broken = original + '\n\nServer Components MUST NOT call internal Route Handlers\n'
  writeFileSync('.impeccable.md', broken)
  try {
    execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
    assert.fail('Should have exited non-zero')
  } catch (e) {
    assert.ok(e.stdout?.includes('AD-004') || e.stdout?.includes('FAIL'), 'Should report AD-004 for forbidden phrase')
    assert.ok(e.status !== 0, 'Should exit non-zero')
  } finally {
    writeFileSync('.impeccable.md', original)
  }
})

test('check-agent-docs - over 150 lines warns (happy path with warning)', async () => {
  const original = readFileSync('GEMINI.md', 'utf8')
  // Add lines to exceed 150
  const extra = '\n# Note\n'.padEnd(200, '- ') + '\n'
  writeFileSync('GEMINI.md', original + extra)
  try {
    const output = execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
    assert.ok(output.includes('WARN') || output.includes('review recommended'), 'Should warn for >150 lines')
  } finally {
    writeFileSync('GEMINI.md', original)
  }
})

test('check-agent-docs - missing shim fails (failure path)', async () => {
  const original = readFileSync('.impeccable.md', 'utf8')
  rmSync('.impeccable.md')
  try {
    execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
    assert.fail('Should have exited non-zero')
  } catch (e) {
    assert.ok(e.stdout?.includes('AD-001') || e.stdout?.includes('FAIL'), 'Should report AD-001 for missing shim')
    assert.ok(e.status !== 0, 'Should exit non-zero')
  } finally {
    writeFileSync('.impeccable.md', original)
  }
})

test('check-agent-docs - missing SoT section fails (failure path)', async () => {
  const original = readFileSync('AGENTS.md', 'utf8')
  const broken = original.replace('Source of Truth', 'Something Else')
  writeFileSync('AGENTS.md', broken)
  try {
    execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
    assert.fail('Should have exited non-zero')
  } catch (e) {
    assert.ok(e.stdout?.includes('AD-000') || e.stdout?.includes('FAIL'), 'Should report AD-000 for missing SoT')
    assert.ok(e.status !== 0, 'Should exit non-zero')
  } finally {
    writeFileSync('AGENTS.md', original)
  }
})
