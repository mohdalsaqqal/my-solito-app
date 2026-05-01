'use client'

import { useEffect, useState } from 'react'
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  AdminFormScaffold,
  Button,
  PageContainer,
  Panel,
  Section,
  StatusPill,
} from '../../_components/AdminPagePrimitives'

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

type ComponentHealth = {
  status: HealthStatus
  message: string
  meta?: Record<string, unknown>
}

type HealthPayload = {
  status: HealthStatus
  checkedAt: string
  uptimeSeconds: number
  environment: Record<string, string>
  components: {
    runtime: ComponentHealth
    providers: ComponentHealth
    search: ComponentHealth
    notifications: ComponentHealth
  }
}

const STATUS_ICON: Record<HealthStatus, typeof CheckCircle> = {
  healthy: CheckCircle,
  degraded: AlertTriangle,
  unhealthy: XCircle,
}

const STATUS_TONE: Record<HealthStatus, 'success' | 'warning' | 'danger'> = {
  healthy: 'success',
  degraded: 'warning',
  unhealthy: 'danger',
}

const COMPONENT_LABELS: Record<string, string> = {
  runtime: 'Runtime',
  providers: 'Providers',
  search: 'Search',
  notifications: 'Notifications',
}

const copy = {
  loadingHealthStatus: 'Loading health status...',
} as const

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message ?? 'Health check failed')
      setHealth(json.data as HealthPayload)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load health status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchHealth()
  }, [])

  return (
    <PageContainer>
      <Section>
        <AdminFormScaffold
          title="Provider Health"
          subtitle="Runtime, provider readiness, search, and notification health status."
          notice={error ? { tone: 'danger', message: error } : undefined}
          actions={
            <Button tone="secondary" onClick={() => { void fetchHealth() }} disabled={loading}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                <RefreshCw size={14} color={colors.textSecondary} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </span>
            </Button>
          }
        >
          {loading && !health ? (
            <Panel>
              <div style={{ padding: spacing['32'], textAlign: 'center', color: colors.textSecondary }}>
                <Activity size={24} style={{ marginBottom: spacing['8'] }} />
                <p style={{ margin: 0, fontSize: typography.sm }}>{copy.loadingHealthStatus}</p>
              </div>
            </Panel>
          ) : health ? (
            <div style={{ display: 'grid', gap: spacing['16'] }}>
              {/* Overall status */}
              <Panel tone={STATUS_TONE[health.status]}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'] }}>
                  {(() => {
                    const Icon = STATUS_ICON[health.status]
                    return <Icon size={24} color={health.status === 'healthy' ? colors.success : health.status === 'degraded' ? colors.warning : colors.danger} />
                  })()}
                  <div>
                    <p style={{ margin: 0, color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
                      System {health.status}
                    </p>
                    <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs }}>
                      Checked {new Date(health.checkedAt).toLocaleTimeString()} · Uptime: {formatUptime(health.uptimeSeconds)} · Env: {String(health.environment?.nodeEnv ?? 'unknown')}
                    </p>
                  </div>
                </div>
              </Panel>

              {/* Component cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: spacing['12'] }}>
                {Object.entries(health.components).map(([key, component]) => {
                  const Icon = STATUS_ICON[component.status]
                  return (
                    <Panel key={key} tone={STATUS_TONE[component.status]}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], marginBottom: spacing['8'] }}>
                        <Icon size={18} color={component.status === 'healthy' ? colors.success : component.status === 'degraded' ? colors.warning : colors.danger} />
                        <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                          {COMPONENT_LABELS[key] ?? key}
                        </span>
                        <StatusPill tone={STATUS_TONE[component.status]}>{component.status}</StatusPill>
                      </div>
                      <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs }}>
                        {component.message}
                      </p>
                      {component.meta && Object.keys(component.meta).length > 0 ? (
                        <details style={{ marginTop: spacing['8'] }}>
                          <summary style={{ color: colors.textSecondary, fontSize: typography.xs, cursor: 'pointer' }}>
                            Details
                          </summary>
                          <pre style={{
                            margin: `${spacing['4']}px 0 0 0`,
                            padding: spacing['8'],
                            backgroundColor: colors.surfaceMuted,
                            borderRadius: radius.md,
                            fontSize: typography.xs,
                            color: colors.textSecondary,
                            overflow: 'auto',
                            maxHeight: 200,
                          }}>
                            {JSON.stringify(component.meta, null, 2)}
                          </pre>
                        </details>
                      ) : null}
                    </Panel>
                  )
                })}
              </div>
            </div>
          ) : null}
        </AdminFormScaffold>
      </Section>
    </PageContainer>
  )
}
