# Admin UI System Specification

Project: Real Cosmetics  
Scope: `/admin`  
Architecture Constraint: `UI -> apiClient -> BFF -> provider registry -> adapters`  
Version: `1.0`  
Status: `Authoritative Design Contract`

## 1. Purpose

This document defines the visual hierarchy, layout system, spacing rules, domain structure, permissions model, and interaction behavior for the `/admin` interface.

This spec is mandatory for:

- All new admin pages
- Refactors of existing admin pages
- Codex-generated UI

No page may deviate from this system without explicit revision of this document.

## 2. Admin Route Hierarchy (Domain-Based)

Admin is structured by domain, not feature.

```txt
/admin
    /dashboard
    /catalog
        /products
        /categories
        /brands
        /queries
    /marketing
        /promotions
        /cms
            /releases
            /blocks
            /queries
    /orders
    /customers
    /operations
        /cache
        /audit
```

Rules:

- No cross-domain mixing.
- Promotions are under Marketing (not CMS).
- CMS is under Marketing.
- Cache/Audit are under Operations.

## 3. Admin Shell Layout

File:

`/app/admin/layout.tsx`

Structure:

```txt
AdminShell
 ├── Sidebar
 └── MainArea
      ├── AdminHeader (sticky)
      └── ContentArea (scrollable)
```

## 4. Layout Rules (Non-Negotiable)

### 4.1 Page Container Discipline

Every admin page must use:

```tsx
<PageContainer>
   <PageHeader />
   <Section>
      <Panel />
   </Section>
</PageContainer>
```

`PageContainer`:

- `max-width: 1120px` (default)
- `max-width: 1280px` (dense data pages only)
- `margin: auto`
- horizontal padding:
  - desktop: `24px`
  - tablet: `16px`
  - mobile: `12px`

No content may stretch edge-to-edge unless explicitly dashboard analytics.

### 4.2 Spacing System

Spacing tokens (fixed scale):

- `2`
- `4`
- `8`
- `12`
- `16`
- `24`
- `32`
- `48`

Usage:

- Inline icon/text gap: `8`
- Form field vertical gap: `12`
- Card padding: `16` (dense) / `24` (default)
- Section vertical spacing: `24`
- Major section separation: `32`

Never use arbitrary spacing values.

### 4.3 Radius & Borders

- Border radius: `10–12px` (consistent)
- Border thickness: `1px`
- No heavy outlines
- No shadow stacking

Admin should feel clean, structured, calm.

## 5. Sidebar Specification

Width:

- Expanded: `260px`
- Collapsed: `72px`

Structure:

- Brand Area
- Navigation Groups
- Environment Indicator
- User Indicator

Navigation Groups:

- Dashboard
- Catalog
  - Products
  - Categories
  - Brands
  - Queries
- Marketing
  - Promotions
  - CMS
    - Releases
    - Blocks
    - Queries
- Orders
- Customers
- Operations
  - Cache
  - Audit

Sidebar Behavior:

- Groups collapsible.
- State persisted in local storage.
- Active route highlighted with:
  - subtle background
  - accent side bar
- Hover: background tint only.
- Focus: visible keyboard ring.
- Badge support allowed.

## 6. Header Specification

Height: `56–64px`  
Sticky inside `MainArea`.

Zones:

Left:

- Breadcrumb
- Page title

Right:

- Global search (future)
- Quick actions (contextual)
- User dropdown

User dropdown:

- Profile
- Logout
- Environment (if allowed)

## 7. Permission Model

Even if only admin exists now, design for scale.

Role Types:

- `admin`
- `marketing`
- `catalog`
- `support`
- `ops`

Permission Matrix:

| Domain | admin | marketing | catalog | support | ops |
|---|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Catalog | ✓ | read | ✓ | read | read |
| Marketing | ✓ | ✓ | read | read | read |
| Orders | ✓ | read | read | ✓ | read |
| Customers | ✓ | read | read | ✓ | read |
| Operations | ✓ | no | no | no | ✓ |

Rules:

- Sidebar hides inaccessible domains.
- BFF enforces permission.
- Never trust client role.

## 8. Page Patterns

### 8.1 Table + Filters Pattern

Used in:

- Products
- Orders
- Promotions
- Queries

Structure:

```txt
PageTitle
ActionRow
Panel
   Table
Pagination
```

Rules:

- Search on left.
- Primary action on right.
- Table header sticky (optional).
- Empty state with CTA.
- Row hover highlight.
- Row click does not replace explicit Edit button.

### 8.2 Editor Pattern

Used in:

- Promotion create/edit
- Release create/edit
- Block editor
- Query editor

Structure:

```txt
Header (title + status)
PrimaryActions (Save / Publish)
FormPanel
   Section
   Section
ValidationPanel (optional right rail)
```

Rules:

- Inline validation on blur.
- Publish disabled if invalid.
- Draft may save invalid.
- Advanced options collapsed by default.
- Only one primary action per screen.

### 8.3 Dashboard Pattern

Grid layout:

- KPI cards (4)
- Alerts panel
- Recent audit
- Top items

Cards clickable.  
Alerts actionable.

## 9. CMS Block Editor Rules

Layout:

Left:

- Block list (draggable)

Right:

- Block editor panel

Block list item shows:

- Type icon
- Title
- Validation status chip

Rules:

- Drag reorder with animation.
- Invalid blocks allowed in draft.
- Publish blocked if invalid.
- Exact validation reason displayed.

## 10. Promotions UI Rules

Sections:

- Basics
- Window
- Priority
- Conditions
- Reward
- Validation Summary

Rules:

- Only one reward allowed.
- Clear note: “Only one highest-priority promotion applies.”
- Percent must be `0 < value ≤ 100`.
- Fixed amount must be `> 0`.
- Date must be valid ISO.

## 11. Operations (Cache)

Rules:

- Action dropdown.
- Confirmation input requires `"FLUSH"`.
- Cooldown timer displayed.
- Show revalidated paths and tags.
- Show CDN result.
- Destructive operations require confirmation modal.

## 12. Interaction Standards

Buttons:

- One primary per screen.
- Destructive = confirm modal.
- Secondary = ghost/outline.

Forms:

- Inline error below field.
- Do not show error before interaction.
- Disable submit when invalid.

Loading:

- Skeletons for tables.
- Toast for success.
- Inline error panel for failures.

Keyboard:

- Esc closes modal.
- Tab order correct.
- Enter submits form.

## 13. RTL Requirements

- Use logical properties (start/end).
- Sidebar flips to right.
- Breadcrumb direction flips.
- Directional icons flip.
- Drag handles remain at logical start.
- No hardcoded left/right CSS.

## 14. Visual Tone

Admin design goals:

- Structured
- Calm
- Neutral
- Professional
- Minimal animation
- Clear hierarchy

No decorative gradients.

This is a control panel, not marketing UI.

## 15. Future-Proofing Rules

This structure must support:

- A/B testing
- Bundles
- Multi-store
- Role expansion
- ERP sync tools
- Warehouse tools

No domain may be restructured later.

## 16. Non-Allowed Patterns

- Feature-level top nav (e.g., Blocks as main nav item)
- Full-width uncontrolled layouts
- Multiple primary actions
- Publish without validation
- Direct mutation without audit logging
- UI-only permission hiding without BFF enforcement

## 17. Enforcement

All Codex-generated admin UI must:

- Use `PageContainer`
- Respect spacing scale
- Follow domain route structure
- Respect permission matrix
- Use validation rules
- Pass RTL checklist

Deviation requires spec update.

End of Spec
