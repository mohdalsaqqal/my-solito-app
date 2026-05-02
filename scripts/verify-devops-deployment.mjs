#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
let failed = 0

function pass(label) {
  console.log(`[devops-deployment] PASS ${label}`)
}

function fail(label, detail = '') {
  failed += 1
  console.error(`[devops-deployment] FAIL ${label}${detail ? `: ${detail}` : ''}`)
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

function expectMatch(label, content, pattern) {
  if (pattern.test(content)) {
    pass(label)
  } else {
    fail(label, `missing ${pattern}`)
  }
}

const packageJson = read('package.json')
const deliveryVerifier = read('scripts/verify-delivery.mjs')
const newClient = read('scripts/new-client.ts')
const eas = read('eas.json')
const ci = read('.github/workflows/ci.yml')
const stagingRunbook = read('docs/delivery/runbooks/staging-deployment.md')
const backupRunbook = read('docs/delivery/runbooks/backup-recovery.md')
const easRunbook = read('docs/eas-runbook.md')

expectIncludes('package exposes devops deployment verifier', packageJson, '"verify:devops-deployment"')
expectIncludes('delivery verifier has devops deployment gate', deliveryVerifier, "'devops-deployment'")
expectIncludes('delivery verifier has deploy profile', deliveryVerifier, 'deploy:')

expectIncludes('new-client supports custom output directory', newClient, "argValue('--output')")
expectIncludes('new-client emits tenant id', newClient, 'TENANT_ID=')
expectIncludes('new-client emits Better Auth secret', newClient, 'BETTER_AUTH_SECRET=')
expectIncludes('new-client emits database url placeholder', newClient, 'DATABASE_URL=')
expectIncludes('new-client checklist includes staging', newClient, 'staging Vercel')

expectMatch('EAS preview profile exists', eas, /"preview"\s*:\s*\{[\s\S]*"channel"\s*:\s*"preview"/)
expectMatch('EAS production profile exists', eas, /"production"\s*:\s*\{[\s\S]*"channel"\s*:\s*"production"/)
expectIncludes('EAS runbook documents preview build', easRunbook, 'build --profile preview')
expectIncludes('EAS runbook documents OTA preview channel', easRunbook, 'update --channel preview')

expectIncludes('CI runs architecture guard', ci, 'yarn guard:checks')
expectIncludes('CI runs hygiene guard', ci, 'yarn guard:hygiene')
expectIncludes('CI runs agent-doc guard', ci, 'yarn guard:agent-docs')
expectIncludes('CI runs Next typecheck', ci, 'tsc -p apps/next/tsconfig.json')
expectIncludes('CI runs API tests', ci, 'yarn --cwd apps/next test:api')
expectIncludes('CI runs production build', ci, 'yarn workspace next-app build')

expectIncludes('staging runbook covers Vercel env vars', stagingRunbook, 'vercel env add DATABASE_URL preview')
expectIncludes('staging runbook covers Vercel deploy', stagingRunbook, 'vercel deploy')
expectIncludes('staging runbook covers Prisma migrate deploy', stagingRunbook, 'prisma migrate deploy')
expectIncludes('staging runbook covers Expo preview build', stagingRunbook, 'build --profile preview')
expectIncludes('staging runbook covers post-deploy functional smoke', stagingRunbook, 'FUNCTIONAL_BASE_URL=https://client-staging.example.com yarn verify:functional-storefront')
expectIncludes('staging runbook covers rollback', stagingRunbook, 'vercel rollback')
expectIncludes('backup runbook covers PITR', backupRunbook, 'Point-in-Time Recovery')

const shell = process.platform === 'win32' ? 'cmd.exe' : 'sh'
const shellArgs =
  process.platform === 'win32'
    ? ['/d', '/s', '/c']
    : ['-lc']
const dryRun = spawnSync(
  shell,
  [
    ...shellArgs,
    'npx --no-install tsx scripts/new-client.ts --slug devops-smoke --name "DevOps Smoke" --domains "devops-smoke.example.com" --output .tmp/devops-smoke-client --dry-run',
  ],
  {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  },
)

if (dryRun.status === 0 && dryRun.stdout.includes('--dry-run: would create') && dryRun.stdout.includes('No files written.')) {
  pass('new-client dry-run succeeds with output directory')
} else {
  fail('new-client dry-run succeeds with output directory', `${dryRun.stdout}${dryRun.stderr}`)
}

if (failed > 0) {
  console.error(`[devops-deployment] ${failed} failed`)
  process.exit(1)
}

console.log('[devops-deployment] all checks passed')
