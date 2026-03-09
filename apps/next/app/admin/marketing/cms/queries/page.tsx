'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, Search, Trash2 } from 'lucide-react'
import { ProductQuery } from '@real/app/lib/types'
import { apiClient } from '../../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { Button, EmptyState, PageContainer, PageHeader, Panel, Section, StatusPill, TableShell } from '../../../_components/AdminPagePrimitives'

export default function AdminCmsQueriesPage() {
  const [rows, setRows] = useState<ProductQuery[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [error, setError] = useState<string | null>(null)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [previewMessage, setPreviewMessage] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await apiClient.admin.listProductQueries()
      setRows(data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load CMS queries.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((item) => {
      const matchesSearch = !needle || `${item.slug} ${item.title?.en ?? ''}`.toLowerCase().includes(needle)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.active) ||
        (statusFilter === 'inactive' && !item.active)
      return matchesSearch && matchesStatus
    })
  }, [query, rows, statusFilter])

  const downloadCsv = () => {
    const header = ['slug', 'active', 'title_en', 'title_ar', 'filters']
    const lines = filtered.map((item) => [
      item.slug,
      item.active ? 'true' : 'false',
      item.title?.en ?? '',
      item.title?.ar ?? '',
      JSON.stringify(item.filters),
    ])
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cms-queries.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const previewQuery = async (item: ProductQuery) => {
    setBusySlug(item.slug)
    setError(null)
    setPreviewMessage(null)
    try {
      const products = await apiClient.products.list(item.filters)
      setPreviewMessage(`Preview ${item.slug}: ${products.length} matching product(s).`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to preview query results.')
    } finally {
      setBusySlug(null)
    }
  }

  const removeQuery = async (querySlug: string) => {
    const confirmed = window.confirm(`Delete query "${querySlug}"?`)
    if (!confirmed) return
    setBusySlug(querySlug)
    setError(null)
    try {
      await apiClient.admin.deleteProductQuery(querySlug)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete query.')
    } finally {
      setBusySlug(null)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title='CMS Queries'
        actions={
          <Button tone='secondary' onClick={downloadCsv}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
              <Download size={14} color={colors.textSecondary} />
              Export CSV
            </span>
          </Button>
        }
      />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}
      {previewMessage ? <p style={{ marginTop: 0, color: colors.textSecondary }}>{previewMessage}</p> : null}

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
                placeholder='Search queries...'
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
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
              <option value='all'>All statuses</option>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title='No CMS queries found' description='No queries matched the current filters.' />
          ) : (
            <TableShell>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Slug', 'Status', 'Filters', 'Actions'].map((head) => (
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
                  {filtered.map((item) => (
                    <tr key={item.slug}>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <div style={{ display: 'grid', gap: spacing['4'] }}>
                          <span style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>{item.slug}</span>
                          <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                            {item.title?.en ?? '-'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <StatusPill tone={item.active ? 'success' : 'warning'}>
                          {item.active ? 'Active' : 'Inactive'}
                        </StatusPill>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <code style={{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: 'monospace' }}>
                          {JSON.stringify(item.filters)}
                        </code>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: spacing['4'] }}>
                          <button
                            type='button'
                            aria-label={`Preview ${item.slug}`}
                            disabled={busySlug === item.slug}
                            onClick={() => void previewQuery(item)}
                            style={{
                              border: 0,
                              backgroundColor: 'transparent',
                              width: spacing['32'],
                              height: spacing['32'],
                              borderRadius: radius.md,
                              color: colors.textSecondary,
                              cursor: 'pointer',
                              opacity: busySlug === item.slug ? 0.6 : 1,
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type='button'
                            aria-label={`Delete ${item.slug}`}
                            disabled={busySlug === item.slug}
                            onClick={() => void removeQuery(item.slug)}
                            style={{
                              border: 0,
                              backgroundColor: 'transparent',
                              width: spacing['32'],
                              height: spacing['32'],
                              borderRadius: radius.md,
                              color: colors.danger,
                              cursor: 'pointer',
                              opacity: busySlug === item.slug ? 0.6 : 1,
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
