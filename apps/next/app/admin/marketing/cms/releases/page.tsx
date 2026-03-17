'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Edit2, FileText, Plus, Search } from 'lucide-react'
import { parseHomeBlock } from '@real/app/lib/cms/blocks'
import { AdminReleaseRecord, ProductQuery } from '@real/app/lib/types'
import { apiClient } from '../../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { Button, EmptyState, PageContainer, PageHeader, Panel, Section, StatusPill, TableShell } from '../../../_components/AdminPagePrimitives'

type Publishability = {
  ok: boolean
  reason: string | null
}

export default function AdminCmsReleasesPage() {
  const [rows, setRows] = useState<AdminReleaseRecord[]>([])
  const [environment, setEnvironment] = useState<'staging' | 'production'>('staging')
  const [query, setQuery] = useState('')
  const [publishability, setPublishability] = useState<Record<string, Publishability>>({})
  const [error, setError] = useState<string | null>(null)

  const evaluatePublishability = async (
    releaseId: string,
    activeQueries: Set<string>
  ): Promise<Publishability> => {
    try {
      const blocks = await apiClient.admin.listReleaseBlocks(releaseId)
      if (blocks.length === 0) {
        return { ok: false, reason: 'Add at least one block before publishing.' }
      }
      for (const block of blocks) {
        const parsed = parseHomeBlock(block.payloadJson)
        if (!parsed) {
          return { ok: false, reason: `Block ${block.id} has invalid payload.` }
        }
        if (parsed.type === 'product_slider' || (parsed.type === 'brand_promo' && parsed.querySlug)) {
          const querySlug = parsed.type === 'product_slider' ? parsed.querySlug : parsed.querySlug
          if (!querySlug) {
            return { ok: false, reason: `Block ${block.id} requires querySlug.` }
          }
          if (!activeQueries.has(querySlug)) {
            return { ok: false, reason: `Block ${block.id} references inactive/missing query.` }
          }
        }
      }
      return { ok: true, reason: null }
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
    return rows.filter((item) => `${item.id} ${item.environment} ${item.status}`.toLowerCase().includes(needle))
  }, [query, rows])

  const createRelease = async () => {
    try {
      setError(null)
      await apiClient.admin.createRelease({ environment, status: 'draft' })
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create release.')
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title='CMS Releases'
        subtitle='Manage content releases for staging and production environments.'
        actions={
          <Button tone='primary' onClick={() => void createRelease()}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
              <Plus size={14} color={colors.textInverted} />
              New Release
            </span>
          </Button>
        }
      />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}

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
                backgroundColor: colors.surfaceMuted,
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
                    color: environment === env ? '#fff' : colors.textSecondary,
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
                <Button tone='primary' onClick={() => void createRelease()}>
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
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <span style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>{release.id}</span>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <span
                          style={
                            release.environment === 'production'
                              ? {
                                  backgroundColor: '#fef2f2',
                                  color: '#dc2626',
                                  borderRadius: radius.full,
                                  padding: '2px 10px',
                                  fontSize: typography.xs,
                                  fontWeight: Number(fontWeights.medium),
                                }
                              : {
                                  backgroundColor: '#eff6ff',
                                  color: '#2563eb',
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
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: typography.sm }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                          <Calendar size={12} />
                          {new Date(release.updatedAt).toLocaleDateString()}
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

