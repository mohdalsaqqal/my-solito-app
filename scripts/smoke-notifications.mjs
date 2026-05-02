import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    console.error(`[notifications-smoke] FAIL missing ${relativePath}`)
    process.exit(1)
  }
  return readFileSync(fullPath, 'utf8')
}

function assert(label, condition) {
  if (!condition) {
    console.error(`[notifications-smoke] FAIL ${label}`)
    process.exit(1)
  }
  console.log(`[notifications-smoke] PASS ${label}`)
}

function run(label, command) {
  console.log(`[notifications-smoke] RUN ${label}`)
  const result = spawnSync(
    process.platform === 'win32' ? 'cmd.exe' : 'sh',
    process.platform === 'win32' ? ['/d', '/s', '/c', command] : ['-lc', command],
    {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    },
  )

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1)
  }
}

const contract = read('packages/providers/contracts/NotificationProvider.ts')
const registry = read('packages/providers/registry.ts')
const emailAdapter = read('packages/adapters/email/index.ts')
const muxAdapter = read('packages/adapters/notification-mux/index.ts')
const service = read('apps/next/server/services/notifications/notification.service.ts')
const controlService = read('apps/next/server/services/notifications/notification-control.service.ts')
const deadLetter = read('apps/next/server/services/notifications/notification-dead-letter.service.ts')
const adminRoute = read('apps/next/app/api/admin/notifications/route.ts')
const templateRoute = read('apps/next/app/api/admin/notifications/templates/[id]/route.ts')
const campaignRoute = read('apps/next/app/api/admin/notifications/campaigns/route.ts')
const adminPage = read('apps/next/app/admin/marketing/notifications/page.tsx')
const adminShell = read('apps/next/app/admin/_components/AdminShell.tsx')
const envExample = read('.env.example')

assert('NotificationProvider supports email recipient', /recipientEmail/.test(contract))
assert('NotificationProvider supports multi-channel delivery', /multi-channel/.test(contract))
assert('email adapter exports env factory', /createEmailNotificationAdapterFromEnv/.test(emailAdapter))
assert('email adapter posts to configured endpoint', /fetch\(options\.endpoint/.test(emailAdapter))
assert('notification mux routes email channel', /message\.channel === 'email'/.test(muxAdapter))
assert('provider registry wires email adapter', /createEmailNotificationAdapterFromEnv/.test(registry))
assert('provider registry uses multi-channel provider', /createMultiChannelNotificationProvider/.test(registry))
assert('notification service records dead letters', /recordNotificationDeadLetter/.test(service))
assert('notification service exposes status', /getNotificationStatus/.test(service))
assert('notification control service exposes templates', /AdminNotificationTemplate/.test(controlService))
assert('notification control service can create campaigns', /createAdminNotificationCampaign/.test(controlService))
assert('notification admin API is admin guarded', /requireAdminAnyDomainSession/.test(adminRoute))
assert('notification template API is marketing full guarded', /requireAdminDomainSession\(request, 'marketing', 'full'\)/.test(templateRoute))
assert('notification campaign API creates campaigns', /createAdminNotificationCampaign/.test(campaignRoute))
assert('admin notifications page exists', /AdminNotificationsPage/.test(adminPage))
assert('admin navigation links notifications', /\/admin\/marketing\/notifications/.test(adminShell))
assert('dead-letter store has retry policy', /nextRetryAt/.test(deadLetter) && /retryCount/.test(deadLetter))
assert('env example documents email notifications', /USE_EMAIL_NOTIFICATIONS/.test(envExample))

run(
  'notification service focused tests',
  'yarn --cwd apps/next node --max-old-space-size=4096 ../../node_modules/tsx/dist/cli.mjs --test --test-concurrency=1 server/services/notifications/notification.service.test.ts server/services/notifications/notification-control.service.test.ts',
)
run(
  'email adapter focused tests',
  'yarn --cwd packages/adapters node ../../node_modules/tsx/dist/cli.mjs --test email/index.test.ts',
)
