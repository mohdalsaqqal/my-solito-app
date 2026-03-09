'use client'

import { useEffect, useMemo, useState } from 'react'
import { Ban, CheckCircle, Download, Filter, Mail, MoreHorizontal, Search } from 'lucide-react'
import { AdminUserControlRecord } from '@real/app/lib/types'
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

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<AdminUserControlRecord[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void apiClient.admin
      .listUsers()
      .then(setRows)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load customers/users.'))
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) => `${item.name} ${item.email}`.toLowerCase().includes(needle))
  }, [query, rows])

  return (
    <PageContainer>
      <PageHeader
        title='Customers'
        actions={
          <Button tone='secondary'>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
              <Download size={14} color={colors.textSecondary} />
              Export CSV
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
                  placeholder='Search customers...'
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
                  <Filter size={14} color={colors.textSecondary} />
                  Filter
                </span>
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title='No customers found' description='Try another query or clear filters.' />
          ) : (
            <TableShell>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Customer', 'Contact', 'Role', 'Status', 'Actions'].map((head) => (
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
                          <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
                            {item.name}
                          </span>
                          <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{item.id}</span>
                        </div>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <div style={{ display: 'grid', gap: spacing['4'] }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], color: colors.textSecondary, fontSize: typography.xs }}>
                            <Mail size={12} />
                            {item.email}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                        {item.role}
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                        <StatusPill tone={item.status === 'active' ? 'success' : 'warning'}>
                          {item.status}
                        </StatusPill>
                      </td>
                      <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: spacing['4'] }}>
                          <button
                            type='button'
                            aria-label={item.status === 'active' ? `Deactivate ${item.name}` : `Activate ${item.name}`}
                            style={{
                              border: 0,
                              backgroundColor: 'transparent',
                              width: spacing['32'],
                              height: spacing['32'],
                              borderRadius: radius.md,
                              cursor: 'pointer',
                              color: item.status === 'active' ? colors.danger : colors.success,
                            }}
                            onClick={async () => {
                              try {
                                await apiClient.admin.updateUser(item.id, {
                                  status: item.status === 'active' ? 'disabled' : 'active',
                                })
                                const refreshed = await apiClient.admin.listUsers()
                                setRows(refreshed)
                              } catch (cause) {
                                setError(cause instanceof Error ? cause.message : 'Unable to update user status.')
                              }
                            }}
                          >
                            {item.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button
                            type='button'
                            aria-label={`Actions for ${item.name}`}
                            style={{
                              border: 0,
                              backgroundColor: 'transparent',
                              width: spacing['32'],
                              height: spacing['32'],
                              borderRadius: radius.md,
                              cursor: 'pointer',
                              color: colors.textSecondary,
                            }}
                          >
                            <MoreHorizontal size={16} />
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
