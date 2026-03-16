# Admin Dashboard Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the admin dashboard to an "Executive Glance" layout — visually rich, store-owner-focused, scannable in 5 seconds.

**Architecture:** Three files change: `dashboard/page.tsx` gets a full UI rewrite (same data hooks, new components), `AdminShell.tsx` gets sidebar + header polish, `AdminPagePrimitives.tsx` gets no changes (existing primitives are sufficient). All logic stays client-side. No new API routes needed.

**Tech Stack:** Next.js 14 App Router, React, inline styles (no Tailwind in admin), Lucide icons, `@real/tokens` design tokens, existing `apiClient` from `@real/app/lib/api-client`.

---

## Key conventions to follow

- **Inline styles only** — the admin uses `style={{}}` props, not Tailwind/CSS classes
- **Token imports** — always import from `@real/tokens`: `colors`, `spacing`, `typography`, `fontWeights`, `radius`, `elevation`
- **No new files** — all changes go in the 2 files listed below
- **apiClient** is imported from `../../apiClient` (relative, from dashboard page)
- **Colors to use:**
  - Crimson accent: `colors.brandPrimary` = `hsl(358 74% 50%)`
  - Blue accent: `colors.info` = `hsl(214 90% 42%)`
  - Amber accent: `colors.warning` = `hsl(42 86% 48%)`
  - Green accent: `colors.success` = `hsl(153 72% 34%)`
  - Subtle crimson bg: `colors.brandPrimarySubtle` = `hsl(356 62% 96%)`

---

## Task 1: KPI Cards — compact redesign with accent borders

**Files:**
- Modify: `apps/next/app/admin/dashboard/page.tsx` — replace `KpiCard` component only

**Step 1: Replace the `KpiCard` component** (lines 111–182 in current file)

Find this block:
```tsx
function KpiCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  href,
}: {
```

Replace the entire `KpiCard` function with:

```tsx
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
          boxShadow: elevation.xs,
          borderInlineStart: `3px solid ${accent}`,
          transition: 'box-shadow 160ms ease, transform 160ms ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = elevation.md
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = elevation.xs
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
```

**Step 2: Update the 4 KpiCard usages** in the JSX (around line 594–626) — add `accentKey` prop to each:

```tsx
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
```

**Step 3: Check `elevation` is imported** — add `elevation` to the token import at the top if not already present:
```tsx
import { colors, fontWeights, radius, spacing, typography, elevation } from '@real/tokens'
```

**Step 4: Verify in browser** — visit `http://localhost:3000/en/admin/dashboard`. KPI cards should be compact (~120px), have colored left borders, icon circles tinted to match, and lift on hover.

**Step 5: Commit**
```bash
git add apps/next/app/admin/dashboard/page.tsx
git commit -m "feat(admin/dashboard): compact KPI cards with accent borders and hover lift"
```

---

## Task 2: Chart panel — period tabs + dual Y-axis + legend

**Files:**
- Modify: `apps/next/app/admin/dashboard/page.tsx` — replace `AnalyticsChart` + chart controls

**Step 1: Add period state** near the top of `AdminDashboardPage` (after existing state declarations):

```tsx
type Period = '7d' | '30d' | '3m' | '12m' | 'custom'
type ChartSeries = 'revenue' | 'orders' | 'both'

const [period, setPeriod] = useState<Period>('30d')
const [chartSeries, setChartSeries] = useState<ChartSeries>('both')
```

Remove the existing `selectedYear`, `startDate`, `endDate`, `orderSearch`, `showTable` states — they move off the dashboard. Keep only the states needed for KPI computation.

**Step 2: Add a period-based series builder** — add this function above `AdminDashboardPage`:

```tsx
function buildPeriodSeries(orders: OrderSummary[], period: Exclude<Period, 'custom'>): SeriesPoint[] {
  const now = new Date()
  let points: SeriesPoint[] = []

  if (period === '7d') {
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
    // Group into 6 buckets of 5 days
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

  // 12m — existing logic
  return buildLast12MonthsSeries(orders)
}
```

**Step 3: Replace `AnalyticsChart` component** — remove the existing one and replace with:

```tsx
function AnalyticsChart({
  series,
  showSeries,
}: {
  series: SeriesPoint[]
  showSeries: ChartSeries
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
            const revLabel = formatCurrency(maxRevenue - (maxRevenue / 3) * tick)
            const ordLabel = String(Math.round(maxOrders - (maxOrders / 3) * tick))
            return (
              <g key={`grid-${tick}`}>
                <line x1={padX} x2={width - padX} y1={y} y2={y} stroke={colors.border} strokeDasharray='4 4' />
                {(showSeries === 'revenue' || showSeries === 'both') && (
                  <text x={padX - 6} y={y + 4} textAnchor='end' fill={colors.textSecondary} fontSize={10}>
                    {formatCurrency(maxRevenue - (maxRevenue / 3) * tick, 'USD').replace('$', '$')}
                  </text>
                )}
                {(showSeries === 'orders' || showSeries === 'both') && (
                  <text x={width - padX + 6} y={y + 4} textAnchor='start' fill={colors.info} fontSize={10}>
                    {ordLabel}
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
                <g key={`bar-${i}`}>
                  <rect
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={Math.max(barH, 2)}
                    rx={3}
                    fill={colors.brandPrimary}
                    opacity={isHovered ? 1 : 0.65}
                    style={{ transition: 'opacity 120ms ease' }}
                  />
                </g>
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
                const isHovered = hoveredIndex === i
                return (
                  <circle
                    key={`dot-${i}`}
                    cx={x}
                    cy={y}
                    r={isHovered ? 5 : 3}
                    fill={colors.surface}
                    stroke={colors.info}
                    strokeWidth='2'
                    style={{ transition: 'r 120ms ease' }}
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
                  x={x - step / 2}
                  y={0}
                  width={step}
                  height={height - padBottom + 8}
                  fill='transparent'
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'crosshair' }}
                />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor='middle'
                  fill={colors.textSecondary}
                  fontSize={10}
                >
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
              padding: `${spacing['6']}px ${spacing['10']}px`,
              fontSize: typography.xs,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: elevation.md,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['6'] }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.brandPrimary, display: 'inline-block' }} />
            <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>Revenue</span>
          </div>
        )}
        {(showSeries === 'orders' || showSeries === 'both') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['6'] }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.info, display: 'inline-block' }} />
            <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>Orders</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 4: Replace chart panel JSX** — find the `<Section>` that wraps the chart and replace it:

```tsx
<Section>
  <Panel>
    <div style={{ marginBottom: spacing['16'], display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['12'], flexWrap: 'wrap' }}>
      <h3 style={{ margin: 0, color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
        Revenue & Orders
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'], flexWrap: 'wrap' }}>
        {/* Period tabs */}
        <div style={{ display: 'flex', gap: spacing['4'], backgroundColor: colors.surfaceMuted, borderRadius: radius.full, padding: spacing['4'] }}>
          {(['7d', '30d', '3m', '12m'] as const).map((p) => (
            <button
              key={p}
              type='button'
              onClick={() => setPeriod(p)}
              style={{
                border: 0,
                borderRadius: radius.full,
                padding: `${spacing['4']}px ${spacing['10']}px`,
                fontSize: typography.xs,
                fontWeight: Number(fontWeights.medium),
                cursor: 'pointer',
                backgroundColor: period === p ? colors.surface : 'transparent',
                color: period === p ? colors.textPrimary : colors.textSecondary,
                boxShadow: period === p ? elevation.xs : 'none',
                transition: 'all 160ms ease',
              }}
            >
              {p === '7d' ? '7D' : p === '30d' ? '30D' : p === '3m' ? '3M' : '12M'}
            </button>
          ))}
        </div>
        {/* Series toggle */}
        <div style={{ display: 'flex', gap: spacing['4'], backgroundColor: colors.surfaceMuted, borderRadius: radius.full, padding: spacing['4'] }}>
          {(['both', 'revenue', 'orders'] as const).map((s) => (
            <button
              key={s}
              type='button'
              onClick={() => setChartSeries(s)}
              style={{
                border: 0,
                borderRadius: radius.full,
                padding: `${spacing['4']}px ${spacing['10']}px`,
                fontSize: typography.xs,
                fontWeight: Number(fontWeights.medium),
                cursor: 'pointer',
                backgroundColor: chartSeries === s ? colors.surface : 'transparent',
                color: chartSeries === s ? colors.textPrimary : colors.textSecondary,
                boxShadow: chartSeries === s ? elevation.xs : 'none',
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
      <div style={{ padding: `${spacing['32']}px 0`, textAlign: 'center', color: colors.textSecondary, fontSize: typography.sm }}>
        No orders in this period
      </div>
    ) : (
      <AnalyticsChart series={periodSeries} showSeries={chartSeries} />
    )}
  </Panel>
</Section>
```

**Step 5: Compute `periodSeries` memo** — add inside `AdminDashboardPage`, after existing memos:

```tsx
const periodSeries = useMemo(() => {
  if (period === 'custom') return buildLast12MonthsSeries(safeFilteredOrders)
  return buildPeriodSeries(safeFilteredOrders, period)
}, [safeFilteredOrders, period])
```

**Step 6: Add missing spacing token** — check `packages/tokens/spacing.ts` for `spacing['6']` and `spacing['10']`. If they don't exist, use `spacing['8']` and `spacing['12']` as fallbacks.

**Step 7: Commit**
```bash
git add apps/next/app/admin/dashboard/page.tsx
git commit -m "feat(admin/dashboard): chart panel with period tabs, series toggle, tooltip, legend"
```

---

## Task 3: Page header with greeting + alert banner

**Files:**
- Modify: `apps/next/app/admin/dashboard/page.tsx`

**Step 1: Add greeting to `PageHeader`** — replace the current `<PageHeader>` JSX:

```tsx
const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
```

Add these two lines inside the component function, before the return. Then replace:

```tsx
<PageHeader
  title='Dashboard'
  subtitle='Comprehensive revenue and order analytics with yearly and date-range drilldowns.'
/>
```

With:

```tsx
<PageHeader
  title='Dashboard'
  subtitle={`${greeting}, ${userName.split(' ')[0] ?? 'there'} · ${todayLabel}`}
/>
```

Note: `userName` already exists in state — read it from the parent. Since this is inside `AdminDashboardPage` (not `AdminShell`), pass `userName` down or just compute a local greeting without the name. Simplest approach: just use the greeting + date without the name:

```tsx
<PageHeader
  title='Dashboard'
  subtitle={`${greeting} · ${todayLabel}`}
/>
```

**Step 2: Add conditional alert banner** — add this component above `AdminDashboardPage`:

```tsx
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
```

**Step 3: Add `<AlertBanner>` to JSX** — insert after `<PageHeader>` and before the KPI section:

```tsx
{!loading && <AlertBanner pending={summary.pending} health={summary.health} />}
```

**Step 4: Commit**
```bash
git add apps/next/app/admin/dashboard/page.tsx
git commit -m "feat(admin/dashboard): greeting header and conditional alert banner"
```

---

## Task 4: Bottom grid — Top Products, Quick Actions, System Alerts, Audit Log

**Files:**
- Modify: `apps/next/app/admin/dashboard/page.tsx`

**Step 1: Add `Zap` and `RefreshCw` to Lucide imports** at the top of the file:

```tsx
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
```

Remove `CalendarDays`, `SlidersHorizontal` — no longer needed.

**Step 2: Add flush cache state** inside `AdminDashboardPage`:

```tsx
const [isFlushing, setIsFlushing] = useState(false)
const [flushDone, setFlushDone] = useState(false)

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
```

**Step 3: Replace the bottom grid JSX** — find the `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', ... }}>` block and replace everything inside it (the old Top Items + Audit + Alerts columns) with:

```tsx
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
                paddingBlock: spacing['10'],
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
          const relTime = (() => {
            const diff = Date.now() - new Date(entry.at).getTime()
            const mins = Math.floor(diff / 60000)
            if (mins < 60) return `${mins}m ago`
            const hrs = Math.floor(mins / 60)
            if (hrs < 24) return `${hrs}h ago`
            return `${Math.floor(hrs / 24)}d ago`
          })()
          return (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing['12'],
                borderBottom: `1px solid ${colors.border}`,
                paddingBlock: spacing['10'],
              }}
            >
              <div
                style={{
                  width: spacing['28'],
                  height: spacing['28'],
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
        {[
          { label: 'New Promotion', icon: Zap, href: '/admin/marketing/promotions' },
          { label: 'Manage Banners', icon: Package, href: '/admin/marketing/cms/offer-banners' },
          { label: 'View Orders', icon: ShoppingBag, href: '/admin/orders' },
        ].map(({ label, icon: Icon, href }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing['12'],
                padding: `${spacing['10']}px ${spacing['14']}px`,
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
              <Icon size={16} color={colors.brandPrimary} />
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
            padding: `${spacing['10']}px ${spacing['14']}px`,
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
          <RefreshCw size={16} color={flushDone ? colors.success : colors.brandPrimary} style={{ animation: isFlushing ? 'spin 1s linear infinite' : 'none' }} />
          {flushDone ? 'Cache flushed ✓' : isFlushing ? 'Flushing...' : 'Flush Cache'}
        </button>
      </div>
    </Panel>

    {/* System Alerts */}
    <Panel>
      <h3 style={{ margin: `0 0 ${spacing['16']}px`, color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
        System Status
      </h3>
      {summary.pending <= 10 && summary.health >= 90 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing['10'], color: colors.success, fontSize: typography.sm }}>
          <CheckCircle size={16} color={colors.success} />
          All systems healthy
        </div>
      ) : (
        <div style={{ display: 'grid', gap: spacing['8'] }}>
          {summary.pending > 10 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing['10'], paddingBlock: spacing['8'], borderBottom: `1px solid ${colors.border}` }}>
              <AlertTriangle size={16} color={colors.danger} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: colors.textPrimary }}>
                  {summary.pending} pending orders
                </p>
                <p style={{ margin: `${spacing['2']}px 0 0`, fontSize: typography.xs, color: colors.textSecondary }}>
                  High volume of unprocessed orders
                </p>
              </div>
              <span style={{ marginInlineStart: 'auto', fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.danger, flexShrink: 0 }}>HIGH</span>
            </div>
          )}
          {summary.health < 90 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing['10'], paddingBlock: spacing['8'] }}>
              <AlertTriangle size={16} color={colors.warning} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: colors.textPrimary }}>
                  Health at {summary.health.toFixed(1)}%
                </p>
                <p style={{ margin: `${spacing['2']}px 0 0`, fontSize: typography.xs, color: colors.textSecondary }}>
                  Below 90% threshold
                </p>
              </div>
              <span style={{ marginInlineStart: 'auto', fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.warning, flexShrink: 0 }}>MED</span>
            </div>
          )}
        </div>
      )}
    </Panel>
  </div>
</div>
```

**Step 4: Add `spacing['2']`, `spacing['6']`, `spacing['10']`, `spacing['14']`, `spacing['20']`, `spacing['24']`, `spacing['28']` guard** — check `packages/tokens/spacing.ts`. If any of these don't exist use the nearest available (e.g. `spacing['8']` for `spacing['6']`).

**Step 5: Remove old sections** — delete the old `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' ...}>` block and the old `{showTable ? ... : null}` table block.

**Step 6: Remove unused state** — remove `showTable`, `selectedYear`, `startDate`, `endDate`, `orderSearch` and their related `useMemo`s that are no longer needed. Keep `summary`, `topItems`, `safeFilteredOrders` (for chart). The `safeFilteredOrders` can just be `orders` directly since we removed filtering.

**Step 7: Add spin keyframe CSS** — add to `apps/next/app/globals.css` or inline at the bottom of the component:
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

**Step 8: Commit**
```bash
git add apps/next/app/admin/dashboard/page.tsx apps/next/app/globals.css
git commit -m "feat(admin/dashboard): bottom grid — top products, quick actions, system alerts, audit log"
```

---

## Task 5: AdminShell — sidebar + header polish

**Files:**
- Modify: `apps/next/app/admin/_components/AdminShell.tsx`

**Step 1: Update logo** — find the logo area in the sidebar (around line 406–450) and replace the `"R"` box + `"Real Cosmetics"` text:

```tsx
{/* Replace existing logo block with: */}
<div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
  <div
    style={{
      width: spacing['28'],
      height: spacing['28'],
      borderRadius: radius.md,
      backgroundColor: colors.brandPrimary,
      color: colors.textInverted,
      display: 'grid',
      placeItems: 'center',
      fontSize: typography.xs,
      fontWeight: Number(fontWeights.bold),
      flexShrink: 0,
    }}
  >
    R
  </div>
  <span style={{ whiteSpace: 'nowrap' }}>
    <span style={{ fontSize: typography.base, fontWeight: Number(fontWeights.bold), color: colors.textPrimary }}>REAL</span>
    <span style={{ fontSize: typography.base, fontWeight: Number(fontWeights.light), color: colors.textSecondary }}> Cosmetics</span>
  </span>
</div>
```

Do the same for the collapsed-only logo (the standalone `"R"` box) — change its `backgroundColor` from `colors.textPrimary` to `colors.brandPrimary`.

**Step 2: Add role badge to user area** — in the user section at the bottom of the sidebar (around line 558–603), after the `{userName}` span, add:

```tsx
<span
  style={{
    display: 'inline-block',
    marginTop: spacing['2'],
    fontSize: typography.xs,
    fontWeight: Number(fontWeights.semibold),
    color: colors.brandPrimary,
    backgroundColor: colors.brandPrimarySubtle,
    borderRadius: radius.full,
    padding: `${spacing['2']}px ${spacing['6']}px`,
    textTransform: 'capitalize',
    letterSpacing: '0.03em',
  }}
>
  {role}
</span>
```

Place it inside the `<div style={{ display: 'grid', minWidth: 0 }}>` container, after the `{userName}` `<span>`.

**Step 3: Add dividers between nav groups** — in the `<nav>` that renders `visibleItems`, wrap the nav into grouped sections separated by a thin `<hr>`:

The simplest approach — add a `dividerAfter` flag to certain nav groups. Instead, just add a small spacer after `dashboard`, `customers`:

Find the nav render (around line 480–495) and replace it with:

```tsx
<nav style={{ display: 'grid', gap: spacing['2'] }}>
  {visibleItems.map((item, index) => (
    <div key={item.id}>
      <SidebarItem
        item={item}
        isSidebarOpen={isCompactViewport ? true : isSidebarOpen}
        pathname={pathname}
        openGroups={openGroups}
        setOpenGroups={(next) => {
          setOpenGroups(next)
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(SIDEBAR_GROUP_KEY, JSON.stringify(next))
          }
        }}
      />
      {(item.id === 'dashboard' || item.id === 'customers') && isSidebarOpen ? (
        <div style={{ height: 1, backgroundColor: colors.border, marginBlock: spacing['8'], marginInline: spacing['4'] }} />
      ) : null}
    </div>
  ))}
</nav>
```

**Step 4: Update header search bar** — find the search `<input>` in the header (around line 715–728) and update its style:

```tsx
style={{
  width: '100%',
  height: spacing['36'],
  borderRadius: radius.full,   // pill shape
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surfaceMuted,
  color: colors.textPrimary,
  fontSize: typography.sm,
  outline: 'none',
  paddingInlineStart: spacing['32'] + spacing['8'],
  paddingInlineEnd: spacing['40'],  // room for ⌘K hint
}}
```

And increase the wrapper width: `width: 380` (was 256).

Add `⌘K` hint inside the search wrapper after the `<input>`:
```tsx
<span
  style={{
    position: 'absolute',
    insetInlineEnd: spacing['10'],
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: typography.xs,
    color: colors.textSecondary,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  }}
>
  ⌘K
</span>
```

**Step 5: Update user avatar** — find the avatar button in the header (around line 763–785) and update:

```tsx
style={{
  width: 36,   // was spacing['32']
  height: 36,
  borderRadius: radius.full,
  border: `1px solid ${colors.brandPrimary}44`,
  backgroundColor: colors.brandPrimary,  // was surfaceMuted
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textInverted,  // was textSecondary
  fontSize: typography.xs,
  fontWeight: Number(fontWeights.semibold),
  cursor: 'pointer',
}}
```

**Step 6: Add `fontWeights.light`** — check `packages/tokens/typography.ts`. If `fontWeights.light` doesn't exist, use `fontWeights.normal` or `300` directly.

**Step 7: Verify** — visit `http://localhost:3000/en/admin/dashboard`. Sidebar should show `REAL Cosmetics` in bold/light, role badge in sidebar user section, dividers between groups, pill search bar, crimson avatar.

**Step 8: Commit**
```bash
git add apps/next/app/admin/_components/AdminShell.tsx
git commit -m "feat(admin): sidebar logo, role badge, nav dividers, pill search, crimson avatar"
```

---

## Task 6: Final cleanup and spacing pass

**Files:**
- Modify: `apps/next/app/admin/dashboard/page.tsx`
- Modify: `apps/next/app/admin/_components/AdminPagePrimitives.tsx`

**Step 1: Update `Section` margin** in `AdminPagePrimitives.tsx`:

```tsx
// Find:
export function Section({ children }: PropsWithChildren) {
  return <section style={{ marginBottom: spacing['32'] }}>{children}</section>
}

// Change to:
export function Section({ children }: PropsWithChildren) {
  return <section style={{ marginBottom: spacing['24'] }}>{children}</section>
}
```

**Step 2: Remove unused imports** from `dashboard/page.tsx` — remove any Lucide icons no longer used (e.g. `CalendarDays`, `SlidersHorizontal`). Remove unused state variables. TypeScript will flag them.

**Step 3: Run type check**
```bash
cd apps/next && yarn tsc --noEmit 2>&1 | head -40
```
Fix any type errors found.

**Step 4: Final visual review** — load `http://localhost:3000/en/admin/dashboard` and verify:
- [ ] KPI cards: compact, colored left borders, hover lift
- [ ] Chart: period tabs work, series toggle works, tooltip appears on hover, legend visible
- [ ] Alert banner: only shows when pending > 10 or health < 90
- [ ] Top Products: ranked with colored badges
- [ ] Quick Actions: all 4 work (3 links + flush cache button with loading state)
- [ ] System Status: shows green "All systems healthy" or real alerts
- [ ] Audit Log: relative timestamps, crimson avatar initials
- [ ] Sidebar: REAL Cosmetics logo, role badge, dividers, crimson active state
- [ ] Header: pill search with ⌘K, crimson avatar

**Step 5: Final commit**
```bash
git add apps/next/app/admin/dashboard/page.tsx apps/next/app/admin/_components/AdminPagePrimitives.tsx
git commit -m "refactor(admin/dashboard): spacing pass, remove unused imports, final polish"
```
