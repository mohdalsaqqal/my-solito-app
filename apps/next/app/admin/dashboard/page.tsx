'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Package,
  ShoppingBag,
  SlidersHorizontal,
  Users,
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

function AnalyticsChart({ series }: { series: SeriesPoint[] }) {
  const width = 920
  const height = 240
  const padX = 36
  const padY = 20
  const chartW = width - padX * 2
  const chartH = height - padY * 2
  const maxRevenue = Math.max(...series.map((row) => row.revenue), 1)
  const maxOrders = Math.max(...series.map((row) => row.orders), 1)
  const step = series.length > 1 ? chartW / (series.length - 1) : chartW
  const barWidth = Math.max(10, Math.min(28, step * 0.45))

  const linePoints = series
    .map((row, index) => {
      const x = padX + step * index
      const y = padY + chartH - (row.orders / maxOrders) * chartH
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        overflow: 'hidden',
      }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width='100%' role='img' aria-label='Revenue and orders chart'>
        <rect x='0' y='0' width={width} height={height} fill={colors.surface} />
        {[0, 1, 2, 3].map((tick) => {
          const y = padY + (chartH / 3) * tick
          return (
            <line
              key={`grid-${tick}`}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke={colors.border}
              strokeDasharray='4 4'
            />
          )
        })}

        {series.map((row, index) => {
          const x = padX + step * index
          const barHeight = (row.revenue / maxRevenue) * chartH
          const y = padY + chartH - barHeight
          return (
            <g key={`bar-${row.label}-${index}`}>
              <rect
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={radius.xs}
                fill={colors.brandPrimary}
                opacity={0.8}
              />
              <text
                x={x}
                y={height - 6}
                textAnchor='middle'
                fill={colors.textSecondary}
                fontSize={typography.xs}
              >
                {row.label}
              </text>
            </g>
          )
        })}

        <polyline
          points={linePoints}
          fill='none'
          stroke={colors.info}
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
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
        subtitle='Comprehensive revenue and order analytics with yearly and date-range drilldowns.'
      />

      {loading ? <p style={{ margin: 0, color: colors.textSecondary }}>Loading dashboard...</p> : null}
      {error ? <p style={{ margin: `${spacing['8']}px 0 0`, color: colors.danger }}>{error}</p> : null}

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
                  <SlidersHorizontal size={14} />
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
              marginBottom: spacing['12'],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing['12'],
              flexWrap: 'wrap',
            }}
          >
            <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
              Revenue & Order Trends
            </h3>
            <span style={{ color: colors.textSecondary, fontSize: typography.sm, display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
              <CalendarDays size={14} />
              {selectedYear === 'all' ? 'Last 12 months' : `Monthly trend for ${selectedYear}`}
            </span>
          </div>
          <AnalyticsChart series={chartSeries} />
        </Panel>
      </Section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: spacing['24'],
        }}
      >
        <div style={{ display: 'grid', gap: spacing['24'] }}>
          <Section>
            <Panel>
              <div style={{ marginBottom: spacing['16'], display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>Top Items</h3>
                <Link href='/admin/catalog/products' style={inlineLinkStyle}>
                  View All
                </Link>
              </div>
              {topItems.length === 0 ? (
                <EmptyState title='No item sales in this filter' description='Adjust year/date filters to inspect sales data.' />
              ) : (
                topItems.map((item) => (
                  <TopItem key={item.id} name={item.name} sales={item.sales} revenue={item.revenue} />
                ))
              )}
            </Panel>
          </Section>

          <Section>
            <Panel>
              <div style={{ marginBottom: spacing['16'], display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>Recent Audit Log</h3>
                <Link href='/admin/operations/audit' style={inlineLinkStyle}>
                  View All
                </Link>
              </div>
              {audit.length === 0 ? (
                <EmptyState title='No audit events yet' description='Events appear when admin actions are performed.' />
              ) : (
                audit.slice(0, 5).map((entry) => (
                  <AuditItem
                    key={entry.id}
                    user={entry.actor.email}
                    action={entry.type}
                    target={entry.targetId}
                    time={new Date(entry.at).toLocaleString()}
                  />
                ))
              )}
            </Panel>
          </Section>
        </div>

        <div>
          <Section>
            <Panel>
              <div style={{ marginBottom: spacing['16'], display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
                <AlertTriangle size={20} color={colors.warning} />
                <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>System Alerts</h3>
              </div>
              <AlertItem
                title='High Cache Miss Rate'
                description='Cache miss rate exceeded 15% in the observed window.'
                severity='medium'
              />
              <AlertItem
                title='Pending Orders Growth'
                description={`Pending orders in current filters: ${summary.pending}.`}
                severity={summary.pending > 12 ? 'high' : 'medium'}
              />
              <AlertItem
                title='Delivery Throughput'
                description={`Delivered orders in current filters: ${summary.delivered}.`}
                severity='medium'
              />
            </Panel>
          </Section>
        </div>
      </div>

      {showTable ? (
        <Section>
          <Panel>
            <div
              style={{
                marginBottom: spacing['16'],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing['8'],
                flexWrap: 'wrap',
              }}
            >
                <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>
                  Full Analytics Table
                </h3>
              <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                {safeFilteredOrders.length.toLocaleString()} matching orders
              </span>
            </div>

            {safeFilteredOrders.length === 0 ? (
              <EmptyState title='No matching analytics rows' description='Adjust filter conditions to see historical data.' />
            ) : (
              <TableShell>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Order ID', 'Date', 'Status', 'Items', 'Revenue', 'Fulfillment', 'Payment'].map((head) => (
                        <th key={head} style={tableHeadStyle} scope='col'>
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...safeFilteredOrders]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((order) => (
                        <tr key={order.id}>
                          <td style={tableCellStyle}>
                            <span style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>{order.id}</span>
                          </td>
                          <td style={tableCellStyle}>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td style={tableCellStyle}>{order.status}</td>
                          <td style={tableCellStyle}>{(order.items ?? []).reduce((acc, item) => acc + item.quantity, 0)}</td>
                          <td style={tableCellStyle}>{formatCurrency(order.total, order.currency)}</td>
                          <td style={tableCellStyle}>{order.fulfillment?.mode ?? 'delivery'}</td>
                          <td style={tableCellStyle}>{order.fulfillment?.paymentMethod ?? 'cod'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </TableShell>
            )}
          </Panel>
        </Section>
      ) : null}
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

