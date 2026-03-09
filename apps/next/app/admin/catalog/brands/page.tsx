'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Edit, Plus, Search, Trash2 } from 'lucide-react'
import { apiClient } from '../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  Button,
  EmptyState,
  PageContainer,
  PageHeader,
  Panel,
  Section,
  StatusPill,
  TableShell,
} from '../../_components/AdminPagePrimitives'

type BrandRow = {
  id: string
  slug: string
  name: { en: string; ar: string }
  isActive: boolean
}

export default function AdminCatalogBrandsPage() {
  const [rows, setRows] = useState<BrandRow[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void apiClient.catalog
      .brands()
      .then((data) => setRows(data as BrandRow[]))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load brands.'))
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) => `${item.name.en} ${item.slug}`.toLowerCase().includes(needle))
  }, [query, rows])

  return (
    <PageContainer>
      <PageHeader
        title='Brands'
        actions={
          <Button tone='primary'>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
              <Plus size={14} color={colors.textInverted} />
              Add Brand
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
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing['12'],
              }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                <Search
                  size={16}
                  color={colors.textSecondary}
                  style={{ position: 'absolute', insetInlineStart: 12, top: 12 }}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search brands...'
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

              <Button tone='secondary'>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                  <Download size={14} color={colors.textSecondary} />
                  Export
                </span>
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title='No brands found' description='Try another search query or clear active filters.' />
          ) : (
            <TableShell>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Brand Name', 'Slug', 'Products', 'Status', 'Actions'].map((head) => (
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
                    <tr key={item.id}>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <div style={{ display: 'grid', gap: spacing['4'] }}>
                          <span style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>{item.name.en}</span>
                          <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{item.name.ar}</span>
                        </div>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: typography.xs }}>
                        {item.slug}
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                        -
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <StatusPill tone={item.isActive ? 'success' : 'warning'}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </StatusPill>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: spacing['4'] }}>
                          <button
                            type='button'
                            style={{
                              border: 0,
                              backgroundColor: 'transparent',
                              width: spacing['32'],
                              height: spacing['32'],
                              borderRadius: radius.md,
                              color: colors.textSecondary,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type='button'
                            style={{
                              border: 0,
                              backgroundColor: 'transparent',
                              width: spacing['32'],
                              height: spacing['32'],
                              borderRadius: radius.md,
                              color: colors.danger,
                              cursor: 'pointer',
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
