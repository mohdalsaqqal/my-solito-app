'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { AdminOpsAuditEntry, OrderSummary } from '@real/app/lib/types'
import { colors, fontWeights, radius, spacing, typography } from '@real/tokens'
import { apiClient } from '../../apiClient'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'
import {
  ActivityFeed,
  AdminCommandBar,
  AdminKpiCard,
  AdminKpiGrid,
  AdminPanelHeader,
  AdminTrendPill,
  Button,
  EmptyState,
  MetricList,
  PageContainer,
  Panel,
  WorkspaceLayout,
} from '../_components/AdminPagePrimitives'

function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRelativeTime(input: string) {
  const diffMs = Date.now() - new Date(input).getTime()
  const diffMins = Math.max(0, Math.floor(diffMs / 60000))
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

type TopItemStat = {
  id: string
  name: string
  sales: number
  revenue: number
}

const copy = {
  eyebrow: 'Control Room',
  title: 'Admin Dashboard',
  subtitle:
    'Track commercial momentum, queue pressure, and operator activity across the first-store launch.',
  loading: 'Loading dashboard signal...',
  error: 'Unable to load dashboard data.',
  refresh: 'Refresh dashboard',
  refreshing: 'Refreshing...',
  sections: {
    pulse: 'Commercial pulse',
    pulseSubtitle:
      'Topline trading and service signals for the current mock operating baseline.',
    topProducts: 'Top products',
    topProductsSubtitle:
      'Highest-contributing items by realized revenue across current orders.',
    actionBoard: 'Action board',
    actionBoardSubtitle:
      'Recommended next actions based on order pressure and delivery health.',
    recentActivity: 'Recent activity',
    recentActivitySubtitle:
      'Latest operator actions recorded in the audit feed.',
    quickActions: 'Quick actions',
    quickActionsSubtitle:
      'Jump straight into the highest-frequency admin tasks.',
    healthRail: 'Ops health',
    healthRailSubtitle:
      'Live status signals for throughput, fulfillment, and operator cadence.',
  },
  empty: {
    topProductsTitle: 'No top products yet',
    topProductsDescription:
      'Once orders start flowing, the best-performing items will surface here.',
    activityTitle: 'No recent activity',
    activityDescription:
      'Operator actions will appear here after the next merchandising or ops change.',
  },
}

const dashboardSurfaceTokens = {
  revenuePanelBackground: colors.surfaceLowest,
  revenueBarFill: colors.brandPrimary,
} as const

function DashboardSkeleton() {
  const cardClasses = 'overflow-hidden border-border/80 bg-card shadow-sm'

  return (
    <div
      aria-label={copy.loading}
      aria-busy='true'
      style={{
        display: 'grid',
        gap: spacing['24'],
        width: '100%',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: spacing['16'],
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          width: '100%',
          minWidth: 0,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className={cardClasses}>
            <CardHeader className='space-y-3 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <Skeleton className='h-3 w-28' />
                <Skeleton className='h-8 w-8 rounded-lg' />
              </div>
              <Skeleton className='h-8 w-24' />
            </CardHeader>
            <CardContent className='p-4 pt-0'>
              <Skeleton className='h-3 w-36' />
            </CardContent>
          </Card>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gap: spacing['20'],
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 0.82fr)',
          alignItems: 'start',
          width: '100%',
          minWidth: 0,
        }}
      >
        <div style={{ display: 'grid', gap: spacing['20'], minWidth: 0 }}>
          <Card className={cardClasses}>
            <CardHeader className='space-y-3 p-6'>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-4 w-full max-w-[520px]' />
            </CardHeader>
            <CardContent className='grid gap-4 p-6 pt-0'>
              <Skeleton className='h-20 w-full' />
              <div className='grid gap-3 md:grid-cols-3'>
                <Skeleton className='h-20 w-full rounded-xl' />
                <Skeleton className='h-20 w-full rounded-xl' />
                <Skeleton className='h-20 w-full rounded-xl' />
              </div>
            </CardContent>
          </Card>
          <Card className={cardClasses}>
            <CardHeader className='space-y-3 p-6'>
              <Skeleton className='h-5 w-36' />
              <Skeleton className='h-4 w-full max-w-[480px]' />
            </CardHeader>
            <CardContent className='grid gap-3 p-6 pt-0'>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className='h-14 w-full rounded-xl' />
              ))}
            </CardContent>
          </Card>
        </div>
        <aside style={{ display: 'grid', gap: spacing['20'], minWidth: 0 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className={cardClasses}>
              <CardHeader className='space-y-3 p-5'>
                <Skeleton className='h-5 w-32' />
                <Skeleton className='h-4 w-full' />
              </CardHeader>
              <CardContent className='grid gap-3 p-5 pt-0'>
                <Skeleton className='h-10 w-full rounded-lg' />
                <Skeleton className='h-10 w-full rounded-lg' />
                <Skeleton className='h-10 w-full rounded-lg' />
              </CardContent>
            </Card>
          ))}
        </aside>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [audit, setAudit] = useState<AdminOpsAuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null)

  const loadDashboardData = async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)
    try {
      const [nextOrders, nextAudit] = await Promise.all([
        apiClient.orders.list(),
        apiClient.admin.opsAudit().catch(() => []),
      ])
      setOrders(nextOrders)
      setAudit(nextAudit)
      setLastRefreshedAt(
        new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.error)
    } finally {
      if (mode === 'initial') {
        setLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }

  useEffect(() => {
    void loadDashboardData('initial')
  }, [])

  const currency = orders[0]?.currency ?? 'USD'

  const summary = useMemo(() => {
    const revenue = orders.reduce((acc, order) => acc + Number(order.total || 0), 0)
    const pending = orders.filter((order) => order.status === 'placed').length
    const delivered = orders.filter((order) => order.status === 'delivered').length
    const users = new Set(orders.map((order) => order.ownerUserId).filter(Boolean)).size
    const health = orders.length === 0 ? 100 : Math.min(100, 85 + (delivered / orders.length) * 15)
    return { revenue, pending, delivered, users, health }
  }, [orders])

  const topItems = useMemo<TopItemStat[]>(() => {
    const map = new Map<string, TopItemStat>()
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const key = item.productId || item.name
        const revenue = item.price * item.quantity
        const existing = map.get(key)
        if (!existing) {
          map.set(key, { id: key, name: item.name, sales: item.quantity, revenue })
          continue
        }
        existing.sales += item.quantity
        existing.revenue += revenue
      }
    }
    return Array.from(map.values())
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 5)
  }, [orders])

  const alerts = useMemo(() => {
    const nextAlerts: Array<{ id: string; label: string; value: string; tone: 'danger' | 'warning' | 'success' }> = []
    if (summary.pending > 10) {
      nextAlerts.push({
        id: 'pending',
        label: 'Pending order pressure',
        value: `${summary.pending} open orders need triage`,
        tone: 'danger',
      })
    }
    if (summary.health < 92) {
      nextAlerts.push({
        id: 'health',
        label: 'Fulfillment health softened',
        value: `${summary.health.toFixed(1)}% delivery health`,
        tone: 'warning',
      })
    }
    if (nextAlerts.length === 0) {
      nextAlerts.push({
        id: 'healthy',
        label: 'System operating cleanly',
        value: 'Queues and delivery health are within target.',
        tone: 'success',
      })
    }
    return nextAlerts
  }, [summary.health, summary.pending])

  const auditItems = useMemo(
    () =>
      audit.slice(0, 6).map((entry) => ({
        id: entry.id,
        title: `${entry.actor.email.split('@')[0]} updated ${entry.type}`,
        detail: entry.targetId ? `Target ${entry.targetId}` : 'Admin system activity',
        meta: formatRelativeTime(entry.at),
      })),
    [audit],
  )

  const healthRows = [
    {
      label: 'Orders placed',
      value: orders.length.toLocaleString(),
    },
    {
      label: 'Delivered',
      value: summary.delivered.toLocaleString(),
      tone: 'success' as const,
    },
    {
      label: 'Pending',
      value: summary.pending.toLocaleString(),
      tone: summary.pending > 10 ? ('warning' as const) : ('default' as const),
    },
    {
      label: 'Unique customers',
      value: summary.users.toLocaleString(),
    },
  ]

  const quickActions = [
    { label: 'Open referrals', href: '/admin/marketing/referrals' },
    { label: 'Manage promotions', href: '/admin/marketing/promotions' },
    { label: 'Review orders', href: '/admin/orders' },
    { label: 'Check cache controls', href: '/admin/operations/cache' },
  ]

  return (
    <PageContainer>
      <AdminCommandBar
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        status={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing['8'],
              flexWrap: 'wrap',
            }}
          >
            <AdminTrendPill
              value={summary.health >= 92 ? 'Healthy service lane' : 'Review ops health'}
              tone={summary.health >= 92 ? 'success' : 'warning'}
            />
            {lastRefreshedAt ? (
              <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                Last synced {lastRefreshedAt}
              </span>
            ) : null}
          </div>
        }
        actions={
          <Button onClick={() => void loadDashboardData('refresh')} disabled={isRefreshing}>
            {isRefreshing ? copy.refreshing : copy.refresh}
          </Button>
        }
      />

      {loading ? <DashboardSkeleton /> : null}

      {error ? (
        <Panel tone='danger'>
          <div style={{ color: colors.danger, fontSize: typography.sm }}>{error}</div>
        </Panel>
      ) : null}

      {!loading ? (
        <>
          <AdminKpiGrid>
            <AdminKpiCard
              label='Revenue tracked'
              value={formatCurrency(summary.revenue, currency)}
              meta='Realized order value across current dataset'
              icon={Sparkles}
              tone='brand'
              trend={<AdminTrendPill value='Merchandise pulse' tone='neutral' />}
            />
            <AdminKpiCard
              label='Customers engaged'
              value={summary.users.toLocaleString()}
              meta='Distinct buyers visible in current order flow'
              icon={Users}
              trend={<AdminTrendPill value='Audience signal' tone='neutral' />}
            />
            <AdminKpiCard
              label='Pending queue'
              value={summary.pending.toLocaleString()}
              meta='Orders still waiting for the next fulfillment step'
              icon={Package}
              tone={summary.pending > 10 ? 'warning' : 'default'}
              trend={
                <AdminTrendPill
                  value={summary.pending > 10 ? 'Needs action' : 'Stable'}
                  tone={summary.pending > 10 ? 'warning' : 'success'}
                />
              }
            />
            <AdminKpiCard
              label='Delivery health'
              value={`${summary.health.toFixed(1)}%`}
              meta='Derived from delivered order share'
              icon={CheckCircle2}
              tone={summary.health >= 92 ? 'success' : 'warning'}
              trend={
                <AdminTrendPill
                  value={summary.health >= 92 ? 'On target' : 'Under target'}
                  tone={summary.health >= 92 ? 'success' : 'warning'}
                />
              }
            />
          </AdminKpiGrid>

          <WorkspaceLayout
            main={
              <>
                <Panel tone='brand'>
                  <AdminPanelHeader
                    title={copy.sections.pulse}
                    subtitle={copy.sections.pulseSubtitle}
                  />
                  <div
                    style={{
                      display: 'grid',
                      gap: spacing['16'],
                      gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)',
                      alignItems: 'stretch',
                    }}
                  >
                    <div
                      style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.xl + 6,
                        background: dashboardSurfaceTokens.revenuePanelBackground,
                        padding: spacing['16'],
                        display: 'grid',
                        gap: spacing['16'],
                      }}
                    >
                      <div style={{ display: 'grid', gap: spacing['6'] }}>
                        <span
                          style={{
                            color: colors.textSecondary,
                            fontSize: typography.xs,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: Number(fontWeights.semibold),
                          }}
                        >
                          Revenue control
                        </span>
                        <div
                          style={{
                            color: colors.textPrimary,
                            fontSize: `clamp(${typography['3xl']}px, 4vw, ${typography.h1}px)`,
                            lineHeight: 0.95,
                            letterSpacing: '-0.04em',
                            fontWeight: Number(fontWeights.bold),
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatCurrency(summary.revenue, currency)}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: colors.textSecondary,
                            fontSize: typography.sm,
                            lineHeight: 1.6,
                            maxWidth: 520,
                          }}
                        >
                          Current revenue signal across the active first-store dataset. Use this
                          surface to judge whether merchandising and fulfillment are moving in sync.
                        </p>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gap: spacing['10'],
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                        }}
                      >
                        {[
                          { label: 'Customers', value: formatCompactNumber(summary.users) },
                          { label: 'Pending', value: formatCompactNumber(summary.pending) },
                          { label: 'Delivered', value: formatCompactNumber(summary.delivered) },
                        ].map((item) => (
                          <div
                            key={item.label}
                            style={{
                              borderRadius: radius.xl,
                              backgroundColor: colors.surfaceMuted,
                              border: `1px solid ${colors.border}`,
                              padding: spacing['12'],
                              display: 'grid',
                              gap: spacing['4'],
                            }}
                          >
                            <span
                              style={{
                                color: colors.textSecondary,
                                fontSize: typography.xs,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                              }}
                            >
                              {item.label}
                            </span>
                            <span
                              style={{
                                color: colors.textPrimary,
                                fontSize: typography.xl,
                                fontWeight: Number(fontWeights.bold),
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: spacing['10'] }}>
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          style={{
                            border: `1px solid ${
                              alert.tone === 'danger'
                                ? colors.danger + '22'
                                : alert.tone === 'warning'
                                  ? colors.warning + '22'
                                  : colors.success + '22'
                            }`,
                            borderRadius: radius.xl,
                            backgroundColor: colors.surface,
                            padding: spacing['12'],
                            display: 'grid',
                            gap: spacing['6'],
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing['8'],
                            }}
                          >
                            {alert.tone === 'danger' ? (
                              <AlertTriangle size={16} color={colors.danger} />
                            ) : alert.tone === 'warning' ? (
                              <Activity size={16} color={colors.warning} />
                            ) : (
                              <CheckCircle2 size={16} color={colors.success} />
                            )}
                            <span
                              style={{
                                color: colors.textPrimary,
                                fontSize: typography.sm,
                                fontWeight: Number(fontWeights.semibold),
                              }}
                            >
                              {alert.label}
                            </span>
                          </div>
                          <span
                            style={{
                              color: colors.textSecondary,
                              fontSize: typography.sm,
                              lineHeight: 1.5,
                            }}
                          >
                            {alert.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.topProducts}
                    subtitle={copy.sections.topProductsSubtitle}
                    actions={
                      <Link href='/admin/catalog/products' style={linkStyle}>
                        Open catalog
                      </Link>
                    }
                  />
                  {topItems.length === 0 ? (
                    <EmptyState
                      title={copy.empty.topProductsTitle}
                      description={copy.empty.topProductsDescription}
                    />
                  ) : (
                    <div style={{ display: 'grid', gap: spacing['10'] }}>
                      {topItems.map((item, index) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'grid',
                            gap: spacing['8'],
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.xl,
                            backgroundColor: colors.surfaceMuted,
                            padding: spacing['12'],
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: spacing['12'],
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['10'] }}>
                              <div
                                style={{
                                  width: spacing['32'],
                                  height: spacing['32'],
                                  borderRadius: radius.full,
                                  backgroundColor: index === 0 ? colors.brandPrimarySubtle : colors.surface,
                                  color: index === 0 ? colors.brandPrimary : colors.textSecondary,
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontSize: typography.xs,
                                  fontWeight: Number(fontWeights.bold),
                                  flexShrink: 0,
                                }}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <div
                                  style={{
                                    color: colors.textPrimary,
                                    fontSize: typography.sm,
                                    fontWeight: Number(fontWeights.semibold),
                                  }}
                                >
                                  {item.name}
                                </div>
                                <div
                                  style={{
                                    color: colors.textSecondary,
                                    fontSize: typography.xs,
                                  }}
                                >
                                  {item.sales.toLocaleString()} units moved
                                </div>
                              </div>
                            </div>
                            <AdminTrendPill value={formatCurrency(item.revenue, currency)} tone='neutral' />
                          </div>
                          <div
                            style={{
                              width: '100%',
                              height: 6,
                              borderRadius: radius.full,
                              backgroundColor: colors.surface,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max(18, (item.revenue / Math.max(topItems[0]?.revenue || 1, 1)) * 100)}%`,
                                height: '100%',
                                borderRadius: radius.full,
                                background: dashboardSurfaceTokens.revenueBarFill,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </>
            }
            rail={
              <>
                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.actionBoard}
                    subtitle={copy.sections.actionBoardSubtitle}
                  />
                  <MetricList
                    rows={[
                      {
                        label: 'Triage queue',
                        value:
                          summary.pending > 10
                            ? `${summary.pending} orders need review`
                            : 'Queue is under control',
                        tone: summary.pending > 10 ? 'warning' : 'success',
                      },
                      {
                        label: 'Referral follow-up',
                        value: 'Review creator approvals and attribution status',
                        tone: 'brand',
                      },
                      {
                        label: 'Promotion readiness',
                        value: 'Open live campaigns before the next merchandising push',
                      },
                    ]}
                  />
                </Panel>

                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.quickActions}
                    subtitle={copy.sections.quickActionsSubtitle}
                  />
                  <div style={{ display: 'grid', gap: spacing['10'] }}>
                    {quickActions.map((action) => (
                      <Link key={action.label} href={action.href} style={actionLinkStyle}>
                        <span>{action.label}</span>
                        <ArrowUpRight size={15} color={colors.brandPrimary} />
                      </Link>
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.healthRail}
                    subtitle={copy.sections.healthRailSubtitle}
                  />
                  <MetricList rows={healthRows} />
                </Panel>

                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.recentActivity}
                    subtitle={copy.sections.recentActivitySubtitle}
                    actions={
                      <Link href='/admin/operations/audit' style={linkStyle}>
                        Open audit
                      </Link>
                    }
                  />
                  {auditItems.length === 0 ? (
                    <EmptyState
                      title={copy.empty.activityTitle}
                      description={copy.empty.activityDescription}
                    />
                  ) : (
                    <ActivityFeed items={auditItems} empty={copy.empty.activityDescription} />
                  )}
                </Panel>
              </>
            }
          />
        </>
      ) : null}
    </PageContainer>
  )
}

const linkStyle = {
  color: colors.brandPrimary,
  textDecoration: 'none',
  fontSize: typography.sm,
  fontWeight: Number(fontWeights.medium),
} as const

const actionLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacing['12'],
  border: `1px solid ${colors.border}`,
  borderRadius: radius.xl,
  backgroundColor: colors.surfaceMuted,
  padding: `${spacing['12']}px ${spacing['12']}px`,
  textDecoration: 'none',
  color: colors.textPrimary,
  fontSize: typography.sm,
  fontWeight: Number(fontWeights.medium),
} as const
