'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, Server, Shield, Database, Settings2 } from 'lucide-react'
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

export default function AdminSettingsPage() {
  const [health, setHealth] = useState<HealthPayload | null>(null)

  useEffect(() => {
    void fetchHealth().then(setHealth)
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
