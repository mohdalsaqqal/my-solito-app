'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, CheckCircle, Download, Search } from 'lucide-react'
import { AdminOpsAuditEntry } from '@real/app/lib/types'
import { apiClient } from '../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { Button, EmptyState, PageContainer, PageHeader, Panel, Section, StatusPill, TableShell } from '../../_components/AdminPagePrimitives'

export default function AdminOperationsAuditPage() {
  const [rows, setRows] = useState<AdminOpsAuditEntry[]>([])
  const [query, setQuery] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const load = async (filters?: { actor?: string; type?: string }) => {
    try {
      const data = await apiClient.admin.opsAudit(filters)
      setRows(data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load audit logs.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const uniqueTypes = useMemo(() => Array.from(new Set(rows.map((row) => row.type))), [rows])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesQuery =
        !needle || `${row.targetId} ${row.actor.email} ${row.type}`.toLowerCase().includes(needle)
      const matchesType = !entityFilter || row.type === entityFilter
      return matchesQuery && matchesType
    })
  }, [entityFilter, query, rows])

  const exportLogs = async () => {
    setIsExporting(true)
    try {
      const exported = await apiClient.admin.exportOpsAudit({
        actor: query || undefined,
        type: entityFilter || undefined,
      })
      const blob = new Blob([JSON.stringify(exported, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ops-audit-${new Date().toISOString().slice(0, 19)}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to export audit logs.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title='Audit Logs'
        subtitle='Track system activities and user actions.'
        actions={
          <Button tone='secondary' onClick={() => void exportLogs()} disabled={isExporting}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
              <Download size={14} color={colors.textSecondary} />
              {isExporting ? 'Exporting...' : 'Export Logs'}
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
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing['12'],
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
              <Search size={16} color={colors.textSecondary} style={{ position: 'absolute', insetInlineStart: 12, top: 12 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search logs...'
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

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                style={{
                  minHeight: spacing['40'],
                  borderRadius: radius.xl,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  fontSize: typography.sm,
                  paddingInline: spacing['12'],
                }}
              >
                <option value=''>All entities</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Button
                tone='secondary'
                onClick={() => void load({ type: entityFilter || undefined, actor: query || undefined })}
              >
                Apply
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title='No logs found'
              description='No entries match current filters.'
              action={
                <Button
                  tone='ghost'
                  onClick={() => {
                    setQuery('')
                    setEntityFilter('')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <TableShell>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Timestamp', 'User', 'Action', 'Entity', 'Details', 'Status'].map((head) => (
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
                  {filtered.map((entry) => {
                    const details = Object.entries(entry.changes)
                      .slice(0, 3)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(' • ')
                    return (
                      <tr key={entry.id}>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                          <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: 'monospace' }}>
                            {new Date(entry.at).toLocaleString()}
                          </span>
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>
                          {entry.actor.email}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                          <StatusPill tone='neutral'>{entry.type}</StatusPill>
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                          <div style={{ display: 'grid', gap: spacing['2'] }}>
                            <span style={{ color: colors.textPrimary, fontSize: typography.sm }}>{entry.targetId}</span>
                            <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                              {entry.actor.userId}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {details || 'No field changes'}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                            <CheckCircle size={14} color={colors.success} />
                            <span style={{ color: colors.success, fontSize: typography.sm }}>Success</span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TableShell>
          )}
        </Panel>
      </Section>

      <Section>
        <Panel density='dense'>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
            <Activity size={16} color={colors.textSecondary} />
            <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>
              Showing {filtered.length} event(s)
            </span>
          </div>
        </Panel>
      </Section>
    </PageContainer>
  )
}
