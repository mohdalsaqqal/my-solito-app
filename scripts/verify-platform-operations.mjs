import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const tmpRoot = resolve(root, '.tmp')
const outputDir = resolve(tmpRoot, 'platform-operations-client')

let failures = 0

function pass(message) {
  console.log(`[platform-operations] PASS ${message}`)
}

function fail(message) {
  failures += 1
  console.error(`[platform-operations] FAIL ${message}`)
}

function read(path) {
  return readFileSync(resolve(root, path), 'utf8')
}

function expectFile(path, message) {
  if (existsSync(resolve(root, path))) pass(message)
  else fail(`${message}: missing ${path}`)
}

function expectIncludes(path, needle, message) {
  const content = read(path)
  if (content.includes(needle)) pass(message)
  else fail(`${message}: ${path} does not include ${needle}`)
}

function run(command, args, message) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
  })

  if (result.status === 0) {
    pass(message)
    return result
  }

  fail(`${message}: ${result.stderr || result.stdout || `exit ${result.status}`}`)
  return result
}

function safeCleanOutputDir() {
  const resolvedTmp = resolve(root, '.tmp')
  const resolvedOutput = resolve(outputDir)
  if (!resolvedOutput.startsWith(`${resolvedTmp}\\`) && !resolvedOutput.startsWith(`${resolvedTmp}/`)) {
    fail(`Refusing to clean unsafe path: ${resolvedOutput}`)
    return
  }

  rmSync(resolvedOutput, { recursive: true, force: true })
  mkdirSync(resolvedTmp, { recursive: true })
}

expectFile('scripts/new-client.ts', 'new-client provisioning command exists')
expectFile('docs/delivery/runbooks/platform-operations.md', 'platform operations runbook exists')
expectFile('docs/delivery/runbooks/client-onboarding.md', 'client onboarding runbook exists')
expectFile('docs/delivery/runbooks/sla-support.md', 'support/SLA runbook exists')
expectFile('docs/delivery/runbooks/source-code-buyout.md', 'source-code buyout/offboarding runbook exists')

expectIncludes('scripts/new-client.ts', '--dry-run', 'new-client supports dry-run')
expectIncludes('scripts/new-client.ts', '--force', 'new-client supports idempotent regeneration')
expectIncludes('scripts/new-client.ts', 'client.json', 'new-client writes tenant config')
expectIncludes('scripts/new-client.ts', 'adapters', 'tenant config includes adapter selections')
expectIncludes('scripts/new-client.ts', 'TENANT_ID', 'generated env includes tenant identity')
expectIncludes('scripts/new-client.ts', 'STRICT_PROVIDER_READINESS', 'generated env includes strict provider readiness')
expectIncludes('docs/delivery/runbooks/platform-operations.md', 'Tenant Config Format', 'runbook documents tenant config format')
expectIncludes('docs/delivery/runbooks/platform-operations.md', 'Cross-Client Patch Strategy', 'runbook documents patch strategy')
expectIncludes('docs/delivery/runbooks/platform-operations.md', 'Support Triage', 'runbook documents support triage')
expectIncludes('docs/delivery/runbooks/platform-operations.md', 'Client Offboarding', 'runbook documents offboarding')
expectIncludes('package.json', 'verify:platform-operations', 'package exposes platform operations verifier')
expectIncludes('scripts/verify-delivery.mjs', "'platform-operations'", 'delivery verifier has platform operations gate')
expectIncludes('scripts/verify-delivery.mjs', 'platform:', 'delivery verifier has platform profile')

safeCleanOutputDir()

run(
  'node',
  [
    'node_modules/tsx/dist/cli.mjs',
    'scripts/new-client.ts',
    '--slug',
    'platform-ops-smoke',
    '--name',
    'Platform Ops Smoke',
    '--domains',
    'platform-ops.example.com,www.platform-ops.example.com',
    '--output',
    '.tmp/platform-operations-client',
    '--dry-run',
  ],
  'new-client dry-run works',
)

run(
  'node',
  [
    'node_modules/tsx/dist/cli.mjs',
    'scripts/new-client.ts',
    '--slug',
    'platform-ops-smoke',
    '--name',
    'Platform Ops Smoke',
    '--domains',
    'platform-ops.example.com,www.platform-ops.example.com',
    '--output',
    '.tmp/platform-operations-client',
    '--force',
  ],
  'new-client writes generated client files',
)

const generatedEnvPath = resolve(outputDir, '.env')
const generatedConfigPath = resolve(outputDir, 'client.json')

if (existsSync(generatedEnvPath) && existsSync(generatedConfigPath)) {
  pass('generated .env and client.json exist')

  const generatedEnv = readFileSync(generatedEnvPath, 'utf8')
  const generatedConfig = JSON.parse(readFileSync(generatedConfigPath, 'utf8'))

  if (generatedEnv.includes('TENANT_ID=platform-ops-smoke')) pass('generated env scopes tenant')
  else fail('generated env missing tenant scope')

  const requiredAdapters = ['catalog', 'orderWriteBack', 'payment', 'search', 'notification']
  for (const key of requiredAdapters) {
    if (typeof generatedConfig.adapters?.[key] === 'string' && generatedConfig.adapters[key]) {
      pass(`generated config includes ${key} adapter`)
    } else {
      fail(`generated config missing ${key} adapter`)
    }
  }

  if (Array.isArray(generatedConfig.provisioningChecklist) && generatedConfig.provisioningChecklist.length >= 8) {
    pass('generated config includes provisioning checklist')
  } else {
    fail('generated config provisioning checklist is incomplete')
  }
} else {
  fail('generated client files were not written')
}

run(
  'node',
  [
    'node_modules/tsx/dist/cli.mjs',
    'scripts/new-client.ts',
    '--slug',
    'platform-ops-smoke',
    '--output',
    '.tmp/platform-operations-client',
  ],
  'new-client rerun is idempotent',
)

safeCleanOutputDir()

if (failures > 0) {
  console.error(`[platform-operations] ${failures} check(s) failed`)
  process.exit(1)
}

console.log('[platform-operations] all checks passed')
