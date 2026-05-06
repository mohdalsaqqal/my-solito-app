#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'

const REQUIRED_CUSTOMER_DOMAINS = [
  'auth',
  'cms',
  'cmsPageConfig',
  'cmsPageVersion',
  'release',
  'product',
  'category',
  'brand',
  'order',
  'payment',
]

function loadDotenv(path = '.env') {
  if (!existsSync(path)) return
  const source = readFileSync(path, 'utf8')
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) continue
    const key = trimmed.slice(0, equalsIndex).trim()
    if (!key || process.env[key] !== undefined) continue
    let value = trimmed.slice(equalsIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadDotenv()

function boolEnv(name, fallback = false) {
  const value = process.env[name]?.trim().toLowerCase()
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return fallback
}

function hasEnv(name) {
  const value = process.env[name]?.trim()
  return Boolean(value) && !value.startsWith('CHANGE_ME_') && !value.startsWith('your_')
}

const appEnv = (process.env.APP_ENV || process.env.NODE_ENV || 'development').toLowerCase()
const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase()
const releaseLike = vercelEnv === 'preview' ? false : appEnv === 'production' || appEnv === 'staging'
const strict = boolEnv('STRICT_PROVIDER_READINESS')
const useMock = process.env.USE_MOCK !== 'false'
const useNetworksMock = process.env.USE_NETWORKS !== 'false'
const useCustomPaymentMock = process.env.USE_CUSTOM_PAYMENT !== 'false'

const readiness = {
  auth: {
    source: hasEnv('DATABASE_URL') && (hasEnv('BETTER_AUTH_SECRET') || hasEnv('AUTH_SESSION_SECRET')) ? 'better-auth' : 'mock',
    tier: hasEnv('DATABASE_URL') && (hasEnv('BETTER_AUTH_SECRET') || hasEnv('AUTH_SESSION_SECRET')) ? 'release-ready' : 'development-only',
  },
  cms: {
    source: hasEnv('DATABASE_URL') ? 'app-cms' : 'mock',
    tier: hasEnv('DATABASE_URL') ? 'release-ready' : 'development-only',
  },
  cmsPageConfig: {
    source: hasEnv('DATABASE_URL') ? 'prisma' : 'mock',
    tier: hasEnv('DATABASE_URL') ? 'release-ready' : 'development-only',
  },
  cmsPageVersion: {
    source: hasEnv('DATABASE_URL') ? 'prisma' : 'mock',
    tier: hasEnv('DATABASE_URL') ? 'release-ready' : 'development-only',
  },
  release: {
    source: 'mock',
    tier: 'development-only',
  },
  product: {
    source: !useMock && hasEnv('ODOO_BASE_URL') && hasEnv('ODOO_DB') && hasEnv('ODOO_API_KEY') ? 'odoo' : 'mock',
    tier: 'release-ready',
  },
  category: {
    source: !useMock && hasEnv('ODOO_BASE_URL') && hasEnv('ODOO_DB') && hasEnv('ODOO_API_KEY') ? 'odoo' : 'mock',
    tier: 'release-ready',
  },
  brand: {
    source: !useMock && hasEnv('ODOO_BASE_URL') && hasEnv('ODOO_DB') && hasEnv('ODOO_API_KEY') ? 'odoo' : 'mock',
    tier: 'release-ready',
  },
  order: {
    source: !useNetworksMock && hasEnv('NETWORKS_BASE_URL') && hasEnv('NETWORKS_API_KEY') && hasEnv('NETWORKS_WEBHOOK_SECRET') ? 'networks' : 'mock',
    tier: 'release-ready',
  },
  payment: {
    source: !useCustomPaymentMock && hasEnv('CUSTOM_PAYMENT_BASE_URL') && hasEnv('CUSTOM_PAYMENT_API_KEY') && hasEnv('CUSTOM_PAYMENT_WEBHOOK_SECRET') ? 'custom-payment' : 'mock',
    tier: !useCustomPaymentMock && hasEnv('CUSTOM_PAYMENT_BASE_URL') && hasEnv('CUSTOM_PAYMENT_API_KEY') && hasEnv('CUSTOM_PAYMENT_WEBHOOK_SECRET') ? 'release-ready' : 'development-only',
  },
  search: {
    source: boolEnv('USE_MEILISEARCH') && hasEnv('MEILISEARCH_HOST') && hasEnv('MEILISEARCH_API_KEY') ? 'meilisearch' : 'mock',
    tier: boolEnv('USE_MEILISEARCH') && hasEnv('MEILISEARCH_HOST') && hasEnv('MEILISEARCH_API_KEY') ? 'release-ready' : 'development-only',
  },
  notification: {
    source: boolEnv('USE_EMAIL_NOTIFICATIONS') && hasEnv('EMAIL_NOTIFICATION_ENDPOINT') && hasEnv('EMAIL_NOTIFICATION_API_KEY') ? 'email' : boolEnv('USE_EXPO_PUSH') && hasEnv('EXPO_PUSH_ACCESS_TOKEN') ? 'expo-push' : 'mock',
    tier: boolEnv('USE_EMAIL_NOTIFICATIONS') && hasEnv('EMAIL_NOTIFICATION_ENDPOINT') && hasEnv('EMAIL_NOTIFICATION_API_KEY') ? 'release-ready' : boolEnv('USE_EXPO_PUSH') && hasEnv('EXPO_PUSH_ACCESS_TOKEN') ? 'release-ready' : 'development-only',
  },
}

const violations = REQUIRED_CUSTOMER_DOMAINS.filter((domain) => readiness[domain]?.source === 'mock')
const status = violations.length === 0 ? 'customer-ready' : 'demo-only'

console.log(`[provider-readiness] environment=${appEnv}${vercelEnv ? ` vercel=${vercelEnv}` : ''}`)
console.log(`[provider-readiness] strict=${strict} releaseLike=${releaseLike}`)
console.log(`[provider-readiness] status=${status}`)

for (const [domain, item] of Object.entries(readiness)) {
  const required = REQUIRED_CUSTOMER_DOMAINS.includes(domain) ? 'required' : 'optional'
  console.log(`[provider-readiness] ${domain}: ${item.source} (${item.tier}, ${required})`)
}

if (violations.length > 0) {
  console.log(`[provider-readiness] demo-only blockers: ${violations.join(', ')}`)
}

if (strict && releaseLike && violations.length > 0) {
  console.error('[provider-readiness] strict release readiness failed')
  process.exit(1)
}

console.log('[provider-readiness] checks complete')
