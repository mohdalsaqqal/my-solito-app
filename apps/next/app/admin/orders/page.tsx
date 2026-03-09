'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Filter, MoreHorizontal, Search } from 'lucide-react'
import { OrderSummary } from '@real/app/lib/types'
import { apiClient } from '../../apiClient'
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
} from '../_components/AdminPagePrimitives'

function statusTone(status: string) {
  if (status === 'delivered') return 'success' as const
  if (status === 'cancelled') return 'danger' as const
  if (status === 'shipped') return 'neutral' as const
  return 'warning' as const
}

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderSummary[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void apiClient.orders
      .list()
      .then(setRows)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load orders.'))
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) =>
      `${item.id} ${item.status} ${item.ownerUserId ?? ''}`.toLowerCase().includes(needle)
    )
  }, [rows, query])

  return (
    <PageContainer>
      <PageHeader title='Orders' />
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
                  placeholder='Search orders...'
                  aria-label='Search orders'
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

              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
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
            <EmptyState
              title='No orders found'
              description='Try changing your search term or clear active filters.'
            />
          ) : (
            <>
              <TableShell>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions'].map((head) => (
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
                    {filtered.map((order) => (
                      <tr key={order.id}>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>
                          {order.id}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                          {order.ownerUserId ?? 'Customer'}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                          {order.items?.length ?? 0}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: order.currency,
                            maximumFractionDigits: 2,
                          }).format(order.total)}
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                          <StatusPill tone={statusTone(order.status)}>{order.status}</StatusPill>
                        </td>
                        <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, textAlign: 'end' }}>
                          <button
                            type='button'
                            aria-label={`Actions for ${order.id}`}
                            style={{
                              border: 0,
                              backgroundColor: 'transparent',
                              color: colors.textSecondary,
                              width: spacing['32'],
                              height: spacing['32'],
                              borderRadius: radius.md,
                              cursor: 'pointer',
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing['12'],
                  borderTop: `1px solid ${colors.border}`,
                  marginTop: spacing['12'],
                  paddingTop: spacing['12'],
                }}
              >
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs }}>
                  Showing <strong>1-{filtered.length}</strong> of <strong>{rows.length}</strong> orders
                </p>
                <div style={{ display: 'flex', gap: spacing['8'] }}>
                  <Button tone='secondary' disabled>
                    Previous
                  </Button>
                  <Button tone='secondary' disabled>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </Panel>
      </Section>
    </PageContainer>
  )
}
