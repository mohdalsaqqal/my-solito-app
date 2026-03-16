# Admin Dashboard Redesign

**Date:** 2026-03-16
**Scope:** Dashboard page + AdminShell polish
**Approach:** Executive Glance — visual, scannable, store-owner focused

---

## Goals

- Store owner can scan the full business health in under 5 seconds
- Remove data-density clutter (table, year dropdown) from the dashboard
- Elevate the chart to hero status
- Add Quick Actions to reduce deep navigation
- Polish the AdminShell sidebar and header

---

## Layout (top to bottom)

1. **Page header** — "Dashboard" + today's date + "Good morning, [name]"
2. **Alert banner** (conditional) — only renders when real issues exist (pending > 10, health < 90%)
3. **KPI row** — 4 compact cards (~120px height)
4. **Chart panel** — full-width Revenue & Orders trend
5. **Bottom grid** — 2-column:
   - Left: Top Products + Recent Audit Log
   - Right: Quick Actions + System Alerts
6. **No full analytics table** on dashboard — moved to Orders tab

---

## Section 1: KPI Cards

- Fixed height ~120px, compact
- Left-border accent per card:
  - Revenue → crimson (`brandPrimary`)
  - Users → blue (`info`)
  - Pending Orders → amber (`warning`)
  - System Health → green (`success`)
- Icon in a soft tinted circle (accent color at ~10% opacity), top-right
- Large bold value top-left
- Bottom: trend arrow + % change + "vs last period" (xs, subdued)
- Hover: box-shadow lift + subtle `translateY(-2px)`
- Click navigates to relevant section

---

## Section 2: Chart Panel

- Full-width white panel, rounded, shadow
- Header: "Revenue & Orders" title left + series toggle pills right (Revenue / Orders / Both)
- Period switcher tab strip: 7D / 30D / 3M / 12M / Custom
  - "Custom" expands inline date-range picker
- Chart:
  - Revenue = crimson filled bars (opacity 0.75)
  - Orders = blue polyline with dots
  - 4 dashed horizontal grid lines
  - X-axis: period labels
  - Dual Y-axis: revenue left, order count right
  - Hover tooltip: revenue + order count for the hovered period
  - Legend pills below chart
- Empty state: "No orders in this period" message

---

## Section 3: Bottom Grid

### Left column

**Top Products panel:**
- Rank badge: #1 crimson, #2 gold, #3 gray, #4–5 muted
- Product name + units sold
- Revenue right-aligned
- "View all products →" footer link

**Recent Audit Log panel:**
- Avatar initial circle + action description + relative time ("2h ago")
- "View full audit →" footer link

### Right column

**Quick Actions panel:**
- Full-width buttons with icon + label, secondary tone
- Actions: New Promotion, Flush Cache (inline with loading state), View Orders, Manage Banners
- Hover: crimson tint background

**System Alerts panel:**
- Data-driven — computed from real order/health stats
- "All systems healthy ✓" (green) when no issues
- Severity pill (High / Medium) per active alert
- Replaces the 3 hardcoded static alerts

---

## Section 4: AdminShell Polish

### Sidebar
- Logo: `REAL` bold + `Cosmetics` light weight, crimson accent
- Nav active state: crimson left-border + soft crimson bg tint (10% opacity)
- Section dividers between domain groups
- User area: add role badge pill (e.g. `admin`, `marketing`)
- Collapsed mode: icon-only with hover tooltips

### Top Header
- Search: pill shape, 380px wide, `⌘K` hint label inside
- Notifications bell: red dot badge when alerts exist
- User avatar: 36px, initials on crimson background

### Global spacing
- Section `marginBottom`: 32px → 24px
- Panel titles: `lg` → `base` font size
- Consistent `radius.xl + 4` on all panels (already in primitives)

---

## Files to change

| File | Change |
|------|--------|
| `apps/next/app/admin/dashboard/page.tsx` | Full redesign per sections 1–3 |
| `apps/next/app/admin/_components/AdminShell.tsx` | Shell polish per section 4 |
| `apps/next/app/admin/_components/AdminPagePrimitives.tsx` | KPI card component, chart legend, quick action button variant |

---

## Data sources (no new APIs needed)

- KPIs: computed from existing `apiClient.orders.list()` — same as today
- Chart: same `buildLast12MonthsSeries` / `buildYearSeries` functions, extended with period tabs
- Top Products: same `topItems` memo
- Audit Log: same `apiClient.admin.opsAudit()`
- Quick Actions: existing `apiClient.admin.cache()` for flush; links for others
- System Alerts: computed inline from `summary.pending`, `summary.health`
