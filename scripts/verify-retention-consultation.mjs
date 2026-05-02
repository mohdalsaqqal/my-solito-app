import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    console.error(`[retention-consultation] missing ${relativePath}`)
    process.exit(1)
  }
  return readFileSync(fullPath, 'utf8')
}

function assertIncludes(label, text, pattern) {
  if (!pattern.test(text)) {
    console.error(`[retention-consultation] FAIL ${label}`)
    process.exit(1)
  }
  console.log(`[retention-consultation] PASS ${label}`)
}

const persistenceRunbook = read('docs/delivery/runbooks/retention-consultation-persistence.md')
assertIncludes('runbook covers referral persistence', persistenceRunbook, /ReferralProfile/)
assertIncludes('runbook covers loyalty wallet persistence', persistenceRunbook, /LoyaltyWallet/)
assertIncludes('runbook covers pharmacist consultation persistence', persistenceRunbook, /ConsultationTest/)
assertIncludes('runbook covers tenant scoping', persistenceRunbook, /tenantId/)
assertIncludes('runbook covers customer mobile vs pharmacist web boundary', persistenceRunbook, /Pharmacist access is web-only/)

const pharmacistService = read('apps/next/server/services/pharmacist/pharmacist-consultation.service.ts')
assertIncludes('pharmacist service preserves questionnaire payload', pharmacistService, /questionnaire:\s*questionnaire\(payload\.questionnaire\)/)

const testFiles = [
  'app/api/referral/validate/route.test.ts',
  'app/api/referral/apply/route.test.ts',
  'app/api/account/referral/route.test.ts',
  'app/api/admin/referral/settings/route.test.ts',
  'app/api/admin/referral/profiles/route.test.ts',
  'server/services/account/account-page.service.test.ts',
  'server/services/checkout/checkout-page.service.test.ts',
  'server/services/checkout/checkout-quote.service.test.ts',
  'server/services/orders/place-order.service.test.ts',
  'server/services/account/account-test-detail.service.test.ts',
  'server/services/pharmacist/pharmacist-consultation.service.test.ts',
  'server/services/pharmacist/pharmacist-bootstrap.service.test.ts',
]

const command = [
  'yarn',
  '--cwd',
  'apps/next',
  'node',
  '--max-old-space-size=4096',
  '../../node_modules/tsx/dist/cli.mjs',
  '--test',
  '--test-concurrency=1',
  ...testFiles,
].join(' ')

const shell = process.platform === 'win32' ? 'cmd.exe' : 'sh'
const args = process.platform === 'win32' ? ['/d', '/s', '/c', command] : ['-lc', command]

const result = spawnSync(shell, args, {
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
