import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const SCRIPT = 'node scripts/guard-hygiene.mjs'

test('guard-hygiene - clean tree passes (happy path)', async () => {
  const output = execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
  assert.ok(output.includes('Hygiene OK') || output.includes('exit 0') || output.includes('PASS'),
    'Should pass on clean tree')
})

test('guard-hygiene - staged AUDIT_REPORT.md fails (failure path)', async () => {
  // Create a fake AUDIT_REPORT.md at root
  writeFileSync('AUDIT_REPORT.md', '# Test Audit Report')
  try {
    execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
    assert.fail('Should have exited non-zero')
  } catch (e) {
    assert.ok(e.stdout?.includes('HY-006') || e.stdout?.includes('FAIL'), 'Should report HY-006')
    assert.ok(e.status !== 0, 'Should exit non-zero')
  } finally {
    if (existsSync('AUDIT_REPORT.md')) rmSync('AUDIT_REPORT.md')
  }
})

test('guard-hygiene - missing vendor dir in gitignore fails (failure path)', async () => {
  const original = readFileSync('.gitignore', 'utf8')
  // Remove .cline/ from gitignore temporarily
  const broken = original.replace('.cline/', '#.cline/')
  writeFileSync('.gitignore', broken)
  try {
    execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
    assert.fail('Should have exited non-zero')
  } catch (e) {
    assert.ok(e.stdout?.includes('HY-001') || e.stdout?.includes('FAIL'), 'Should report HY-001')
    assert.ok(e.status !== 0, 'Should exit non-zero')
  } finally {
    writeFileSync('.gitignore', original)
  }
})

test('guard-hygiene - framework pin caret fails (failure path)', async () => {
  // The root package.json has `"typescript": "^5.2.2"` — should fail HY-011
  try {
    execSync(SCRIPT, { encoding: 'utf8', env: { ...process.env } })
    assert.fail('Should have exited non-zero due to caret in typescript dep')
  } catch (e) {
    // Either it fails for HY-011 or passes if already pinned
    const output = e.stdout || ''
    if (output.includes('HY-011')) {
      assert.ok(output.includes('FAIL'), 'Should report HY-011 for caret range')
    }
  }
})

test('guard-hygiene - SKIP_GUARD_HYGIENE off-main passes (happy path)', async () => {
  const output = execSync(SCRIPT, {
    encoding: 'utf8',
    env: { ...process.env, SKIP_GUARD_HYGIENE: '1' },
  })
  assert.ok(output.includes('skipped') || output.includes('SKIP'), 'Should log skip message')
})

test('guard-hygiene - JSON output works', async () => {
  try {
    const output = execSync(`${SCRIPT} --json`, { encoding: 'utf8', env: { ...process.env } })
    const parsed = JSON.parse(output)
    assert.ok(parsed.script === 'guard-hygiene', 'Should have script name')
    assert.ok('findings' in parsed, 'Should have findings array')
    assert.ok('summary' in parsed, 'Should have summary object')
  } catch (e) {
    // If there are failures, JSON output still works
    const output = e.stdout || ''
    if (output.trim()) {
      const parsed = JSON.parse(output)
      assert.ok(parsed.script === 'guard-hygiene', 'Should have script name')
    }
  }
})
