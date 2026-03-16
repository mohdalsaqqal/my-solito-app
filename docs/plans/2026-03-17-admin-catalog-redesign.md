# Admin Catalog Redesign

**Date:** 2026-03-17
**Scope:** Products, Categories, Brands, Queries (Product Collections)
**Approach:** Source-Aware Override Layer — source owns data, admin owns presentation, overrides, and taxonomy

---

## Philosophy

> The source owns the data. The admin controls presentation, overrides, and taxonomy.

Three-layer model:
1. **Source layer** — ERP / Medusa / CSV / DB provides raw product data via adapter
2. **Sync/adapter layer** — normalizes to canonical fields, puts unknowns into `customFields`, registers them in field registry
3. **Admin override layer** — status control, canonical field overrides, taxonomy (categories/brands), CMS links

---

## Section 1: Products List

### Header
- `PageHeader` title: "Products"
- Top-right actions: `Sync from Source` (secondary), `Import CSV` (secondary), `+ New Product` (primary)

### Filter Bar
- Collapsible panel, hidden by default
- Toggle: "Filters" pill button in header area
- Fields: Status (All/Active/Draft/Archived), Brand (dropdown), Category (dropdown), Price min/max, Low stock toggle, Search (name/SKU)
- Footer: Reset + Apply buttons

### Table
Fixed columns:

| Column | Content |
|--------|---------|
| ☐ | Checkbox for bulk select |
| Image | 40×40 thumbnail, placeholder icon if missing |
| Title + SKU | Title bold, SKU in muted xs below |
| Brand | Text |
| Category | Text |
| Price | Canonical price + "+" indicator if price variants exist (hover tooltip shows all) |
| Stock | Number, red dot if below threshold |
| Status | `StatusPill`: active=green, draft=amber, archived=gray |
| Actions | View, Edit (opens slide-over), quick status toggle |

Configurable extra columns via "Columns" button → popover (existing dynamic columns feature, restyled).

### Bulk Actions Bar
Appears when ≥1 row checked:
- Activate / Deactivate / Archive / Assign Category / Export selected

### Pagination
- Page size selector (10/25/50)
- Prev / Next buttons
- "X of Y products" count

---

## Section 2: Product Detail Panel (Slide-over)

- Width: 480px, slides in from right
- Overlays list (list stays visible, dimmed)
- Header: product name + close button
- Scrollable body with 4 collapsible sections

### ① Canonical Fields (open by default, editable)
- Image: preview + URL input + Upload button
- Title, SKU (text inputs)
- Brand, Category (dropdowns linked to admin brand/category lists)
- Status (select: draft/active/archived)
- Description (textarea)
- Save Changes button — only visible when form is dirty
- Override indicator: fields differing from source show `●` dot + "Override" label

### ② Price Variants (open by default)
- Dynamic rows from `prices[]` array
- Each row: type label + amount + currency + optional expiry date
- Active sale price: highlighted in crimson
- Expired sale price: muted/strikethrough
- Read-only by default
- "Override" toggle per row → enables editable input (stored as admin override)
- "+ Add price variant" button for admin-only tiers

### ③ Source Fields (collapsed by default)
- Rendered from field registry (`customFields` + `sourceColumns`)
- Type-aware display:
  - `currency` → formatted money
  - `percent` → "38%"
  - `date` → formatted date string
  - `text` → plain string
- All read-only, "SOURCE" badge top-right

### ④ Source Metadata (collapsed by default)
- Source system name + schema version
- External ID + last synced timestamp
- Mapped columns count
- "View raw source data" toggle → full JSON in code block

---

## Section 3: Categories

### Header
- `PageHeader` title: "Categories"
- Actions: `Sync from Source`, `+ Add Category`, search input

### Tree View
- Indented tree (not flat list)
- Root categories as rows, children indented with connecting line
- Expand/collapse per parent
- Each row: Name (EN) | Slug | Product count badge | Status pill | Source badge (if `sourceId`) | Edit / Hide / Delete

### Add/Edit Slide-over (480px)
Fields:
- Name EN + Name AR (bilingual)
- Slug (auto-generated from EN name, editable)
- Parent Category (dropdown)
- Image/icon upload
- SEO: Meta title + Meta description
- Sort order
- Status toggle (visible/hidden)
- Source ID (read-only if synced from source)

### Sync Behavior
- "Sync from Source" → calls adapter, upserts by `sourceId`
- New source categories → created with `sourceId`
- Existing → only updates non-overridden fields
- Admin-only categories (no `sourceId`) → untouched by sync

### Delete Protection
- Has products assigned → blocked, shows "X products assigned"
- Synced from source → confirmation: "Hide instead of delete?"

---

## Section 4: Brands

### Header
- `PageHeader` title: "Brands"
- Actions: `Sync from Source`, `+ Add Brand`, search input, Grid/List toggle

### Views
**Grid (default):** 3–4 column card grid — logo + name + product count + status pill
**List:** table — Logo | Name EN/AR | Slug | Products | Status | Source | Actions

### Add/Edit Slide-over (480px)
Fields:
- Logo: image preview + upload (square crop — used in CMS spotlights)
- Name EN + Name AR
- Slug (auto-generated, editable)
- Description (short textarea)
- Website URL
- Status toggle (visible/hidden)
- CMS Link: "Currently featured on homepage ✓" if active spotlight exists → link to `/admin/marketing/cms/offer-banners`
- Source ID (read-only if synced)

### Sync Behavior
Same as categories — upserts by `sourceId`, preserves manual overrides (logo, description, slug).

### Delete Protection
Has products → "X products use this brand. Reassign before deleting."

---

## Section 5: Product Collections (Queries)

### Changes from current
- Rename: "Queries" → "Product Collections" in nav
- Add **name field** to each collection (replaces anonymous filter JSON)
- Style tabs (Builder/JSON) as pill toggles matching dashboard period tabs
- Wire **Edit** on existing collections → loads into builder
- Result preview: small product cards (image + name + price) instead of raw JSON

---

## Section 6: Data Architecture

### New type: `PriceVariant`
```ts
type PriceVariant = {
  type: string           // 'retail' | 'sale' | 'wholesale' | 'vat_excl' | custom
  amount: number
  currency: string
  validFrom?: string
  validUntil?: string
  isAdminOverride?: boolean
}
```

### Extended: `ProductDetail`
```ts
// Add to existing ProductDetail:
prices?: PriceVariant[]
overrides?: string[]     // field keys admin has overridden
```

### New type: `CategoryRecord`
```ts
type CategoryRecord = {
  id: string
  nameEn: string
  nameAr?: string
  slug: string
  parentId?: string
  productCount: number
  sortOrder: number
  status: 'visible' | 'hidden'
  sourceId?: string        // NEW
  image?: string           // NEW
  metaTitle?: string       // NEW
  metaDescription?: string // NEW
}
```

### Extended: `BrandRecord`
```ts
// Existing fields +
sourceId?: string
logoUrl?: string
description?: string
websiteUrl?: string
```

### Extended: `QueryRecord`
```ts
// Add to existing:
name: string
```

### Storage
- Categories + brands: `.data/admin-catalog.json`
- Same pattern as `admin-controls.json` (read/write with audit trail)

### New API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/catalog/categories` | GET | List all categories |
| `/api/admin/catalog/categories` | POST | Create category |
| `/api/admin/catalog/categories/[id]` | PATCH | Edit category |
| `/api/admin/catalog/categories/[id]` | DELETE | Delete category |
| `/api/admin/catalog/categories/sync` | POST | Sync from source adapter |
| `/api/admin/catalog/brands` | GET | List all brands |
| `/api/admin/catalog/brands` | POST | Create brand |
| `/api/admin/catalog/brands/[id]` | PATCH | Edit brand |
| `/api/admin/catalog/brands/[id]` | DELETE | Delete brand |
| `/api/admin/catalog/brands/sync` | POST | Sync from source adapter |
| `/api/admin/catalog/queries/[slug]` | PATCH | Edit existing collection |

---

## Files to Create/Modify

| File | Change |
|------|--------|
| `apps/next/app/admin/catalog/products/ProductManagementPage.tsx` | Redesign list + slide-over detail panel |
| `apps/next/app/admin/catalog/categories/page.tsx` | Full rewrite — tree view + slide-over CRUD |
| `apps/next/app/admin/catalog/brands/page.tsx` | Full rewrite — grid/list + slide-over CRUD |
| `apps/next/app/admin/catalog/queries/page.tsx` | Style polish + edit + name field + product preview cards |
| `apps/next/app/api/admin/catalog/categories/route.ts` | NEW — list + create |
| `apps/next/app/api/admin/catalog/categories/[id]/route.ts` | NEW — edit + delete |
| `apps/next/app/api/admin/catalog/categories/sync/route.ts` | NEW — sync from source |
| `apps/next/app/api/admin/catalog/brands/route.ts` | NEW — list + create |
| `apps/next/app/api/admin/catalog/brands/[id]/route.ts` | NEW — edit + delete |
| `apps/next/app/api/admin/catalog/brands/sync/route.ts` | NEW — sync from source |
| `apps/next/app/api/admin/catalog/queries/[slug]/route.ts` | MODIFY — add PATCH handler |
| `apps/next/app/api/_lib/admin-catalog-store.ts` | NEW — read/write admin-catalog.json |
| `packages/providers/contracts/CatalogProviders.ts` | Add categories/brands sync method |
| `packages/adapters/mock/category/index.ts` | Add sourceId to mock data |
| `packages/adapters/mock/brand/index.ts` | Add sourceId, logoUrl to mock data |
