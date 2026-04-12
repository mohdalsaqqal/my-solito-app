'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Edit2, FileText, Plus, Search, X } from 'lucide-react'
import { validateReleasePublishReadiness } from '@real/app/lib/cms/release-publish-readiness'
import { AdminReleaseRecord, ProductQuery } from '@real/app/lib/types'
import { apiClient } from '../../../../apiClient'
import { colors, spacing, typography, fontWeights, radius, status } from '@real/tokens'
import { AdminFormScaffold, Button, EmptyState, PageContainer, PageHeader, Panel, Section, StatusPill, TableShell } from '../../../_components/AdminPagePrimitives'
import { AdminLoadingSkeleton, AdminErrorState } from '../../../_components/AdminLoadingFeedback'

type Publishability = {
  ok: boolean
  reason: string | null
}

const releaseUiTokens = {
  dialogBackdrop: 'rgba(0,0,0,0.45)',
  segmentedBackground: colors.surfaceMuted,
  productionBadgeBackground: status.error.subtle,
  productionBadgeColor: status.error.base,
  stagingBadgeBackground: status.info.subtle,
  stagingBadgeColor: colors.info,
} as const

function formatReleaseName(release: AdminReleaseRecord): string {
  if (release.name && release.name.trim()) return release.name.trim()
  return `Release #${release.id.slice(-6)}`
}

function formatScheduledDate(release: AdminReleaseRecord): string {
  if (release.scheduledAt) {
    return new Date(release.scheduledAt).toLocaleDateString()
  }
  return '—'
}

export default function AdminCmsReleasesPage() {
  const [rows, setRows] = useState<AdminReleaseRecord[]>([])
  const [environment, setEnvironment] = useState<'staging' | 'production'>('staging')
  const [query, setQuery] = useState('')
  const [publishability, setPublishability] = useState<Record<string, Publishability>>({})
  const [error, setError] = useState<string | null>(null)

  // New release dialog state
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newName, setNewName] = useState('')
  const [newScheduledAt, setNewScheduledAt] = useState('')
  const [newEnv, setNewEnv] = useState<'staging' | 'production'>('staging')
  const [creating, setCreating] = useState(false)

  const evaluatePublishability = async (
    releaseId: string,
    activeQueries: Set<string>
  ): Promise<Publishability> => {
    try {
      const blocks = await apiClient.admin.listReleaseBlocks(releaseId)
      const readiness = validateReleasePublishReadiness({
        blocks,
        activeQuerySlugs: activeQueries,
      })
      if (readiness.ok) return { ok: true, reason: null }
      return { ok: false, reason: readiness.issues[0]?.message ?? 'Release has unresolved publish issues.' }
    } catch {
      return { ok: false, reason: 'Unable to validate release now.' }
    }
  }

  const load = async () => {
    try {
      const [data, queries] = await Promise.all([
        apiClient.admin.listReleases(),
        apiClient.admin.listProductQueries(),
      ])
      const activeQuerySet = new Set(
        (queries as ProductQuery[]).filter((item) => item.active).map((item) => item.slug)
      )
      setRows(data)
      const nextPublishability: Record<string, Publishability> = {}
      for (const release of data) {
        if (release.status === 'published') {
          nextPublishability[release.id] = { ok: false, reason: 'Already published.' }
          continue
        }
        nextPublishability[release.id] = await evaluatePublishability(release.id, activeQuerySet)
      }
      setPublishability(nextPublishability)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load releases.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) =>
      `${item.id} ${item.name ?? ''} ${item.environment} ${item.status}`.toLowerCase().includes(needle)
    )
  }, [query, rows])

  const openNewDialog = () => {
    setNewName('')
    setNewScheduledAt('')
    setNewEnv('staging')
    setError(null)
    setShowNewDialog(true)
  }

  const confirmCreateRelease = async () => {
    try {
      setCreating(true)
      setError(null)
      await apiClient.admin.createRelease({
        environment: newEnv,
        status: 'draft',
        name: newName.trim() || undefined,
        scheduledAt: newScheduledAt || undefined,
      })
      setShowNewDialog(false)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create release.')
    } finally {
      setCreating(false)
    }
  }

  const inputStyle = {
    width: '100%',
    minHeight: spacing['40'],
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingInline: spacing['12'],
    fontSize: typography.sm,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontSize: typography.xs,
    fontWeight: Number(fontWeights.medium),
    color: colors.textSecondary,
    marginBottom: spacing['4'],
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  }

  return (
    <PageContainer>
      <PageHeader
        title='CMS Releases'
        subtitle='Manage content releases for staging and production environments.'
        actions={
          <Button tone='primary' onClick={openNewDialog}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
              <Plus size={14} color={colors.textInverted} />
              New Release
            </span>
          </Button>
        }
      />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}

      {/* New Release Dialog */}
      {showNewDialog ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: releaseUiTokens.dialogBackdrop,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewDialog(false) }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              paddingInline: spacing['16'],
            }}
          >
            <AdminFormScaffold
              title='New Release'
              subtitle='Create a release for staging or production.'
              actions={
                <Button
                  type='button'
                  tone='ghost'
                  aria-label='Close dialog'
                  onClick={() => setShowNewDialog(false)}
                  style={{ minWidth: spacing['40'], paddingInline: spacing['8'] }}
                >
                  <X size={18} />
                </Button>
              }
            >
              <div style={{ display: 'grid', gap: spacing['16'] }}>
                <div>
                  <label style={labelStyle}>Release Name</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder='e.g. Spring Sale Launch'
                    style={inputStyle}
                  />
                  <p style={{ margin: `${spacing['4']}px 0 0`, fontSize: typography.xs, color: colors.textSecondary }}>
                    Optional. If blank, a fallback label will be generated from the ID.
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>Environment</label>
                  <div
                    style={{
                      display: 'inline-flex',
                      backgroundColor: releaseUiTokens.segmentedBackground,
                      borderRadius: radius.full,
                      padding: '4px',
                      gap: 2,
                    }}
                  >
                    {(['staging', 'production'] as const).map((env) => (
                      <button
                        key={env}
                        type='button'
                        onClick={() => setNewEnv(env)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: radius.full,
                          paddingBlock: spacing['4'],
                          paddingInline: spacing['12'],
                          fontSize: typography.sm,
                          fontWeight: Number(fontWeights.medium),
                          backgroundColor: newEnv === env ? colors.brandPrimary : 'transparent',
                          color: newEnv === env ? colors.textInverted : colors.textSecondary,
                          transition: 'background-color 0.15s, color 0.15s',
                        }}
                      >
                        {env.charAt(0).toUpperCase() + env.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Scheduled Date</label>
                  <input
                    type='date'
                    title='Scheduled publish date'
                    value={newScheduledAt}
                    onChange={(e) => setNewScheduledAt(e.target.value)}
                    style={inputStyle}
                  />
                  <p style={{ margin: `${spacing['4']}px 0 0`, fontSize: typography.xs, color: colors.textSecondary }}>
                    Optional. The intended publish date for planning purposes.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing['8'] }}>
                <Button tone='secondary' onClick={() => setShowNewDialog(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button tone='primary' onClick={() => void confirmCreateRelease()} disabled={creating}>
                  {creating ? 'Creating…' : 'Create Release'}
                </Button>
              </div>
            </AdminFormScaffold>
          </div>
        </div>
      ) : null}

      <Section>
        <Panel density='dense'>
          <div
            style={{
              borderBottom: `1px solid ${colors.border}`,
              paddingBottom: spacing['16'],
              marginBottom: spacing['16'],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing['12'],
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
              <Search size={16} color={colors.textSecondary} style={{ position: 'absolute', insetInlineStart: 12, top: 12 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search releases...'
                style={{
                  width: '100%',
                  minHeight: spacing['40'],
                  borderRadius: radius.xl,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  paddingInlineStart: spacing['32'] + spacing['8'],
                  paddingInlineEnd: spacing['12'],
                  fontSize: typography.sm,
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                display: 'inline-flex',
                backgroundColor: releaseUiTokens.segmentedBackground,
                borderRadius: radius.full,
                padding: '4px',
                gap: 2,
              }}
            >
              {(['staging', 'production'] as const).map((env) => (
                <button
                  key={env}
                  type='button'
                  onClick={() => setEnvironment(env)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: radius.full,
                    paddingBlock: spacing['4'],
                    paddingInline: spacing['12'],
                    fontSize: typography.sm,
                    fontWeight: Number(fontWeights.medium),
                    backgroundColor: environment === env ? colors.brandPrimary : 'transparent',
                    color: environment === env ? colors.textInverted : colors.textSecondary,
                    transition: 'background-color 0.15s, color 0.15s',
                  }}
                >
                  {env.charAt(0).toUpperCase() + env.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title='No releases found'
              description='Create your first release to manage CMS publishing flow.'
              action={
                <Button tone='primary' onClick={openNewDialog}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                    <FileText size={14} color={colors.textInverted} />
                    Create release
                  </span>
                </Button>
              }
            />
          ) : (
            <TableShell>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Release Name', 'Environment', 'Status', 'Scheduled Date', 'Last Updated', 'Actions'].map((head) => (
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
                  {filtered.map((release) => (
                    <tr key={release.id}>
                      {/* Release Name column — shows name with fallback */}
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <span style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>
                          {formatReleaseName(release)}
                        </span>
                        <span style={{ display: 'block', fontSize: typography.xs, color: colors.textSecondary, marginTop: 2 }}>
                          {release.id}
                        </span>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <span
                          style={
                            release.environment === 'production'
                              ? {
                                  backgroundColor: releaseUiTokens.productionBadgeBackground,
                                  color: releaseUiTokens.productionBadgeColor,
                                  borderRadius: radius.full,
                                  padding: '2px 10px',
                                  fontSize: typography.xs,
                                  fontWeight: Number(fontWeights.medium),
                                }
                              : {
                                  backgroundColor: releaseUiTokens.stagingBadgeBackground,
                                  color: releaseUiTokens.stagingBadgeColor,
                                  borderRadius: radius.full,
                                  padding: '2px 10px',
                                  fontSize: typography.xs,
                                  fontWeight: Number(fontWeights.medium),
                                }
                          }
                        >
                          {release.environment === 'production' ? 'Production' : 'Staging'}
                        </span>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <StatusPill tone={release.status === 'published' ? 'success' : 'warning'}>
                          {release.status === 'published' ? 'Published' : 'Draft'}
                        </StatusPill>
                      </td>
                      {/* Scheduled Date column — uses scheduledAt, not updatedAt */}
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: typography.sm }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                          <Calendar size={12} />
                          {formatScheduledDate(release)}
                        </span>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: typography.sm }}>
                        {new Date(release.updatedAt).toLocaleString()}
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        {(() => {
                          const validation = publishability[release.id]
                          const canPublish =
                            release.status !== 'published' &&
                            (validation ? validation.ok : false)
                          return (
                            <div style={{ display: 'inline-flex', gap: spacing['8'] }}>
                              <Button
                                tone='secondary'
                                onClick={() => {
                                  window.location.href = `/admin/marketing/cms/blocks?releaseId=${encodeURIComponent(release.id)}`
                                }}
                              >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                                  <Edit2 size={14} color={colors.textSecondary} />
                                  Edit
                                </span>
                              </Button>
                              <Button
                                tone='primary'
                                disabled={!canPublish}
                                title={validation?.reason ?? undefined}
                                onClick={async () => {
                                  try {
                                    await apiClient.admin.publishRelease(release.id)
                                    await load()
                                  } catch (cause) {
                                    setError(cause instanceof Error ? cause.message : 'Unable to publish release.')
                                  }
                                }}
                              >
                                Publish
                              </Button>
                            </div>
                          )
                        })()}
                        {release.status !== 'published' && publishability[release.id]?.reason ? (
                          <p style={{ margin: `${spacing['4']}px 0 0`, color: colors.textSecondary, fontSize: typography.xs }}>
                            {publishability[release.id]?.reason}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Panel>
      </Section>
    </PageContainer>
  )
}
