'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Edit, Filter, Plus, Search, Trash2 } from 'lucide-react'
import { Product } from '@real/app/lib/types'
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

export default function AdminCatalogProductsPage() {
  const [rows, setRows] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void apiClient.products
      .list({ limit: 300 })
      .then(setRows)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load products.'))
  }, [])

  const categories = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.category).filter(Boolean))) as string[]
  }, [rows])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((item) => {
      const matchesQuery =
        !needle || `${item.name} ${item.brand ?? ''} ${item.category ?? ''}`.toLowerCase().includes(needle)
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      return matchesQuery && matchesCategory
    })
  }, [rows, query, categoryFilter])

  return (
    <PageContainer>
      <PageHeader
        title='Products'
        actions={
          <Button tone='primary'>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
              <Plus size={14} color={colors.textInverted} />
              Add Product
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
                  placeholder='Search products...'
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
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
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
                  <option value=''>All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <Button tone='secondary'>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                    <Filter size={14} color={colors.textSecondary} />
                    Filter
                  </span>
                </Button>
                <Button tone='secondary'>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                    <Download size={14} color={colors.textSecondary} />
                    Export
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title='No products found' description='Adjust the current filters or clear the search query.' />
          ) : (
            <TableShell>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Product Name', 'Category', 'Price', 'Inventory', 'Status', 'Actions'].map((head) => (
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
                  {filtered.map((item) => {
                    const inStock = (item.stock ?? 0) > 0
                    return (
                      <tr key={item.id}>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                          <div style={{ display: 'grid', gap: spacing['4'] }}>
                            <span style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>{item.name}</span>
                            <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{item.brand ?? 'Unassigned brand'}</span>
                          </div>
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                          {item.category ?? '-'}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: item.currency || 'USD',
                            maximumFractionDigits: 2,
                          }).format(item.price)}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                          {item.stock ?? 0}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                          <StatusPill tone={inStock ? 'success' : 'warning'}>{inStock ? 'Active' : 'Draft'}</StatusPill>
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, textAlign: 'end' }}>
                          <div style={{ display: 'inline-flex', gap: spacing['4'] }}>
                            <button
                              type='button'
                              aria-label={`Edit ${item.name}`}
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
                              aria-label={`Delete ${item.name}`}
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
                    )
                  })}
                </tbody>
              </table>
            </TableShell>
          )}
        </Panel>
      </Section>
    </PageContainer>
  )
}
