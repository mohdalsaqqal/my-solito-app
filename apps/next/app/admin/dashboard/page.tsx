'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { apiClient } from '../../apiClient'
import { AdminOpsAuditEntry, OrderSummary } from '@real/app/lib/types'
import { colors, fontWeights, radius, spacing, typography } from '@real/tokens'
import { EmptyState, PageContainer, PageHeader, Panel, Section } from '../_components/AdminPagePrimitives'

type Trend = 'up' | 'down'

function KpiCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  href,
}: {
  title: string
  value: string
  change: string
  trend: Trend
  icon: React.ComponentType<{ size?: number; color?: string }>
  href: string
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <Panel density='dense'>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 152 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: colors.textSecondary }}>
                {title}
              </span>
              <div
                style={{
                  marginTop: spacing['8'],
                  fontSize: typography['3xl'],
                  lineHeight: 1.1,
                  fontWeight: Number(fontWeights.bold),
                  color: colors.textPrimary,
                }}
              >
                {value}
              </div>
            </div>
            <div
              style={{
                borderRadius: radius.full,
                backgroundColor: colors.surfaceMuted,
                width: spacing['32'],
                height: spacing['32'],
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon size={20} color={colors.textSecondary} />
            </div>
          </div>

          <div style={{ marginTop: spacing['16'], display: 'flex', alignItems: 'center', fontSize: typography.xs }}>
            {trend === 'up' ? (
              <ArrowUpRight size={16} color={colors.success} />
            ) : (
              <ArrowDownRight size={16} color={colors.danger} />
            )}
            <span
              style={{
                marginInlineStart: spacing['4'],
                fontWeight: Number(fontWeights.medium),
                color: trend === 'up' ? colors.success : colors.danger,
              }}
            >
              {change}
            </span>
            <span style={{ marginInlineStart: spacing['4'], color: colors.textSecondary }}>from last month</span>
          </div>
        </div>
      </Panel>
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
        <button
          type='button'
          style={{
            marginTop: spacing['4'],
            border: 0,
            backgroundColor: 'transparent',
            color: colors.brandPrimary,
            fontSize: typography.xs,
            fontWeight: Number(fontWeights.medium),
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Resolve
        </button>
      </div>
    </div>
  )
}

function TopItem({ name, sales, revenue }: { name: string; sales: string; revenue: string }) {
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
          <p style={{ margin: `${spacing['4']}px 0 0`, color: colors.textSecondary, fontSize: typography.xs }}>{sales} sales</p>
        </div>
      </div>
      <p style={{ margin: 0, color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>{revenue}</p>
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

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [audit, setAudit] = useState<AdminOpsAuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void apiClient.orders
      .list()
      .then((ordersRows) => {
        setOrders(ordersRows)
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'Unable to load dashboard orders.')
      })
      .finally(() => setLoading(false))

    void apiClient.admin
      .opsAudit()
      .then((auditRows) => {
        setAudit(auditRows)
      })
      .catch(() => {
        // Not all admin roles can access operations audit.
        setAudit([])
      })
  }, [])

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, item) => acc + Number(item.total || 0), 0)
  }, [orders])

  return (
    <PageContainer>
      <PageHeader title='Dashboard' />

      {loading ? <p style={{ margin: 0, color: colors.textSecondary }}>Loading dashboard...</p> : null}
      {error ? <p style={{ margin: `${spacing['8']}px 0 0`, color: colors.danger }}>{error}</p> : null}

      <Section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: spacing['16'],
          }}
        >
          <KpiCard title='Total Revenue' value={`$${Math.round(totalRevenue).toLocaleString()}`} change='+20.1%' trend='up' icon={ShoppingBag} href='/admin/orders' />
          <KpiCard title='Active Users' value={String(Math.max(orders.length, 1) * 5)} change='+18.1%' trend='up' icon={Users} href='/admin/customers' />
          <KpiCard title='Pending Orders' value={String(orders.filter((o) => o.status === 'placed').length)} change='-1.9%' trend='down' icon={Package} href='/admin/orders' />
          <KpiCard title='System Health' value='98.9%' change='+0.1%' trend='up' icon={Activity} href='/admin/operations/audit' />
        </div>
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
                <Link href='/admin/catalog/products' style={{ color: colors.brandPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), textDecoration: 'none' }}>
                  View All
                </Link>
              </div>
              <TopItem name='Hydrating Serum' sales='1,234' revenue='$45,231' />
              <TopItem name='Matte Lipstick' sales='890' revenue='$21,450' />
              <TopItem name='Night Cream' sales='650' revenue='$32,100' />
              <TopItem name='Vitamin C Booster' sales='430' revenue='$18,900' />
            </Panel>
          </Section>

          <Section>
            <Panel>
              <div style={{ marginBottom: spacing['16'], display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.lg, fontWeight: Number(fontWeights.medium) }}>Recent Audit Log</h3>
                <Link href='/admin/operations/audit' style={{ color: colors.brandPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), textDecoration: 'none' }}>
                  View All
                </Link>
              </div>
              {audit.length === 0 ? (
                <EmptyState title='No audit events yet' description='Events appear when admin actions are performed.' />
              ) : (
                audit.slice(0, 4).map((entry) => (
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
              <AlertItem title='High Cache Miss Rate' description='Cache miss rate exceeded 15% in the last hour.' severity='medium' />
              <AlertItem title='Inventory Low' description="Product 'Night Cream' is below safety stock." severity='high' />
              <AlertItem title='API Latency' description='Average response time > 500ms.' severity='medium' />
            </Panel>
          </Section>
        </div>
      </div>
    </PageContainer>
  )
}
