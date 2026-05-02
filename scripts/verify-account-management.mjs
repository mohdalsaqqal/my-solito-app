import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    console.error(`[account-management] FAIL missing ${relativePath}`)
    process.exit(1)
  }
  return readFileSync(fullPath, 'utf8')
}

function assert(label, condition) {
  if (!condition) {
    console.error(`[account-management] FAIL ${label}`)
    process.exit(1)
  }
  console.log(`[account-management] PASS ${label}`)
}

const runbook = read('docs/delivery/runbooks/user-account-management.md')
const schema = read('apps/next/prisma/schema.prisma')
const migration = read('apps/next/prisma/migrations/20260430180000_tenant_user_membership/migration.sql')
const envExample = read('.env.example')
const accountPageTest = read('apps/next/server/services/account/account-page.service.test.ts')
const accountTestDetailTest = read('apps/next/server/services/account/account-test-detail.service.test.ts')
const expoRouterTypes = read('apps/expo/app/_components/AppRouter.types.ts')
const expoRouter = read('apps/expo/app/_components/AppRouter.tsx')

assert('runbook covers Better Auth boundary', /Better Auth owns identity and sessions/.test(runbook))
assert('runbook covers tenant membership model', /TenantUser/.test(runbook))
assert('runbook covers account flow acceptance', /Account Flow Acceptance/.test(runbook))
assert('runbook keeps pharmacist workflows web-only', /Pharmacist access is web-only/.test(runbook))
assert('runbook covers optional OAuth setup', /OAuth is optional/.test(runbook))

assert('schema defines Tenant model', /model Tenant\s+\{/.test(schema))
assert('schema defines TenantUser model', /model TenantUser\s+\{/.test(schema))
assert('schema enforces unique tenant user membership', /@@unique\(\[tenantId,\s*userId\]\)/.test(schema))
assert('schema maps tenant_user table', /@@map\("tenant_user"\)/.test(schema))
assert('migration creates tenant table', /CREATE TABLE "tenant"/.test(migration))
assert('migration creates tenant_user table', /CREATE TABLE "tenant_user"/.test(migration))
assert('migration seeds default tenant', /INSERT INTO "tenant"/.test(migration))

assert('env example documents Google OAuth placeholders', /BETTER_AUTH_GOOGLE_CLIENT_ID/.test(envExample))
assert('env example documents Apple OAuth placeholders', /BETTER_AUTH_APPLE_CLIENT_ID/.test(envExample))
assert('account page test asserts referral summary', /referralSummary\?\.code/.test(accountPageTest))
assert('account page test asserts loyalty wallet', /loyaltyWallet/.test(accountPageTest))
assert('account page test asserts hair and skin tests', /template\.type === 'skin'/.test(accountPageTest) && /template\.type === 'hair'/.test(accountPageTest))
assert('account test detail test asserts questionnaire', /questionnaire answers should be visible/.test(accountTestDetailTest))
assert('account test detail test asserts recommendations', /recommended products should be visible/.test(accountTestDetailTest))
assert('native router exposes account view', /['"]account['"]/.test(expoRouterTypes) && /view\s*===\s*['"]account['"]/.test(expoRouter))
assert('native router exposes orders view', /['"]orders['"]/.test(expoRouterTypes) && /view\s*===\s*['"]orders['"]/.test(expoRouter))
assert('native router exposes account test detail view', /['"]account-test-detail['"]/.test(expoRouterTypes) && /view\s*===\s*['"]account-test-detail['"]/.test(expoRouter))

const command = [
  'yarn',
  '--cwd',
  'apps/next',
  'node',
  '--max-old-space-size=4096',
  '../../node_modules/tsx/dist/cli.mjs',
  '--test',
  '--test-concurrency=1',
  'server/services/auth/auth-session-adapter.service.test.ts',
  'server/services/account/account-addresses.service.test.ts',
  'server/services/account/account-page.service.test.ts',
  'server/services/account/account-test-detail.service.test.ts',
].join(' ')

const shell = process.platform === 'win32' ? 'cmd.exe' : 'sh'
const args = process.platform === 'win32' ? ['/d', '/s', '/c', command] : ['-lc', command]

const result = spawnSync(shell, args, {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test',
    REQUIRE_PRODUCTION_AUTH: 'false',
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? 'test-better-auth-secret-32-characters-minimum',
    AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET ?? 'test-auth-session-secret-32-characters-minimum',
  },
})

process.exit(result.status ?? 1)
