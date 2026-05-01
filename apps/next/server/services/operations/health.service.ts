import { providerEnvironment, providerReadiness, searchProvider } from '@real/providers'
import { getNotificationStatus } from '../notifications/notification.service'
import { createProviderContext } from '../tenant/context'

export type OperationsHealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export type OperationsHealthComponent = {
  status: OperationsHealthStatus
  message: string
  meta?: Record<string, unknown>
}

export type OperationsHealthPayload = {
  status: OperationsHealthStatus
  checkedAt: string
  uptimeSeconds: number
  environment: typeof providerEnvironment
  components: {
    runtime: OperationsHealthComponent
    providers: OperationsHealthComponent
    search: OperationsHealthComponent
    notifications: OperationsHealthComponent
  }
}

function worstStatus(statuses: OperationsHealthStatus[]): OperationsHealthStatus {
  if (statuses.includes('unhealthy')) return 'unhealthy'
  if (statuses.includes('degraded')) return 'degraded'
  return 'healthy'
}

function providerReadinessComponent(): OperationsHealthComponent {
  const entries = Object.entries(providerReadiness)
  const mockBacked = entries
    .filter(([, readiness]) => readiness.source === 'mock')
    .map(([name]) => name)

  const releaseRequiredMocks = providerEnvironment.isReleaseLikeEnvironment
    ? mockBacked.filter((name) => ['product', 'category', 'brand', 'order'].includes(name))
    : []

  if (releaseRequiredMocks.length > 0) {
    return {
      status: 'unhealthy',
      message: 'Release-critical providers are still mock-backed.',
      meta: {
        releaseRequiredMocks,
        readiness: providerReadiness,
      },
    }
  }

  return {
    status: mockBacked.length > 0 ? 'degraded' : 'healthy',
    message: mockBacked.length > 0 ? 'Some providers are mock-backed.' : 'All providers report non-mock sources.',
    meta: {
      mockBacked,
      readiness: providerReadiness,
    },
  }
}

async function searchHealthComponent(): Promise<OperationsHealthComponent> {
  const result = await searchProvider.health?.(createProviderContext({ storeId: 'default' }))
  if (!result) {
    return {
      status: 'degraded',
      message: 'Search provider does not expose health.',
    }
  }

  if (!result.ok) {
    return {
      status: 'unhealthy',
      message: result.error.message,
      meta: { code: result.error.code },
    }
  }

  return {
    status: result.data.indexed ? 'healthy' : 'degraded',
    message: result.data.indexed ? 'Search index is ready.' : 'Search index is not ready.',
    meta: result.data,
  }
}

async function notificationsHealthComponent(): Promise<OperationsHealthComponent> {
  const status = await getNotificationStatus()
  return {
    status: status.ready ? 'healthy' : 'degraded',
    message: status.ready ? 'Notification provider is ready.' : 'Notification provider is not fully ready.',
    meta: status,
  }
}

async function settleComponent(
  promise: Promise<OperationsHealthComponent>,
  fallback: string,
): Promise<OperationsHealthComponent> {
  try {
    return await promise
  } catch (cause) {
    return {
      status: 'unhealthy',
      message: fallback,
      meta: {
        error: cause instanceof Error ? cause.message : String(cause),
      },
    }
  }
}

export async function getOperationsHealth(): Promise<OperationsHealthPayload> {
  const [search, notifications] = await Promise.all([
    settleComponent(searchHealthComponent(), 'Search health check failed.'),
    settleComponent(notificationsHealthComponent(), 'Notification health check failed.'),
  ])

  const components = {
    runtime: {
      status: 'healthy' as const,
      message: 'Next.js runtime is reachable.',
      meta: {
        nodeEnv: process.env.NODE_ENV ?? 'development',
      },
    },
    providers: providerReadinessComponent(),
    search,
    notifications,
  }

  return {
    status: worstStatus(Object.values(components).map((component) => component.status)),
    checkedAt: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    environment: providerEnvironment,
    components,
  }
}
