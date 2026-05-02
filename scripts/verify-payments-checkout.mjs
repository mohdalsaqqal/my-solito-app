import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  const fullPath = join(rootDir, relativePath)
  if (!existsSync(fullPath)) {
    console.error(`[payments-checkout] FAIL missing ${relativePath}`)
    process.exit(1)
  }
  return readFileSync(fullPath, 'utf8')
}

function assert(label, condition) {
  if (!condition) {
    console.error(`[payments-checkout] FAIL ${label}`)
    process.exit(1)
  }
  console.log(`[payments-checkout] PASS ${label}`)
}

function run(label, command, cwd = rootDir) {
  console.log(`[payments-checkout] RUN ${label}`)
  const shell = process.platform === 'win32' ? 'cmd.exe' : 'sh'
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', command] : ['-lc', command]
  const result = spawnSync(shell, args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      REQUIRE_PRODUCTION_AUTH: 'false',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? 'test-better-auth-secret-32-characters-minimum',
      AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET ?? 'test-auth-session-secret-32-characters-minimum',
    },
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const placeOrderService = read('apps/next/server/services/orders/place-order.service.ts')
const reconciliationService = read('apps/next/server/services/checkout/checkout-reconciliation.service.ts')
const placeOrderTest = read('apps/next/server/services/orders/place-order.service.test.ts')
const customPaymentRunbook = read('docs/delivery/runbooks/custom-payment-gateway.md')
const paymentContract = read('packages/providers/contracts/PaymentProvider.ts')

assert('PaymentProvider contract requires idempotency key', /idempotencyKey:\s*string/.test(paymentContract))
assert('order service records order write-back reconciliation', /kind:\s*'order_write_back_failed'/.test(placeOrderService))
assert('order service records loyalty reversal reconciliation', /kind:\s*'loyalty_reversal_required'/.test(placeOrderService))
assert('order service records referral ledger reconciliation', /kind:\s*'referral_ledger_failed'/.test(placeOrderService))
assert('reconciliation service stores durable records', /CheckoutReconciliationRecord/.test(reconciliationService) && /checkout-reconciliation-store\.json/.test(reconciliationService))
assert('place order test covers write-back reconciliation', /records reconciliation when payment succeeds but order write-back fails/.test(placeOrderTest))
assert('gateway runbook documents reconciliation behavior', /Checkout Reconciliation/.test(customPaymentRunbook))

run(
  'Next payment/order focused tests',
  [
    'yarn',
    '--cwd',
    'apps/next',
    'node',
    '--max-old-space-size=4096',
    '../../node_modules/tsx/dist/cli.mjs',
    '--test',
    '--test-concurrency=1',
    'server/services/orders/place-order.service.test.ts',
    'server/services/payments/custom-payment-webhook.service.test.ts',
  ].join(' '),
)

run(
  'custom-payment adapter tests',
  'yarn --cwd packages/adapters node ../../node_modules/tsx/dist/cli.mjs --test custom-payment/index.test.ts',
)
