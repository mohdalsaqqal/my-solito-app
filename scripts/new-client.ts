import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CLIENTS_DIR = join(ROOT, 'clients')

const args = process.argv.slice(2)

function argValue(flag: string): string | null {
  const eqIdx = args.findIndex((a) => a.startsWith(`${flag}=`))
  if (eqIdx !== -1) return args[eqIdx].split('=', 2)[1] ?? null
  const idx = args.indexOf(flag)
  if (idx !== -1 && idx + 1 < args.length) {
    const next = args[idx + 1]
    return next && !next.startsWith('--') ? next : null
  }
  return null
}

const SLUG = argValue('--slug')
const NAME = argValue('--name')
const DOMAINS = argValue('--domains')
const FORCE = args.includes('--force')
const DRY_RUN = args.includes('--dry-run')
const HELP = args.includes('--help') || args.includes('-h')

function log(msg: string) { console.log(`[new-client] ${msg}`) }
function warn(msg: string) { console.warn(`[new-client] WARN: ${msg}`) }
function fail(msg: string): never {
  console.error(`[new-client] FAIL: ${msg}`)
  process.exit(1)
}

if (HELP) {
  console.log(`
Usage: npx tsx scripts/new-client.ts --slug <client-slug> [options]

Options:
  --slug <slug>       Required. URL-safe client identifier (e.g. "niceone").
  --name <name>       Display name. Defaults to slug.
  --domains <domains> Comma-separated production domains (e.g. "niceone.com,www.niceone.com").
  --output <dir>      Output directory. Default: clients/<slug>/.
  --force             Overwrite existing client files.
  --dry-run           Print what would be created without writing.

Example:
  npx tsx scripts/new-client.ts --slug niceone --name "Nice One" --domains "niceone.com,www.niceone.com"
`)
  process.exit(0)
}

if (!SLUG) {
  fail('--slug is required. Use --help for usage.')
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(SLUG)) {
  fail(`Invalid slug "${SLUG}". Use lowercase alphanumeric with optional hyphens (e.g. "niceone", "client-two").`)
}

const displayName = NAME ?? SLUG
const outputDir = join(CLIENTS_DIR, SLUG)
const envFilePath = join(outputDir, '.env')
const configFilePath = join(outputDir, 'client.json')

// ── Idempotency check ────────────────────────────────────────────────────

if (existsSync(envFilePath) && !FORCE) {
  log(`Client "${SLUG}" already provisioned at ${envFilePath}`)
  log('Use --force to regenerate. No changes made.')
  process.exit(0)
}

if (existsSync(outputDir) && FORCE) {
  log(`--force: overwriting existing client files in ${outputDir}`)
}

// ── Secret generation ────────────────────────────────────────────────────

function generateSecret(label: string, bytes = 48): string {
  const secret = randomBytes(bytes).toString('base64url')
  log(`Generated ${label}`)
  return secret
}

const secrets = {
  AUTH_SESSION_SECRET: generateSecret('AUTH_SESSION_SECRET'),
  BETTER_AUTH_SECRET: generateSecret('BETTER_AUTH_SECRET'),
  PREVIEW_TOKEN_SECRET: generateSecret('PREVIEW_TOKEN_SECRET'),
  TRUSTED_REQUEST_BYPASS_SECRET: generateSecret('TRUSTED_REQUEST_BYPASS_SECRET', 32),
}

// ── Domain resolution ────────────────────────────────────────────────────

const domainList = DOMAINS ? DOMAINS.split(',').map((d) => d.trim()).filter(Boolean) : []
const primaryDomain = domainList[0] ?? `${SLUG}.example.com`
const baseUrl = `https://${primaryDomain}`
const trustedOrigins = domainList.length > 0
  ? domainList.map((d) => `https://${d}`).join(',')
  : baseUrl

// ── Env file template ────────────────────────────────────────────────────

const envContent = [
  `# ── Client: ${displayName} (${SLUG}) ──`,
  `# Generated: ${new Date().toISOString()}`,
  `# This file is the production baseline. Fill placeholder values before deploy.`,
  '',
  '# ── Tenant ──',
  `TENANT_ID=${SLUG}`,
  '',
  '# ── Provider Mock Toggle ──',
  'USE_MOCK=false',
  'USE_TRANSLATION_MOCK=true',
  '',
  '# ── Auth ──',
  `AUTH_SESSION_SECRET=${secrets.AUTH_SESSION_SECRET}`,
  `BETTER_AUTH_SECRET=${secrets.BETTER_AUTH_SECRET}`,
  `BETTER_AUTH_URL=${baseUrl}`,
  `BETTER_AUTH_TRUSTED_ORIGINS=${trustedOrigins}`,
  `BETTER_AUTH_PASSWORD_RESET_DELIVERY=console`,
  'REQUIRE_PRODUCTION_AUTH=true',
  'AUTH_COOKIE_SECURE=true',
  '',
  '# ── Preview ──',
  `PREVIEW_TOKEN_SECRET=${secrets.PREVIEW_TOKEN_SECRET}`,
  `TRUSTED_REQUEST_BYPASS_SECRET=${secrets.TRUSTED_REQUEST_BYPASS_SECRET}`,
  '',
  '# ── Database ──',
  `# Replace with the provisioned database URL for ${SLUG}.`,
  `DATABASE_URL=postgresql://user:password@host:5432/${SLUG}_db`,
  '',
  '# ── Rate Limiting ──',
  'RATE_LIMIT_STORE=prisma',
  '',
  '# ── URLs ──',
  `NEXT_PUBLIC_API_BASE_URL=${baseUrl}`,
  `EXPO_PUBLIC_API_BASE_URL=${baseUrl}`,
  '',
  '# ── Push Notifications ──',
  'USE_EXPO_PUSH=false',
  'EXPO_PUSH_ACCESS_TOKEN=',
  '',
  '# ── Odoo ERP ──',
  '# Fill with client Odoo credentials when available.',
  'ODOO_BASE_URL=https://your-odoo-instance.example.com',
  'ODOO_DB=your_database_name',
  'ODOO_API_KEY=your_odoo_api_key',
  '',
  '# ── Shopify ──',
  '# Fill if client uses Shopify as merchant backend.',
  'SHOPIFY_STORE_DOMAIN=client.myshopify.com',
  'SHOPIFY_ADMIN_ACCESS_TOKEN=your_shopify_admin_access_token',
  'SHOPIFY_ADMIN_API_VERSION=2026-01',
  'SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret',
  '',
  '# ── Custom PostgreSQL Backend ──',
  '# Fill if client exposes catalog/order data through PostgreSQL.',
  'MERCHANT_POSTGRES_URL=postgresql://merchant_user:merchant_password@merchant-db.example.com:5432/merchant',
  'MERCHANT_POSTGRES_SCHEMA=public',
  'MERCHANT_POSTGRES_SSL=true',
  'MERCHANT_POSTGRES_READONLY=true',
  '',
  '# ── Meilisearch ──',
  `USE_MEILISEARCH=false`,
  'MEILISEARCH_HOST=https://search.example.com',
  'MEILISEARCH_API_KEY=your_meilisearch_api_key',
  `MEILISEARCH_PRODUCTS_INDEX=products_${SLUG}`,
  '',
  '# ── Payment Gateway ──',
  '# Fill with client payment gateway credentials.',
  'USE_CUSTOM_PAYMENT=true',
  'CUSTOM_PAYMENT_BASE_URL=https://payments.example.com',
  'CUSTOM_PAYMENT_API_KEY=your_custom_payment_api_key',
  'CUSTOM_PAYMENT_WEBHOOK_SECRET=your_custom_payment_webhook_secret',
  'CUSTOM_PAYMENT_PROVIDER_NAME=custom_gateway',
  '',
  '# ── Networks Payment Gateway ──',
  '# Fill if client uses Networks payment.',
  'NETWORKS_BASE_URL=https://api.networks.sa',
  'NETWORKS_API_KEY=your_merchant_api_key',
  'NETWORKS_WEBHOOK_SECRET=your_webhook_hmac_secret',
  'NETWORKS_MERCHANT_ID=your_merchant_id',
  '',
  '# ── CDN ──',
  'CDN_PURGE_URL=',
  'CDN_PURGE_SECRET=',
  '',
  '# ── Provider Readiness ──',
  'STRICT_PROVIDER_READINESS=true',
  '',
].join('\n')

// ── Client config JSON ───────────────────────────────────────────────────

const clientConfig = {
  slug: SLUG,
  name: displayName,
  createdAt: new Date().toISOString(),
  domains: domainList,
  secrets: Object.keys(secrets).reduce(
    (acc, key) => ({ ...acc, [key]: `<from-env>` }),
    {} as Record<string, string>,
  ),
  adapters: {
    catalog: 'odoo-erp',
    orderWriteBack: 'odoo-erp',
    payment: 'custom-payment',
    search: 'meilisearch',
    notification: 'expo-push',
  },
  provisioningChecklist: [
    'Provision database and update DATABASE_URL in .env',
    'Provision secrets in secret manager (Infisical/Doppler)',
    'Configure Vercel/Next deployment with this .env',
    'Run yarn prisma migrate deploy against provisioned database',
    domainList.length > 0
      ? 'Verify DNS and SSL for production domains'
      : 'Set production domains and update BETTER_AUTH_URL / BETTER_AUTH_TRUSTED_ORIGINS',
    'Set Odoo credentials when available',
    'Set payment gateway credentials and verify sandbox flow',
    'Set Meilisearch credentials when search is needed',
    'Run yarn verify:delivery after adapter setup',
  ].filter(Boolean),
}

// ── Write files ──────────────────────────────────────────────────────────

if (DRY_RUN) {
  log(`--dry-run: would create ${outputDir}/`)
  log(`  .env (${envContent.split('\n').length} lines)`)
  log(`  client.json (${JSON.stringify(clientConfig, null, 2).split('\n').length} lines)`)
  log('No files written.')
} else {
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(envFilePath, envContent, 'utf8')
  log(`Wrote ${envFilePath}`)
  writeFileSync(configFilePath, JSON.stringify(clientConfig, null, 2) + '\n', 'utf8')
  log(`Wrote ${configFilePath}`)
}

// ── Validation ───────────────────────────────────────────────────────────

if (DRY_RUN) {
  log('Dry run complete.')
  process.exit(0)
}

log('Validating generated output...')

const written = readFileSync(envFilePath, 'utf8')
const requiredKeys = [
  'TENANT_ID',
  'AUTH_SESSION_SECRET',
  'BETTER_AUTH_SECRET',
  'PREVIEW_TOKEN_SECRET',
  'DATABASE_URL',
  'STRICT_PROVIDER_READINESS',
]

for (const key of requiredKeys) {
  const re = new RegExp(`^${key}=`, 'm')
  if (!re.test(written)) {
    fail(`Missing required key in generated .env: ${key}`)
  }
}

// Verify secrets are not the placeholder defaults
const placeholderPatterns = [/CHANGE_ME/, /your_odoo_api_key/, /your_shopify_admin_access_token/]
for (const key of Object.keys(secrets)) {
  const value = (written.match(new RegExp(`^${key}=(.+)$`, 'm')) ?? [])[1]
  if (!value || placeholderPatterns.some((p) => p.test(value))) {
    fail(`${key} contains a placeholder value. This is a bug.`)
  }
}

log('Validation passed.')

// ── Summary ──────────────────────────────────────────────────────────────

console.log(`
Provisioning complete for "${displayName}" (${SLUG}).

Generated files:
  ${envFilePath}
  ${configFilePath}

Next steps:
  1. Copy ${envFilePath} to your deployment environment (Vercel, Infisical, etc.)
  2. Provision a PostgreSQL database and update DATABASE_URL
  3. Run: npx prisma migrate deploy (from apps/next)
  4. Run: yarn verify:delivery
  5. Complete adapter configuration (Odoo, payment, search) per the runbooks
  6. Follow docs/delivery/runbooks/client-onboarding.md for full checklist
`)

process.exit(0)
