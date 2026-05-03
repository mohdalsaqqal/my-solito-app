'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, Server, Shield, Database, Settings2, Plug, ExternalLink } from 'lucide-react'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  AdminFormScaffold,
  PageContainer,
  Panel,
  Section,
  StatusPill,
} from '../_components/AdminPagePrimitives'

type HealthComponent = {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message: string
  meta?: Record<string, unknown>
}

type HealthPayload = {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checkedAt: string
  uptimeSeconds: number
  environment: Record<string, string>
  components: {
    runtime: HealthComponent
    providers: HealthComponent
    search: HealthComponent
    notifications: HealthComponent
  }
}

async function fetchHealth(): Promise<HealthPayload | null> {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' })
    const json = await res.json()
    return json.success ? (json.data as HealthPayload) : null
  } catch {
    return null
  }
}

type ServiceStatus = {
  key: string
  name: string
  description: string
  status: 'live' | 'mock' | 'unconfigured'
  envVars: string[]
  docs?: string
}

type ServicesPayload = {
  services: ServiceStatus[]
  summary: { live: number; mock: number; unconfigured: number }
}

async function fetchServices(): Promise<ServicesPayload | null> {
  try {
    const res = await fetch('/api/admin/settings/services', { cache: 'no-store' })
    const json = await res.json()
    return json.success ? (json.data as ServicesPayload) : null
  } catch {
    return null
  }
}

const statusToneMap: Record<ServiceStatus['status'], string> = {
  live: 'success',
  mock: 'warning',
  unconfigured: 'neutral',
}

export default function AdminSettingsPage() {
  const [health, setHealth] = useState<HealthPayload | null>(null)
  const [services, setServices] = useState<ServicesPayload | null>(null)

  useEffect(() => {
    void fetchHealth().then(setHealth)
    void fetchServices().then(setServices)
  }, [])

  const envInfo = health?.environment ?? {}
  const mockCount = health
    ? (health.components.providers.meta?.mockBacked as string[])?.length ?? '...'
    : '...'

  return (
    <PageContainer>
      <Section>
        <AdminFormScaffold
          title="Settings"
          subtitle="Platform environment, provider status, and system configuration overview."
        >
          <div style={{ display: 'grid', gap: spacing['16'] }}>
            {/* Environment */}
            <Panel>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], marginBottom: spacing['12'] }}>
                <Server size={18} color={colors.textSecondary} />
                <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                  Environment
                </span>
              </div>
              <div style={{ display: 'grid', gap: spacing['4'] }}>
                {[
                  ['App Env', String(envInfo.appEnv ?? 'unknown')],
                  ['Release-like', String(envInfo.isReleaseLikeEnvironment ?? 'unknown')],
                  ['Mock mode', String(envInfo.useMock ?? 'unknown')],
                  ['Mock-backed providers', `${mockCount}`],
                  ['Node Env', String(envInfo.nodeEnv ?? 'unknown')],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: `${spacing['4']}px 0`, borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{label}</span>
                    <span style={{ color: colors.textPrimary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>{value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* System Health */}
            <Panel>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], marginBottom: spacing['12'] }}>
                <Activity size={18} color={colors.textSecondary} />
                <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                  System Health
                </span>
                {health ? (
                  <StatusPill tone={health.status === 'healthy' ? 'success' : health.status === 'degraded' ? 'warning' : 'danger'}>
                    {health.status}
                  </StatusPill>
                ) : null}
              </div>
              <div style={{ display: 'grid', gap: spacing['4'] }}>
                {[
                  ['Runtime', health?.components.runtime.status ?? 'unknown'],
                  ['Providers', health?.components.providers.status ?? 'unknown'],
                  ['Search', health?.components.search.status ?? 'unknown'],
                  ['Notifications', health?.components.notifications.status ?? 'unknown'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: `${spacing['4']}px 0`, borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{label}</span>
                    <StatusPill tone={value === 'healthy' ? 'success' : value === 'degraded' ? 'warning' : value === 'unhealthy' ? 'danger' : 'neutral'}>
                      {value}
                    </StatusPill>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Auth Status */}
            <Panel>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], marginBottom: spacing['12'] }}>
                <Shield size={18} color={colors.textSecondary} />
                <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                  Auth & Security
                </span>
              </div>
              <div style={{ display: 'grid', gap: spacing['4'] }}>
                {[
                  ['Better Auth', 'Active'],
                  ['RBAC', 'Role + per-user domain permissions'],
                  ['RLS', '24 tables enabled'],
                  ['CSP', 'Enabled'],
                  ['Sentry', envInfo.nodeEnv === 'production' ? 'Configured' : 'Dev mode'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: `${spacing['4']}px 0`, borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{label}</span>
                    <span style={{ color: colors.textPrimary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>{value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* External Services */}
            <Panel>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], marginBottom: spacing['12'] }}>
                <Plug size={18} color={colors.textSecondary} />
                <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                  External Services
                </span>
                {services ? (
                  <span style={{ fontSize: typography.xs, color: colors.textSecondary, marginLeft: 'auto' }}>
                    {services.summary.live} live · {services.summary.mock} mock · {services.summary.unconfigured} unconfigured
                  </span>
                ) : null}
              </div>
              <div style={{ display: 'grid', gap: spacing['6'] }}>
                {(services?.services ?? []).map((svc) => (
                  <div
                    key={svc.key}
                    style={{
                      padding: spacing['8'],
                      borderRadius: radius.md,
                      border: `1px solid ${colors.border}`,
                      backgroundColor: svc.status === 'live' ? 'rgba(34,197,94,0.04)' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing['6'], marginBottom: spacing['2'] }}>
                      <span style={{ color: colors.textPrimary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                        {svc.name}
                      </span>
                      <StatusPill tone={statusToneMap[svc.status] as 'success' | 'warning' | 'neutral'}>
                        {svc.status}
                      </StatusPill>
                    </div>
                    <p style={{ color: colors.textSecondary, fontSize: typography.xs, margin: `${spacing['2']}px 0 ${spacing['6']}px` }}>
                      {svc.description}
                    </p>
                    {svc.status !== 'live' && svc.envVars.length > 0 ? (
                      <details style={{ fontSize: typography.xs }}>
                        <summary style={{ color: colors.brandPrimary, cursor: 'pointer', marginBottom: spacing['4'] }}>
                          Required env vars ({svc.envVars.length})
                        </summary>
                        <div style={{
                          backgroundColor: 'rgba(0,0,0,0.04)',
                          padding: spacing['8'],
                          borderRadius: radius.sm,
                          fontFamily: 'monospace',
                          fontSize: typography.xs,
                          color: colors.textSecondary,
                          display: 'grid',
                          gap: spacing['2'],
                        }}>
                          {svc.envVars.map((v) => (
                            <code key={v} style={{ wordBreak: 'break-all' }}>{v}</code>
                          ))}
                        </div>
                      </details>
                    ) : null}
                    {svc.docs ? (
                      <div style={{ marginTop: spacing['4'], fontSize: typography.xs }}>
                        <ExternalLink size={10} style={{ marginRight: 4 }} color={colors.textSecondary} />
                        <span style={{ color: colors.textSecondary }}>Docs: {svc.docs}</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Panel>

            {/* Quick Links */}
            <Panel>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], marginBottom: spacing['12'] }}>
                <Settings2 size={18} color={colors.textSecondary} />
                <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                  Admin Quick Links
                </span>
              </div>
              <div style={{ display: 'grid', gap: spacing['4'] }}>
                {[
                  { label: 'Provider Health', href: '/admin/operations/health' },
                  { label: 'Operations Audit', href: '/admin/operations/audit' },
                  { label: 'Cache Management', href: '/admin/operations/cache' },
                  { label: 'User Management', href: '/admin/customers' },
                  { label: 'Dashboard', href: '/admin/dashboard' },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: 'block',
                      padding: `${spacing['8']}px 0`,
                      color: colors.brandPrimary,
                      fontSize: typography.xs,
                      fontWeight: Number(fontWeights.medium),
                      textDecoration: 'none',
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    {label} →
                  </Link>
                ))}
              </div>
            </Panel>
          </div>
        </AdminFormScaffold>
      </Section>
    </PageContainer>
  )
}
