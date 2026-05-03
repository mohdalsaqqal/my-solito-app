import { ok, fail } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'

type ServiceStatus = {
  key: string
  name: string
  description: string
  status: 'live' | 'mock' | 'unconfigured'
  envVars: string[]
  docs?: string
}

function describeServices(): ServiceStatus[] {
  return [
    {
      key: 'database',
      name: 'PostgreSQL (Prisma)',
      description: 'Primary database — stores CMS, users, orders, products, and all business data.',
      status: 'live',
      envVars: ['DATABASE_URL'],
    },
    {
      key: 'auth',
      name: 'Better Auth',
      description: 'Authentication and session management with email/password and optional OAuth.',
      status: process.env.BETTER_AUTH_SECRET ? 'live' : 'mock',
      envVars: ['BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'BETTER_AUTH_TRUSTED_ORIGINS', 'AUTH_SESSION_SECRET'],
    },
    {
      key: 'odoo',
      name: 'Odoo ERP',
      description: 'Product catalog, categories, brands, and order write-back to Odoo ERP.',
      status: process.env.USE_MOCK === 'false' && process.env.ODOO_BASE_URL ? 'live' : 'mock',
      envVars: ['USE_MOCK=false', 'ODOO_BASE_URL', 'ODOO_DB', 'ODOO_API_KEY'],
      docs: 'docs/delivery/runbooks/odoo-connection.md',
    },
    {
      key: 'search',
      name: 'Meilisearch',
      description: 'Full-text search with facets, filters, and typo tolerance.',
      status: process.env.USE_MEILISEARCH === 'true' && process.env.MEILISEARCH_HOST ? 'live' : 'mock',
      envVars: ['USE_MEILISEARCH=true', 'MEILISEARCH_HOST', 'MEILISEARCH_API_KEY', 'MEILISEARCH_PRODUCTS_INDEX'],
      docs: 'docs/delivery/runbooks/meilisearch-adapter.md',
    },
    {
      key: 'payment',
      name: 'Payment Gateway',
      description: 'Payment intents, webhooks, and settlement recording.',
      status: getPaymentStatus(),
      envVars: [
        'USE_CUSTOM_PAYMENT=false',
        'CUSTOM_PAYMENT_BASE_URL',
        'CUSTOM_PAYMENT_API_KEY',
        'CUSTOM_PAYMENT_WEBHOOK_SECRET',
      ],
      docs: 'docs/delivery/runbooks/custom-payment-gateway.md',
    },
    {
      key: 'email',
      name: 'Email Notifications',
      description: 'Transactional emails for order status, password reset, and campaigns.',
      status: process.env.USE_EMAIL_NOTIFICATIONS === 'true' && process.env.EMAIL_NOTIFICATION_ENDPOINT ? 'live' : 'mock',
      envVars: ['USE_EMAIL_NOTIFICATIONS=true', 'EMAIL_NOTIFICATION_ENDPOINT', 'EMAIL_NOTIFICATION_API_KEY', 'EMAIL_NOTIFICATION_FROM'],
    },
    {
      key: 'push',
      name: 'Push Notifications (Expo)',
      description: 'Mobile push notifications for order updates and campaigns.',
      status: process.env.USE_EXPO_PUSH === 'true' ? 'live' : 'mock',
      envVars: ['USE_EXPO_PUSH=true', 'EXPO_PUSH_ACCESS_TOKEN'],
      docs: 'docs/eas-runbook.md',
    },
    {
      key: 'shopify',
      name: 'Shopify',
      description: 'Optional Shopify merchant backend for catalog and orders.',
      status: process.env.SHOPIFY_STORE_DOMAIN ? 'live' : 'unconfigured',
      envVars: ['USE_MOCK=false', 'SHOPIFY_STORE_DOMAIN', 'SHOPIFY_ADMIN_ACCESS_TOKEN', 'SHOPIFY_ADMIN_API_VERSION', 'SHOPIFY_WEBHOOK_SECRET'],
      docs: 'docs/delivery/runbooks/shopify-adapter-scope.md',
    },
    {
      key: 'postgresql-merchant',
      name: 'Custom PostgreSQL Backend',
      description: 'Optional direct PostgreSQL merchant database integration.',
      status: process.env.MERCHANT_POSTGRES_URL ? 'live' : 'unconfigured',
      envVars: ['USE_MOCK=false', 'MERCHANT_POSTGRES_URL', 'MERCHANT_POSTGRES_SCHEMA', 'MERCHANT_POSTGRES_SSL', 'MERCHANT_POSTGRES_READONLY'],
      docs: 'docs/delivery/runbooks/custom-postgresql-adapter-mapping.md',
    },
    {
      key: 'sentry',
      name: 'Sentry Error Tracking',
      description: 'Error monitoring and performance tracing.',
      status: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN ? 'live' : 'unconfigured',
      envVars: ['SENTRY_DSN', 'NEXT_PUBLIC_SENTRY_DSN'],
    },
    {
      key: 'translation',
      name: 'Crowdin Translation',
      description: 'i18n translation management (AR/EN).',
      status: process.env.CROWDIN_PROJECT_ID ? 'live' : 'mock',
      envVars: ['CROWDIN_PROJECT_ID', 'CROWDIN_TOKEN', 'CROWDIN_MT_ENGINE_ID'],
    },
    {
      key: 'cdn',
      name: 'CDN Cache Purge',
      description: 'Purge CDN cache after CMS publish.',
      status: process.env.CDN_PURGE_URL ? 'live' : 'unconfigured',
      envVars: ['CDN_PURGE_URL', 'CDN_PURGE_SECRET'],
    },
  ]
}

function getPaymentStatus(): ServiceStatus['status'] {
  if (process.env.USE_CUSTOM_PAYMENT === 'false' && process.env.CUSTOM_PAYMENT_BASE_URL) return 'live'
  if (process.env.USE_NETWORKS === 'false' && process.env.NETWORKS_BASE_URL) return 'live'
  const useMock = process.env.USE_CUSTOM_PAYMENT !== 'false' && process.env.USE_NETWORKS !== 'false'
  return useMock ? 'mock' : 'unconfigured'
}

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'operations')
    if (session instanceof Response) return session

    const services = describeServices()
    const summary = {
      live: services.filter((s) => s.status === 'live').length,
      mock: services.filter((s) => s.status === 'mock').length,
      unconfigured: services.filter((s) => s.status === 'unconfigured').length,
    }

    return ok({ services, summary })
  } catch (cause) {
    return fail('SERVICES_LOAD_ERROR', 'Unable to load service configuration.', 500, {
      scope: 'GET /api/admin/settings/services',
      cause,
    })
  }
}
