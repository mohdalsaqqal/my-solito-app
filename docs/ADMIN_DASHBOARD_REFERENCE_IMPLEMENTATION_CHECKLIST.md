# Admin Dashboard Reference Implementation Checklist

Reference source:
- `downloads/stitch-admin-promotion-editor/05-admin-dashboard-overview-7bc0a92a.html`
- `downloads/stitch-admin-promotion-editor/05-admin-dashboard-overview-7bc0a92a.png`

Target files:
- `apps/next/app/admin/_components/AdminShell.tsx`
- `apps/next/app/admin/_components/AdminPagePrimitives.tsx`
- `apps/next/app/admin/dashboard/page.tsx`
- `packages/tokens/layout.ts`

## 1) Layout Structure
- [x] Fixed left sidebar (260px expanded, collapsible) in `apps/next/app/admin/_components/AdminShell.tsx`
- [x] Sticky top header in main area with search + actions in `apps/next/app/admin/_components/AdminShell.tsx`
- [x] Main content centered with bounded width (dashboard max width token) in `apps/next/app/admin/_components/AdminPagePrimitives.tsx`
- [x] Dashboard sections ordered as:
  - KPI cards
  - Critical alerts
  - Bottom split (audit + top products)
  in `apps/next/app/admin/dashboard/page.tsx`

## 2) Components
- [x] Sidebar brand lockup + grouped nav + active state in `apps/next/app/admin/_components/AdminShell.tsx`
- [x] Header controls (search, dashboard/logout actions) in `apps/next/app/admin/_components/AdminShell.tsx`
- [x] KPI card component pattern using `Panel` in `apps/next/app/admin/dashboard/page.tsx`
- [x] Alert card pattern (severity + CTA) in `apps/next/app/admin/dashboard/page.tsx`
- [x] Audit table pattern with status pills in `apps/next/app/admin/dashboard/page.tsx`
- [x] Top-products right rail list in `apps/next/app/admin/dashboard/page.tsx`

## 3) Spacing System
- [x] Shared page rhythm through `PageContainer`, `Section`, `ActionRow`, `Panel` in `apps/next/app/admin/_components/AdminPagePrimitives.tsx`
- [x] Token-based spacing only (`spacing.*`) across admin shell and dashboard files
- [x] Dashboard content width increased via `layout.maxWidth.dashboard` token in `packages/tokens/layout.ts`

## 4) Typography Scale
- [x] Page heading and subtitle hierarchy in `apps/next/app/admin/_components/AdminPagePrimitives.tsx`
- [x] KPI labels + values hierarchy in `apps/next/app/admin/dashboard/page.tsx`
- [x] Table header uppercase/meta typography consistency in `apps/next/app/admin/dashboard/page.tsx`

## 5) Interaction Patterns
- [x] Sticky header behavior in `apps/next/app/admin/_components/AdminShell.tsx`
- [x] Clear primary/secondary/ghost button hierarchy via shared `Button` in `apps/next/app/admin/_components/AdminPagePrimitives.tsx`
- [x] Status pill semantics for warnings/success/danger via `StatusPill` in `apps/next/app/admin/_components/AdminPagePrimitives.tsx`
- [x] Empty-state handling via `EmptyState` in dashboard and other admin pages

## 6) Open Visual Parity Items (Optional)
- [ ] Add icon set parity for each KPI card and top-products rows.
- [ ] Add notification/message icon buttons with badges in header.
- [ ] Add row hover transitions for dashboard tables and list rows.
- [ ] Tune light/dark tonal contrast to exactly match Stitch reference.

