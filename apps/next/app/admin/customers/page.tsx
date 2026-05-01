'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Ban,
  CheckCircle,
  Download,
  Filter,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'
import { AdminUserControlRecord } from '@real/app/lib/types'
import { apiClient } from '../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  AdminFormScaffold,
  Button,
  EmptyState,
  PageContainer,
  Panel,
  Section,
  StatusPill,
  TableShell,
} from '../_components/AdminPagePrimitives'
import { AddUserSlideOver } from './_components/AddUserSlideOver'

const copy = {
  searchUsers: 'Search users...',
} as const

export default function AdminCustomersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<AdminUserControlRecord[]>([])
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [error, setError] = useState<string | null>(null)
  const [showAddPanel, setShowAddPanel] = useState(false)

  useEffect(() => {
    void apiClient.admin
      .listUsers()
      .then(setRows)
      .catch((cause) =>
        setError(
          cause instanceof Error
            ? cause.message
            : 'Unable to load customers/users.',
        ),
      )
  }, [])

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) =>
      `${item.name} ${item.email}`.toLowerCase().includes(needle),
    )
  }, [query, rows])
  const systemUsers = useMemo(
    () => filtered.filter((item) => item.role !== 'customer'),
    [filtered],
  )
  const customerUsers = useMemo(
    () => filtered.filter((item) => item.role === 'customer'),
    [filtered],
  )
  const screen =
    searchParams.get('screen') === 'customers' ? 'customers' : 'system'

  const toggleUserStatus = async (item: AdminUserControlRecord) => {
    try {
      await apiClient.admin.updateUser(item.id, {
        status: item.status === 'active' ? 'disabled' : 'active',
      })
      const refreshed = await apiClient.admin.listUsers()
      setRows(refreshed)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to update user status.',
      )
    }
  }

  const setScreen = (nextScreen: 'system' | 'customers') => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextScreen === 'system') {
      params.delete('screen')
    } else {
      params.set('screen', 'customers')
    }
    if (query.trim()) {
      params.set('q', query.trim())
    }
    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  return (
    <PageContainer>
      <Section>
        <AdminFormScaffold
          title="User Management"
          subtitle="Manage internal/admin accounts and signed-up customer accounts in separate screens."
          notice={error ? { tone: 'danger', message: error } : undefined}
          actions={
            <>
              <Button tone="primary" onClick={() => setShowAddPanel(true)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                  <Plus size={14} color={colors.textInverted} />
                  Add User
                </span>
              </Button>
              <Button tone="secondary">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                  <Download size={14} color={colors.textSecondary} />
                  Export CSV
                </span>
              </Button>
            </>
          }
        >
          <Panel density="dense">
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
                <div
                  style={{ position: 'relative', width: '100%', maxWidth: 320 }}
                >
                  <Search
                    size={16}
                    color={colors.textSecondary}
                    style={{
                      position: 'absolute',
                      insetInlineStart: 12,
                      top: 12,
                    }}
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={copy.searchUsers}
                    className="admin-focus-ring"
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

                <Button tone="secondary">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: spacing['8'],
                    }}
                  >
                    <Filter size={14} color={colors.textSecondary} />
                    Filter
                  </span>
                </Button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: spacing['8'],
                marginBottom: spacing['16'],
              }}
            >
              <Button
                tone={screen === 'system' ? 'primary' : 'secondary'}
                onClick={() => setScreen('system')}
              >
                Admin &amp; System Users
              </Button>
              <Button
                tone={screen === 'customers' ? 'primary' : 'secondary'}
                onClick={() => setScreen('customers')}
              >
                Customer Users
              </Button>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="No users found"
                description="Try another query or clear filters."
              />
            ) : (
              <>
                {screen === 'system' ? (
                  <UserSegmentTable
                    title={`Admin & system users (${systemUsers.length})`}
                    subtitle="Admin-created accounts for internal teams and platform operations."
                    rows={systemUsers}
                    emptyTitle="No admin/system users found"
                    emptyDescription="No internal users match your current search."
                    onToggleStatus={toggleUserStatus}
                  />
                ) : (
                  <UserSegmentTable
                    title={`Customer users (${customerUsers.length})`}
                    subtitle="Users who signed up via storefront customer flows."
                    rows={customerUsers}
                    emptyTitle="No customer users found"
                    emptyDescription="No signed-up customers match your current search."
                    onToggleStatus={toggleUserStatus}
                  />
                )}
              </>
            )}
          </Panel>
        </AdminFormScaffold>
      </Section>

      <AddUserSlideOver
        open={showAddPanel}
        onClose={() => setShowAddPanel(false)}
        onCreated={() => {
          void apiClient.admin.listUsers().then(setRows).catch((cause) =>
            setError(cause instanceof Error ? cause.message : 'Unable to refresh users.')
          )
        }}
      />
    </PageContainer>
  )
}

function UserSegmentTable({
  title,
  subtitle,
  rows,
  emptyTitle,
  emptyDescription,
  onToggleStatus,
}: {
  title: string
  subtitle: string
  rows: AdminUserControlRecord[]
  emptyTitle: string
  emptyDescription: string
  onToggleStatus: (item: AdminUserControlRecord) => Promise<void>
}) {
  return (
    <div style={{ display: 'grid', gap: spacing['12'] }}>
      <div style={{ display: 'grid', gap: spacing['4'] }}>
        <p
          style={{
            margin: 0,
            color: colors.textPrimary,
            fontSize: typography.sm,
            fontWeight: Number(fontWeights.semibold),
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: 0,
            color: colors.textSecondary,
            fontSize: typography.xs,
          }}
        >
          {subtitle}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <TableShell>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Customer', 'Contact', 'Role', 'Status', 'Actions'].map(
                  (head) => (
                    <th
                      key={head}
                      scope="col"
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
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td
                    style={{
                      padding: spacing['12'],
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <div style={{ display: 'grid', gap: spacing['4'] }}>
                      <span
                        style={{
                          color: colors.textPrimary,
                          fontSize: typography.sm,
                          fontWeight: Number(fontWeights.medium),
                        }}
                      >
                        {item.name}
                      </span>
                      <span
                        style={{
                          color: colors.textSecondary,
                          fontSize: typography.xs,
                        }}
                      >
                        {item.id}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: spacing['12'],
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <div style={{ display: 'grid', gap: spacing['4'] }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: spacing['4'],
                          color: colors.textSecondary,
                          fontSize: typography.xs,
                        }}
                      >
                        <Mail size={12} />
                        {item.email}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: spacing['12'],
                      borderBottom: `1px solid ${colors.border}`,
                      color: colors.textSecondary,
                    }}
                  >
                    {item.role}
                  </td>
                  <td
                    style={{
                      padding: spacing['12'],
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <StatusPill
                      tone={item.status === 'active' ? 'success' : 'warning'}
                    >
                      {item.status}
                    </StatusPill>
                  </td>
                  <td
                    style={{
                      padding: spacing['12'],
                      borderBottom: `1px solid ${colors.border}`,
                      textAlign: 'end',
                    }}
                  >
                    <div style={{ display: 'inline-flex', gap: spacing['4'] }}>
                      <button
                        type="button"
                        aria-label={
                          item.status === 'active'
                            ? `Deactivate ${item.name}`
                            : `Activate ${item.name}`
                        }
                        className="admin-focus-ring"
                        style={{
                          border: 0,
                          backgroundColor: 'transparent',
                          width: spacing['32'],
                          height: spacing['32'],
                          borderRadius: radius.md,
                          cursor: 'pointer',
                          color:
                            item.status === 'active'
                              ? colors.danger
                              : colors.success,
                        }}
                        onClick={() => void onToggleStatus(item)}
                      >
                        {item.status === 'active' ? (
                          <Ban size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                      </button>
                      <button
                        type="button"
                        aria-label={`Actions for ${item.name}`}
                        className="admin-focus-ring"
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
    </div>
  )
}
