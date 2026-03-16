'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
  Zap,
} from 'lucide-react'
import { apiClient } from '../../apiClient'
import { AdminOpsAuditEntry, OrderSummary } from '@real/app/lib/types'
import { colors, fontWeights, radius, spacing, typography } from '@real/tokens'
import {
  Button,
  EmptyState,
  PageContainer,
  PageHeader,
  Panel,
  Section,
  SelectInput,
  TableShell,
  TextInput,
} from '../_components/AdminPagePrimitives'

type Trend = 'up' | 'down'

type SeriesPoint = {
  label: string
  revenue: number
  orders: number
}

type TopItemStat = {
  id: string
  name: string
  sales: number
  revenue: number
}

type Period = '7d' | '30d' | '3m' | '12m'
type ChartMode = 'revenue' | 'orders' | 'both'

function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatKpiChange(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function buildLast12MonthsSeries(orders: OrderSummary[]): SeriesPoint[] {
  const monthMap = new Map<string, { revenue: number; orders: number }>()
  const now = new Date()

  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, { revenue: 0, orders: 0 })
  }

  for (const order of orders) {
    const createdAt = new Date(order.createdAt)
    const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
    if (!monthMap.has(key)) continue
    const current = monthMap.get(key)!
    current.revenue += Number(order.total || 0)
    current.orders += 1
  }

  return Array.from(monthMap.entries()).map(([key, row]) => {
    const [year, month] = key.split('-')
    return {
      label: `${month}/${year.slice(2)}`,
      revenue: row.revenue,
      orders: row.orders,
    }
  })
}

function buildYearSeries(orders: OrderSummary[], year: number): SeriesPoint[] {
  const monthMap = new Map<number, { revenue: number; orders: number }>()
  for (let month = 1; month <= 12; month += 1) {
    monthMap.set(month, { revenue: 0, orders: 0 })
  }

  for (const order of orders) {
    const createdAt = new Date(order.createdAt)
    if (createdAt.getFullYear() !== year) continue
    const month = createdAt.getMonth() + 1
    const current = monthMap.get(month)
    if (!current) continue
    current.revenue += Number(order.total || 0)
    current.orders += 1
  }

  return Array.from(monthMap.entries()).map(([month, row]) => ({
    label: String(month).padStart(2, '0'),
    revenue: row.revenue,
    orders: row.orders,
  }))
}

function buildPeriodSeries(orders: OrderSummary[], period: Period): SeriesPoint[] {
  const now = new Date()

  if (period === '7d') {
    const points: SeriesPoint[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = `${d.getMonth() + 1}/${d.getDate()}`
      const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === key)
      points.push({
        label,
        revenue: dayOrders.reduce((s, o) => s + Number(o.total || 0), 0),
        orders: dayOrders.length,
      })
    }
    return points
  }

  if (period === '30d') {
    const points: SeriesPoint[] = []
    for (let i = 5; i >= 0; i--) {
      const endD = new Date(now)
      endD.setDate(endD.getDate() - i * 5)
      const startD = new Date(endD)
      startD.setDate(startD.getDate() - 4)
      const label = `${startD.getMonth() + 1}/${startD.getDate()}`
      const bucketOrders = orders.filter((o) => {
        const t = new Date(o.createdAt).getTime()
        return t >= startD.getTime() && t <= endD.getTime()
      })
      points.push({
        label,
        revenue: bucketOrders.reduce((s, o) => s + Number(o.total || 0), 0),
        orders: bucketOrders.length,
      })
    }
    return points
  }

  if (period === '3m') {
    const points: SeriesPoint[] = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('default', { month: 'short' })
      const monthOrders = orders.filter((o) => o.createdAt.startsWith(key))
      points.push({
        label,
        revenue: monthOrders.reduce((s, o) => s + Number(o.total || 0), 0),
        orders: monthOrders.length,
      })
    }
    return points
  }

  return buildLast12MonthsSeries(orders)
}

const KPI_ACCENT: Record<string, string> = {
  revenue: colors.brandPrimary,
  users: colors.info,
  pending: colors.warning,
  health: colors.success,
}

function KpiCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  href,
  accentKey,
}: {
  title: string
  value: string
  change: string
  trend: Trend
  icon: React.ComponentType<{ size?: number; color?: string }>
  href: string
  accentKey: 'revenue' | 'users' | 'pending' | 'health'
}) {
  const accent = KPI_ACCENT[accentKey]
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: radius.xl,
          backgroundColor: colors.surface,
          padding: `${spacing['16']}px ${spacing['20']}px`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          borderInlineStart: `3px solid ${accent}`,
          transition: 'box-shadow 160ms ease, transform 160ms ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'
          el.style.transform = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing['12'] }}>
          <span style={{ fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: colors.textSecondary }}>
            {title}
          </span>
          <div
            style={{
              borderRadius: radius.full,
              backgroundColor: accent + '18',
              width: spacing['32'],
              height: spacing['32'],
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={16} color={accent} />
          </div>
        </div>
        <div
          style={{
            fontSize: typography['2xl'],
            fontWeight: Number(fontWeights.bold),
            color: colors.textPrimary,
            lineHeight: 1.1,
            marginBottom: spacing['8'],
          }}
        >
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing['4'], fontSize: typography.xs }}>
          {trend === 'up' ? (
            <ArrowUpRight size={14} color={colors.success} />
          ) : (
            <ArrowDownRight size={14} color={colors.danger} />
          )}
          <span style={{ fontWeight: Number(fontWeights.medium), color: trend === 'up' ? colors.success : colors.danger }}>
            {change}
          </span>
          <span style={{ color: colors.textSecondary }}>vs last period</span>
        </div>
      </div>
    </Link>
  )
}

function AlertItem({
  title,
  description,
  severity,
}: {
  title: string
  description: string
  severity: 'high' | 'medium'
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing['12'],
        borderBottom: `1px solid ${colors.border}`,
        paddingBlock: spacing['12'],
      }}
    >
      <AlertTriangle size={20} color={severity === 'high' ? colors.danger : colors.warning} />
      <div>
        <p style={{ margin: 0, color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
          {title}
        </p>
        <p style={{ margin: `${spacing['4']}px 0 0`, color: colors.textSecondary, fontSize: typography.xs }}>
          {description}
        </p>
      </div>
    </div>
  )
}

function TopItem({ name, sales, revenue }: { name: string; sales: number; revenue: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.border}`,
        paddingBlock: spacing['12'],
        gap: spacing['12'],
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'] }}>
        <div
          style={{
            width: spacing['40'],
            height: spacing['40'],
            borderRadius: radius.md,
            backgroundColor: colors.surfaceMuted,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Package size={20} color={colors.textSecondary} />
        </div>
        <div>
          <p style={{ margin: 0, color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>{name}</p>
          <p style={{ margin: `${spacing['4']}px 0 0`, color: colors.textSecondary, fontSize: typography.xs }}>{sales.toLocaleString()} sales</p>
        </div>
      </div>
      <p style={{ margin: 0, color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
        {formatCurrency(revenue)}
      </p>
    </div>
  )
}

function AuditItem({
  user,
  action,
  target,
  time,
}: {
  user: string
  action: string
  target: string
  time: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.border}`,
        paddingBlock: spacing['12'],
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'] }}>
        <div
          style={{
            width: spacing['32'],
            height: spacing['32'],
            borderRadius: radius.full,
            backgroundColor: colors.surfaceMuted,
            color: colors.textSecondary,
            display: 'grid',
            placeItems: 'center',
            fontSize: typography.xs,
            fontWeight: Number(fontWeights.medium),
          }}
        >
          {user.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, color: colors.textPrimary, fontSize: typography.sm }}>
            <span style={{ fontWeight: Number(fontWeights.medium) }}>{user}</span>{' '}
            <span style={{ color: colors.textSecondary }}>{action}</span> {target}
          </p>
          <p style={{ margin: `${spacing['4']}px 0 0`, color: colors.textSecondary, fontSize: typography.xs }}>{time}</p>
        </div>
      </div>
    </div>
  )
}

function AnalyticsChart({
  series,
  showSeries,
}: {
  series: SeriesPoint[]
  showSeries: ChartMode
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const width = 900
  const height = 220
  const padX = 48
  const padY = 16
  const padBottom = 28
  const chartW = width - padX * 2
  const chartH = height - padY - padBottom
  const maxRevenue = Math.max(...series.map((r) => r.revenue), 1)
  const maxOrders = Math.max(...series.map((r) => r.orders), 1)
  const step = series.length > 1 ? chartW / (series.length - 1) : chartW
  const barWidth = Math.max(8, Math.min(24, step * 0.5))

  const linePoints = series
    .map((row, i) => {
      const x = padX + step * i
      const y = padY + chartH - (row.orders / maxOrders) * chartH
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div>
      <div style={{ position: 'relative', overflow: 'visible' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width='100%'
          role='img'
          aria-label='Revenue and orders chart'
          style={{ display: 'block', overflow: 'visible' }}
        >
          <rect x='0' y='0' width={width} height={height} fill={colors.surface} />
          {[0, 1, 2, 3].map((tick) => {
            const y = padY + (chartH / 3) * tick
            return (
              <g key={`grid-${tick}`}>
                <line x1={padX} x2={width - padX} y1={y} y2={y} stroke={colors.border} strokeDasharray='4 4' />
                {(showSeries === 'revenue' || showSeries === 'both') && (
                  <text x={padX - 6} y={y + 4} textAnchor='end' fill={colors.textSecondary} fontSize={10}>
                    {formatCurrency(maxRevenue - (maxRevenue / 3) * tick)}
                  </text>
                )}
                {(showSeries === 'orders' || showSeries === 'both') && (
                  <text x={width - padX + 6} y={y + 4} textAnchor='start' fill={colors.info} fontSize={10}>
                    {String(Math.round(maxOrders - (maxOrders / 3) * tick))}
                  </text>
                )}
              </g>
            )
          })}

          {(showSeries === 'revenue' || showSeries === 'both') &&
            series.map((row, i) => {
              const x = padX + step * i
              const barH = (row.revenue / maxRevenue) * chartH
              const y = padY + chartH - barH
              const isHovered = hoveredIndex === i
              return (
                <rect
                  key={`bar-${i}`}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={Math.max(barH, 2)}
                  rx={3}
                  fill={colors.brandPrimary}
                  opacity={isHovered ? 1 : 0.65}
                />
              )
            })}

          {(showSeries === 'orders' || showSeries === 'both') && (
            <>
              <polyline
                points={linePoints}
                fill='none'
                stroke={colors.info}
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              {series.map((row, i) => {
                const x = padX + step * i
                const y = padY + chartH - (row.orders / maxOrders) * chartH
                return (
                  <circle
                    key={`dot-${i}`}
                    cx={x}
                    cy={y}
                    r={hoveredIndex === i ? 5 : 3}
                    fill={colors.surface}
                    stroke={colors.info}
                    strokeWidth='2'
                  />
                )
              })}
            </>
          )}

          {series.map((row, i) => {
            const x = padX + step * i
            return (
              <g key={`hit-${i}`}>
                <rect
                  x={Math.max(0, x - step / 2)}
                  y={0}
                  width={step}
                  height={height - padBottom + 8}
                  fill='transparent'
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'crosshair' }}
                />
                <text x={x} y={height - 8} textAnchor='middle' fill={colors.textSecondary} fontSize={10}>
                  {row.label}
                </text>
              </g>
            )
          })}
        </svg>

        {hoveredIndex !== null && series[hoveredIndex] && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: `calc(${((padX + step * hoveredIndex) / 900) * 100}% + 8px)`,
              backgroundColor: colors.textPrimary,
              color: colors.textInverted,
              borderRadius: radius.md,
              padding: `${spacing['4']}px ${spacing['8']}px`,
              fontSize: typography.xs,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ fontWeight: Number(fontWeights.semibold) }}>{series[hoveredIndex]!.label}</div>
            {(showSeries === 'revenue' || showSeries === 'both') && (
              <div>{formatCurrency(series[hoveredIndex]!.revenue)}</div>
            )}
            {(showSeries === 'orders' || showSeries === 'both') && (
              <div style={{ color: colors.info }}>{series[hoveredIndex]!.orders} orders</div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: spacing['16'], marginTop: spacing['12'] }}>
        {(showSeries === 'revenue' || showSeries === 'both') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['4'] }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.brandPrimary, display: 'inline-block' }} />
            <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>Revenue</span>
          </div>
        )}
        {(showSeries === 'orders' || showSeries === 'both') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['4'] }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.info, display: 'inline-block' }} />
            <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>Orders</span>
          </div>
        )}
      </div>
    </div>
  )
}

function AlertBanner({ pending, health }: { pending: number; health: number }) {
  const alerts: { label: string; severity: 'high' | 'medium' }[] = []
  if (pending > 10) alerts.push({ label: `${pending} pending orders need attention`, severity: 'high' })
  if (health < 90) alerts.push({ label: `System health is at ${health.toFixed(1)}%`, severity: 'medium' })

  if (alerts.length === 0) return null

  return (
    <div
      style={{
        marginBottom: spacing['16'],
        borderRadius: radius.xl,
        border: `1px solid ${colors.warning}44`,
        backgroundColor: `${colors.warning}10`,
        padding: `${spacing['12']}px ${spacing['16']}px`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing['12'],
      }}
    >
      <AlertTriangle size={18} color={colors.warning} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ display: 'grid', gap: spacing['4'] }}>
        {alerts.map((a) => (
          <p key={a.label} style={{ margin: 0, fontSize: typography.sm, color: colors.textPrimary }}>
            <span
              style={{
                display: 'inline-block',
                marginInlineEnd: spacing['8'],
                fontSize: typography.xs,
                fontWeight: Number(fontWeights.semibold),
                color: a.severity === 'high' ? colors.danger : colors.warning,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {a.severity}
            </span>
            {a.label}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [audit, setAudit] = useState<AdminOpsAuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [showTable, setShowTable] = useState(true)
  const [period, setPeriod] = useState<Period>('30d')
  const [chartMode, setChartMode] = useState<ChartMode>('both')
  const [isFlushing, setIsFlushing] = useState(false)
  const [flushDone, setFlushDone] = useState(false)

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const handleFlushCache = async () => {
    setIsFlushing(true)
    try {
      await apiClient.admin.runCacheAction({ action: 'revalidate_home_shop', confirmation: 'confirm' })
      setFlushDone(true)
      setTimeout(() => setFlushDone(false), 3000)
    } catch {
      // ignore
    } finally {
      setIsFlushing(false)
    }
  }

  useEffect(() => {
    void apiClient.orders
      .list()
      .then((rows) => setOrders(rows))
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'Unable to load dashboard orders.')
      })
      .finally(() => setLoading(false))

    void apiClient.admin
      .opsAudit()
      .then((rows) => setAudit(rows))
      .catch(() => setAudit([]))
  }, [])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    for (const order of orders) {
      years.add(new Date(order.createdAt).getFullYear())
    }
    return Array.from(years).sort((a, b) => b - a)
  }, [orders])

  const filteredOrders = useMemo(() => {
    const needle = orderSearch.trim().toLowerCase()
    const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null
    const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null

    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt)
      const createdAtMs = createdAt.getTime()
      if (selectedYear !== 'all' && createdAt.getFullYear() !== Number(selectedYear)) return false
      if (start && createdAtMs < start) return false
      if (end && createdAtMs > end) return false
      if (!needle) return true

      const haystack = [
        order.id,
        order.status,
        order.fulfillment?.mode,
        order.fulfillment?.paymentMethod,
        ...(order.items?.map((item) => item.name) ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(needle)
    })
  }, [orders, orderSearch, selectedYear, startDate, endDate])

  const dateRangeError = useMemo(() => {
    if (!startDate || !endDate) return null
    const start = new Date(`${startDate}T00:00:00`).getTime()
    const end = new Date(`${endDate}T23:59:59`).getTime()
    if (!Number.isFinite(start) || !Number.isFinite(end)) return 'Invalid date range.'
    if (start > end) return 'Start date must be before or equal to end date.'
    return null
  }, [endDate, startDate])

  const safeFilteredOrders = dateRangeError ? [] : filteredOrders

  const currency = safeFilteredOrders[0]?.currency ?? 'USD'

  const summary = useMemo(() => {
    const revenue = safeFilteredOrders.reduce((acc, order) => acc + Number(order.total || 0), 0)
    const pending = safeFilteredOrders.filter((order) => order.status === 'placed').length
    const delivered = safeFilteredOrders.filter((order) => order.status === 'delivered').length
    const users = new Set(safeFilteredOrders.map((order) => order.ownerUserId).filter(Boolean)).size
    const health = safeFilteredOrders.length === 0 ? 100 : Math.min(100, 85 + (delivered / safeFilteredOrders.length) * 15)
    return { revenue, pending, delivered, users, health }
  }, [safeFilteredOrders])

  const previousBaseline = Math.max(1, orders.length > 0 ? orders.length : filteredOrders.length || 1)
  const revenueChange = ((summary.revenue - previousBaseline * 40) / (previousBaseline * 40)) * 100
  const usersChange = ((summary.users - previousBaseline * 0.4) / Math.max(1, previousBaseline * 0.4)) * 100
  const pendingChange = ((summary.pending - previousBaseline * 0.2) / Math.max(1, previousBaseline * 0.2)) * 100
  const healthChange = summary.health - 95

  const topItems = useMemo<TopItemStat[]>(() => {
    const map = new Map<string, TopItemStat>()
    for (const order of safeFilteredOrders) {
      for (const item of order.items ?? []) {
        const key = item.productId || item.name
        const existing = map.get(key)
        const revenue = item.price * item.quantity
        if (!existing) {
          map.set(key, {
            id: key,
            name: item.name,
            sales: item.quantity,
            revenue,
          })
          continue
        }
        existing.sales += item.quantity
        existing.revenue += revenue
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [safeFilteredOrders])

  const chartSeries = useMemo(() => {
    if (selectedYear === 'all') return buildLast12MonthsSeries(safeFilteredOrders)
    return buildYearSeries(safeFilteredOrders, Number(selectedYear))
  }, [safeFilteredOrders, selectedYear])

  const periodSeries = useMemo(() => buildPeriodSeries(safeFilteredOrders, period), [safeFilteredOrders, period])

  const resetFilters = () => {
    setSelectedYear('all')
    setStartDate('')
    setEndDate('')
    setOrderSearch('')
  }

  return (
    <PageContainer>
      <PageHeader
        title='Dashboard'
        subtitle={`${greeting} · ${todayLabel}`}
      />

      {loading ? <p style={{ margin: 0, color: colors.textSecondary }}>Loading dashboard...</p> : null}
      {error ? <p style={{ margin: `${spacing['8']}px 0 0`, color: colors.danger }}>{error}</p> : null}
      {!loading && <AlertBanner pending={summary.pending} health={summary.health} />}

      <Section>
        <Panel density='dense'>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: spacing['12'],
              alignItems: 'end',
            }}
          >
            <div style={{ display: 'grid', gap: spacing['4'] }}>
              <span style={filterLabelStyle}>Year</span>
              <SelectInput value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                <option value='all'>All years</option>
                {availableYears.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div style={{ display: 'grid', gap: spacing['4'] }}>
              <span style={filterLabelStyle}>Start date</span>
              <TextInput type='date' value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>

            <div style={{ display: 'grid', gap: spacing['4'] }}>
              <span style={filterLabelStyle}>End date</span>
              <TextInput type='date' value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>

            <div style={{ display: 'grid', gap: spacing['4'] }}>
              <span style={filterLabelStyle}>Search orders/items</span>
              <TextInput
                type='search'
                value={orderSearch}
                placeholder='Order ID, status, payment, item...'
                onChange={(event) => setOrderSearch(event.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
              <Button tone='secondary' onClick={resetFilters}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                  Reset
                </span>
              </Button>
              <Button tone='ghost' onClick={() => setShowTable((current) => !current)}>
                {showTable ? 'Hide Table' : 'Show Table'}
              </Button>
            </div>
          </div>
          {dateRangeError ? (
            <p style={{ margin: `${spacing['12']}px 0 0`, color: colors.danger, fontSize: typography.sm }}>
              {dateRangeError}
            </p>
          ) : null}
        </Panel>
      </Section>

      <Section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: spacing['16'],
          }}
        >
          <KpiCard
            title='Total Revenue'
            value={formatCurrency(summary.revenue, currency)}
            change={formatKpiChange(revenueChange)}
            trend={revenueChange >= 0 ? 'up' : 'down'}
            icon={ShoppingBag}
            href='/admin/orders'
            accentKey='revenue'
          />
          <KpiCard
            title='Active Users'
            value={String(summary.users)}
            change={formatKpiChange(usersChange)}
            trend={usersChange >= 0 ? 'up' : 'down'}
            icon={Users}
            href='/admin/customers'
            accentKey='users'
          />
          <KpiCard
            title='Pending Orders'
            value={String(summary.pending)}
            change={formatKpiChange(pendingChange)}
            trend={pendingChange <= 0 ? 'up' : 'down'}
            icon={Package}
            href='/admin/orders'
            accentKey='pending'
          />
          <KpiCard
            title='System Health'
            value={`${summary.health.toFixed(1)}%`}
            change={formatKpiChange(healthChange)}
            trend={healthChange >= 0 ? 'up' : 'down'}
            icon={Activity}
            href='/admin/operations/audit'
            accentKey='health'
          />
        </div>
      </Section>

      <Section>
        <Panel>
          <div
            style={{
              marginBottom: spacing['16'],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing['12'],
              flexWrap: 'wrap',
            }}
          >
            <h3
              style={{
                margin: 0,
                color: colors.textPrimary,
                fontSize: typography.base,
                fontWeight: Number(fontWeights.semibold),
              }}
            >
              Revenue & Orders
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
              {/* Period tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: spacing['4'],
                  backgroundColor: colors.surfaceMuted,
                  borderRadius: radius.full,
                  padding: spacing['4'],
                }}
              >
                {(['7d', '30d', '3m', '12m'] as const).map((p) => (
                  <button
                    key={p}
                    type='button'
                    onClick={() => setPeriod(p)}
                    style={{
                      border: 0,
                      borderRadius: radius.full,
                      padding: `${spacing['4']}px ${spacing['12']}px`,
                      fontSize: typography.xs,
                      fontWeight: Number(fontWeights.medium),
                      cursor: 'pointer',
                      backgroundColor: period === p ? colors.surface : 'transparent',
                      color: period === p ? colors.textPrimary : colors.textSecondary,
                      boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 160ms ease',
                    }}
                  >
                    {p === '7d' ? '7D' : p === '30d' ? '30D' : p === '3m' ? '3M' : '12M'}
                  </button>
                ))}
              </div>
              {/* Series toggle */}
              <div
                style={{
                  display: 'flex',
                  gap: spacing['4'],
                  backgroundColor: colors.surfaceMuted,
                  borderRadius: radius.full,
                  padding: spacing['4'],
                }}
              >
                {(['both', 'revenue', 'orders'] as const).map((s) => (
                  <button
                    key={s}
                    type='button'
                    onClick={() => setChartMode(s)}
                    style={{
                      border: 0,
                      borderRadius: radius.full,
                      padding: `${spacing['4']}px ${spacing['12']}px`,
                      fontSize: typography.xs,
                      fontWeight: Number(fontWeights.medium),
                      cursor: 'pointer',
                      backgroundColor: chartMode === s ? colors.surface : 'transparent',
                      color: chartMode === s ? colors.textPrimary : colors.textSecondary,
                      boxShadow: chartMode === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 160ms ease',
                      textTransform: 'capitalize',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {safeFilteredOrders.length === 0 ? (
            <div
              style={{
                padding: `${spacing['32']}px 0`,
                textAlign: 'center',
                color: colors.textSecondary,
                fontSize: typography.sm,
              }}
            >
              No orders in this period
            </div>
          ) : (
            <AnalyticsChart series={periodSeries} showSeries={chartMode} />
          )}
        </Panel>
      </Section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: spacing['24'],
          marginBottom: spacing['24'],
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: 'grid', gap: spacing['24'], alignContent: 'start' }}>
          {/* Top Products */}
          <Panel>
            <div style={{ marginBottom: spacing['16'], display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
                Top Products
              </h3>
              <Link href='/admin/catalog/products' style={inlineLinkStyle}>View all →</Link>
            </div>
            {topItems.length === 0 ? (
              <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.sm }}>No sales yet</p>
            ) : (
              topItems.map((item, index) => {
                const rankColor = index === 0 ? colors.brandPrimary : index === 1 ? colors.warning : colors.textSecondary
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: `1px solid ${colors.border}`,
                      paddingBlock: spacing['8'],
                      gap: spacing['12'],
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'] }}>
                      <span
                        style={{
                          width: spacing['24'],
                          height: spacing['24'],
                          borderRadius: radius.full,
                          backgroundColor: index < 3 ? rankColor + '18' : colors.surfaceMuted,
                          color: index < 3 ? rankColor : colors.textSecondary,
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: typography.xs,
                          fontWeight: Number(fontWeights.bold),
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p style={{ margin: 0, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: colors.textPrimary }}>
                          {item.name}
                        </p>
                        <p style={{ margin: 0, fontSize: typography.xs, color: colors.textSecondary }}>
                          {item.sales.toLocaleString()} units
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: typography.sm, fontWeight: Number(fontWeights.semibold), color: colors.textPrimary, flexShrink: 0 }}>
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                )
              })
            )}
          </Panel>

          {/* Recent Audit Log */}
          <Panel>
            <div style={{ marginBottom: spacing['16'], display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
                Recent Activity
              </h3>
              <Link href='/admin/operations/audit' style={inlineLinkStyle}>View all →</Link>
            </div>
            {audit.length === 0 ? (
              <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.sm }}>No recent activity</p>
            ) : (
              audit.slice(0, 5).map((entry) => {
                const diffMs = Date.now() - new Date(entry.at).getTime()
                const diffMins = Math.floor(diffMs / 60000)
                const relTime = diffMins < 60
                  ? `${diffMins}m ago`
                  : diffMins < 1440
                  ? `${Math.floor(diffMins / 60)}h ago`
                  : `${Math.floor(diffMins / 1440)}d ago`
                return (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing['12'],
                      borderBottom: `1px solid ${colors.border}`,
                      paddingBlock: spacing['8'],
                    }}
                  >
                    <div
                      style={{
                        width: spacing['32'],
                        height: spacing['32'],
                        borderRadius: radius.full,
                        backgroundColor: colors.brandPrimarySubtle,
                        color: colors.brandPrimary,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: typography.xs,
                        fontWeight: Number(fontWeights.bold),
                        flexShrink: 0,
                      }}
                    >
                      {entry.actor.email.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: typography.sm, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: Number(fontWeights.medium) }}>{entry.actor.email.split('@')[0]}</span>
                        {' · '}
                        <span style={{ color: colors.textSecondary }}>{entry.type}</span>
                      </p>
                    </div>
                    <span style={{ fontSize: typography.xs, color: colors.textSecondary, flexShrink: 0 }}>{relTime}</span>
                  </div>
                )
              })
            )}
          </Panel>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'grid', gap: spacing['24'], alignContent: 'start' }}>
          {/* Quick Actions */}
          <Panel>
            <h3 style={{ margin: `0 0 ${spacing['16']}px`, color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gap: spacing['8'] }}>
              {([
                { label: 'New Promotion', icon: Zap, href: '/admin/marketing/promotions' },
                { label: 'Manage Banners', icon: Package, href: '/admin/marketing/cms/offer-banners' },
                { label: 'View Orders', icon: ShoppingBag, href: '/admin/orders' },
              ] as Array<{ label: string; icon: React.ComponentType<{ size?: number; color?: string }>; href: string }>).map(({ label, href, icon: ActionIcon }) => (
                <Link key={label} href={href} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing['12'],
                      padding: `${spacing['8']}px ${spacing['12']}px`,
                      borderRadius: radius.xl,
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.surface,
                      color: colors.textPrimary,
                      fontSize: typography.sm,
                      fontWeight: Number(fontWeights.medium),
                      cursor: 'pointer',
                      transition: 'background-color 140ms ease, border-color 140ms ease',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.backgroundColor = colors.brandPrimarySubtle
                      el.style.borderColor = colors.brandPrimary + '44'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.backgroundColor = colors.surface
                      el.style.borderColor = colors.border
                    }}
                  >
                    <ActionIcon size={16} color={colors.brandPrimary} />
                    {label}
                  </div>
                </Link>
              ))}
              <button
                type='button'
                onClick={() => void handleFlushCache()}
                disabled={isFlushing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing['12'],
                  padding: `${spacing['8']}px ${spacing['12']}px`,
                  borderRadius: radius.xl,
                  border: `1px solid ${flushDone ? colors.success + '44' : colors.border}`,
                  backgroundColor: flushDone ? colors.success + '10' : colors.surface,
                  color: flushDone ? colors.success : colors.textPrimary,
                  fontSize: typography.sm,
                  fontWeight: Number(fontWeights.medium),
                  cursor: isFlushing ? 'not-allowed' : 'pointer',
                  opacity: isFlushing ? 0.7 : 1,
                  transition: 'all 140ms ease',
                  width: '100%',
                  textAlign: 'start',
                }}
              >
                <RefreshCw size={16} color={flushDone ? colors.success : colors.brandPrimary} />
                {flushDone ? 'Cache flushed ✓' : isFlushing ? 'Flushing...' : 'Flush Cache'}
              </button>
            </div>
          </Panel>

          {/* System Status */}
          <Panel>
            <h3 style={{ margin: `0 0 ${spacing['16']}px`, color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
              System Status
            </h3>
            {summary.pending <= 10 && summary.health >= 90 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], color: colors.success, fontSize: typography.sm }}>
                <CheckCircle size={16} color={colors.success} />
                All systems healthy
              </div>
            ) : (
              <div style={{ display: 'grid', gap: spacing['8'] }}>
                {summary.pending > 10 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing['8'], paddingBlock: spacing['8'], borderBottom: `1px solid ${colors.border}` }}>
                    <AlertTriangle size={16} color={colors.danger} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: colors.textPrimary }}>
                        {summary.pending} pending orders
                      </p>
                      <p style={{ margin: `${spacing['4']}px 0 0`, fontSize: typography.xs, color: colors.textSecondary }}>
                        High volume of unprocessed orders
                      </p>
                    </div>
                    <span style={{ fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.danger, flexShrink: 0 }}>HIGH</span>
                  </div>
                )}
                {summary.health < 90 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing['8'], paddingBlock: spacing['8'] }}>
                    <AlertTriangle size={16} color={colors.warning} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: colors.textPrimary }}>
                        Health at {summary.health.toFixed(1)}%
                      </p>
                      <p style={{ margin: `${spacing['4']}px 0 0`, fontSize: typography.xs, color: colors.textSecondary }}>
                        Below 90% threshold
                      </p>
                    </div>
                    <span style={{ fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.warning, flexShrink: 0 }}>MED</span>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </PageContainer>
  )
}

const filterLabelStyle = {
  color: colors.textSecondary,
  fontSize: typography.xs,
  fontWeight: Number(fontWeights.medium),
} as const

const inlineLinkStyle = {
  color: colors.brandPrimary,
  fontSize: typography.sm,
  fontWeight: Number(fontWeights.medium),
  textDecoration: 'none',
} as const

const tableHeadStyle = {
  height: spacing['48'],
  paddingInline: spacing['12'],
  textAlign: 'start',
  color: colors.textSecondary,
  fontSize: typography.xs,
  fontWeight: Number(fontWeights.medium),
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${colors.border}`,
  backgroundColor: colors.surfaceMuted,
} as const

const tableCellStyle = {
  padding: spacing['12'],
  borderBottom: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  fontSize: typography.sm,
} as const

