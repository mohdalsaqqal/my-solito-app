'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Database, Globe, RefreshCw, Server, Trash2 } from 'lucide-react'
import { AdminCacheAction, AdminCacheAuditEntry } from '@real/app/lib/types'
import { apiClient } from '../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { Button, EmptyState, PageContainer, PageHeader, Panel, Section, StatusPill, TableShell } from '../../_components/AdminPagePrimitives'

const actions: AdminCacheAction[] = [
  'revalidate_home_shop',
  'revalidate_all_public',
  'revalidate_account_surfaces',
  'revalidate_admin_surfaces',
  'full_stack_flush',
]

export default function AdminOperationsCachePage() {
  const [rows, setRows] = useState<AdminCacheAuditEntry[]>([])
  const [action, setAction] = useState<AdminCacheAction>('revalidate_home_shop')
  const [confirmation, setConfirmation] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  const load = async () => {
    try {
      const data = await apiClient.admin.cacheAudit()
      setRows(data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load cache audit.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isModalOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isModalOpen])

  const latest = useMemo(() => rows[0] ?? null, [rows])
  const cooldownRemaining = useMemo(() => {
    if (!latest?.cooldownSeconds) return 0
    const elapsed = Math.floor((nowMs - new Date(latest.executedAt).getTime()) / 1000)
    return Math.max(latest.cooldownSeconds - elapsed, 0)
  }, [latest, nowMs])
  const isCooldownActive = cooldownRemaining > 0

  const run = async () => {
    if (isCooldownActive) {
      setError(`Please wait ${cooldownRemaining}s before running another flush.`)
      return
    }
    setIsRunning(true)
    try {
      await apiClient.admin.runCacheAction({ action, confirmation })
      setConfirmation('')
      setIsModalOpen(false)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to run cache action.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title='Cache Operations' />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: spacing['24'],
        }}
      >
        <Section>
          <Panel>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'], marginBottom: spacing['24'] }}>
              <div
                style={{
                  width: spacing['40'],
                  height: spacing['40'],
                  borderRadius: radius.xl,
                  backgroundColor: colors.surfaceMuted,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Globe size={20} color={colors.textSecondary} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>CDN Cache</h3>
                <p style={{ margin: `${spacing['4']}px 0 0`, color: colors.textSecondary, fontSize: typography.sm }}>
                  Manage edge caching and invalidation.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: spacing['16'] }}>
              <div
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.xl,
                  backgroundColor: colors.surfaceMuted,
                  padding: spacing['12'],
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>Status</span>
                  <StatusPill tone='success'>Operational</StatusPill>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing['8'] }}>
                  <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>Hit Rate</span>
                  <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>98.4%</span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: spacing['4'] }}>
                <label style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                  Revalidate Action
                </label>
                <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
                  <select value={action} onChange={(e) => setAction(e.target.value as AdminCacheAction)} style={inputStyle}>
                    {actions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <Button tone='secondary' onClick={() => setIsModalOpen(true)} disabled={isCooldownActive || isRunning}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                      <RefreshCw size={14} color={colors.textSecondary} />
                      Revalidate
                    </span>
                  </Button>
                </div>
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs }}>
                  Type FLUSH confirmation before destructive actions.
                </p>
              </div>

              <Button tone='danger' onClick={() => setIsModalOpen(true)} style={{ width: '100%' }} disabled={isCooldownActive || isRunning}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  Flush Entire CDN Cache
                  <Trash2 size={14} color={colors.textInverted} />
                </span>
              </Button>

              {latest ? (
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs, display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                  <CheckCircle2 size={12} color={colors.success} />
                  Last flushed at {new Date(latest.executedAt).toLocaleTimeString()}
                </p>
              ) : null}
              {isCooldownActive ? (
                <p style={{ margin: 0, color: colors.warning, fontSize: typography.xs }}>
                  Cooldown active: {cooldownRemaining}s remaining
                </p>
              ) : null}
            </div>
          </Panel>
        </Section>

        <Section>
          <Panel>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'], marginBottom: spacing['24'] }}>
              <div
                style={{
                  width: spacing['40'],
                  height: spacing['40'],
                  borderRadius: radius.xl,
                  backgroundColor: colors.surfaceMuted,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Database size={20} color={colors.textSecondary} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>Application Cache</h3>
                <p style={{ margin: `${spacing['4']}px 0 0`, color: colors.textSecondary, fontSize: typography.sm }}>
                  Redis and in-memory store controls.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: spacing['16'] }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                  gap: spacing['12'],
                }}
              >
                <StatCard label='Keys' value='14,203' />
                <StatCard label='Memory' value='248 MB' />
              </div>

              <div style={{ display: 'grid', gap: spacing['4'] }}>
                <label style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                  Clear by Tag
                </label>
                <div style={{ display: 'flex', gap: spacing['8'] }}>
                  <select style={inputStyle}>
                    <option>product-data</option>
                    <option>user-sessions</option>
                    <option>config</option>
                  </select>
                  <Button tone='secondary'>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                      <Server size={14} color={colors.textSecondary} />
                      Clear
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        </Section>
      </div>

      <Section>
        <Panel density='dense'>
          <h3 style={{ margin: `0 0 ${spacing['12']}px`, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
            Cache Audit
          </h3>
          {rows.length === 0 ? (
            <EmptyState title='No cache audit entries' description='Run a cache action to generate audit rows.' />
          ) : (
            <TableShell>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Action', 'When', 'Paths/Tags', 'CDN'].map((head) => (
                      <th
                        key={head}
                        scope='col'
                        style={{
                          height: spacing['48'],
                          paddingInline: spacing['12'],
                          textAlign: 'start',
                          verticalAlign: 'middle',
                          color: colors.textSecondary,
                          fontSize: typography.xs,
                          fontWeight: Number(fontWeights.medium),
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          borderBottom: `1px solid ${colors.border}`,
                          backgroundColor: colors.surfaceMuted,
                        }}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry) => (
                    <tr key={entry.id}>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                        {entry.action}
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: typography.xs }}>
                        {new Date(entry.executedAt).toLocaleString()}
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: typography.xs }}>
                        paths: {entry.revalidatedPaths.join(', ') || '-'}
                        <br />
                        tags: {entry.revalidatedTags.join(', ') || '-'}
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <StatusPill tone={entry.cdn.success ? 'success' : 'warning'}>
                          {entry.cdn.success ? 'Success' : 'Failed'}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Panel>
      </Section>

      {isModalOpen ? (
        <div
          role='dialog'
          aria-modal='true'
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'grid',
            placeItems: 'center',
            padding: spacing['16'],
            zIndex: 80,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              borderRadius: radius.xl + 2,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: spacing['16'], borderBottom: `1px solid ${colors.border}` }}>
              <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.semibold) }}>
                Flush CDN Cache?
              </h3>
              <p style={{ margin: `${spacing['8']}px 0 0`, color: colors.textSecondary, fontSize: typography.sm }}>
                This action removes cached content from edge locations and increases origin load temporarily.
              </p>
            </div>
            <div style={{ padding: spacing['16'], display: 'grid', gap: spacing['12'] }}>
              <div
                style={{
                  borderRadius: radius.xl,
                  border: `1px solid ${colors.danger}`,
                  backgroundColor: colors.surface,
                  color: colors.danger,
                  padding: spacing['12'],
                  fontSize: typography.xs,
                }}
              >
                Warning: destructive operation. Type <strong>FLUSH</strong> to confirm.
              </div>
              <input
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                placeholder='FLUSH'
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
            </div>
            <div
              style={{
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: colors.surfaceMuted,
                padding: spacing['16'],
                display: 'flex',
                justifyContent: 'flex-end',
                gap: spacing['8'],
              }}
            >
              <Button tone='ghost' onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button tone='danger' disabled={confirmation !== 'FLUSH' || isRunning || isCooldownActive} onClick={() => void run()}>
                {isRunning ? 'Flushing...' : 'Flush Cache'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        backgroundColor: colors.surfaceMuted,
        padding: spacing['12'],
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          color: colors.textSecondary,
          fontSize: typography.xs,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      <p style={{ margin: `${spacing['8']}px 0 0`, color: colors.textPrimary, fontSize: typography.xxl, fontWeight: Number(fontWeights.semibold) }}>
        {value}
      </p>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  minHeight: spacing['40'],
  borderRadius: radius.xl,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  fontSize: typography.sm,
  paddingInline: spacing['12'],
  outline: 'none',
} as const
