# Solito v5 Architecture Graph

> **Strapi-free.** All CMS, catalog, media, auth, and admin capabilities run within Next.js + Prisma + PostgreSQL.

---

## Current State — Monorepo Structure & Data Flow

```mermaid
graph TB
    subgraph Apps
        Next["apps/next<br/>Next.js 16 Web App + Server Layer"]
        Expo["apps/expo<br/>Expo 54 Mobile App"]
    end

    subgraph Packages
        App["packages/app<br/>Shared Screens & Logic"]
        UI["packages/ui<br/>Shared RNR Component System"]
        Tokens["packages/tokens<br/>Design Tokens"]
        Providers["packages/providers<br/>Contracts + Registry"]
        Adapters["packages/adapters<br/>External Integrations"]
    end

    subgraph UI_Layer["packages/ui Breakdown"]
        Reusables["reusables/<br/>Control Layer (cva + className)"]
        Components["components/<br/>Product-facing UI (inline tokens)"]
        Primitives["primitives/<br/>Legacy (do not grow)"]
        Responsive["responsive/<br/>useBreakpoint()"]
    end

    subgraph Server_Layer["apps/next/server"]
        Services["services/<br/>Business Logic"]
        Routes["Route Handlers<br/>app/api/**"]
        Actions["Server Actions"]
    end

    subgraph Data_Flow
        Admin["Admin UI<br/>/admin/marketing/cms/"]
        CMS["Custom CMS<br/>Route Handlers"]
        Server["Server Layer"]
        Normalized["Normalized Blocks"]
        UI_Render["UI Rendering"]
    end

    subgraph Phase_Plan
        P1["Phase 1: Real Cosmetics Product<br/>14 Subphases"]
        P2["Phase 2: SaaS Platform<br/>8 Subphases"]
    end

    %% Data Flow Connections
    Admin -->|Manage| CMS
    CMS -->|Content| Server
    Server -->|Normalized Blocks| Normalized
    Normalized -->|Layout-as-Data| UI_Render

    %% App Dependencies
    Next -->|Imports| Services
    Next -->|Imports| Providers
    Next -->|Uses| Actions
    Next -->|Uses| Routes

    Expo -->|Uses| App
    Expo -->|Uses| UI
    Expo -->|Uses| Tokens

    App -->|Uses| UI
    App -->|Uses| Providers
    App -->|Uses| Tokens

    UI -->|Uses| Reusables
    UI -->|Uses| Components
    UI -->|Uses| Primitives
    UI -->|Uses| Responsive
    UI -->|Uses| Tokens

    Services -->|Calls| Providers
    Providers -->|Registry| Adapters

    %% Phase Dependencies
    P1 -->|Baseline| P2

    classDef app fill:#2563eb,stroke:#1e40af,color:#fff
    classDef pkg fill:#059669,stroke:#047857,color:#fff
    classDef server fill:#7c3aed,stroke:#6d28d9,color:#fff
    classDef data fill:#ea580c,stroke:#c2410c,color:#fff
    classDef phase fill:#dc2626,stroke:#b91c1c,color:#fff
    classDef ui fill:#0891b2,stroke:#0e7490,color:#fff

    class Next,Expo app
    class App,Providers,Adapters pkg
    class Services,Routes,Actions server
    class Admin,CMS,Server,Normalized,UI_render data
    class P1,P2 phase
    class UI,Reusables,Components,Primitives,Responsive ui
    class Tokens ui
```

---

## Future State — Full CMS Without Strapi

```mermaid
graph TB
    subgraph Admin["Admin UI (Next.js App Router)"]
        A1["CMS Blocks<br/>Visual Block Editor"]
        A2["Catalog Admin<br/>Product CRUD"]
        A3["Media Library<br/>Upload + Optimize"]
        A4["Releases<br/>Stage + Publish"]
        A5["Menus<br/>Visual Builder"]
        A6["Site Config<br/>Branding + Footer"]
        A7["Auth + RBAC<br/>Middleware Guard"]
    end

    subgraph API["Custom CMS API (Next.js Route Handlers)"]
        R1["POST /admin/cms/blocks"]
        R2["POST /admin/cms/products"]
        R3["POST /admin/media/upload"]
        R4["POST /admin/cms/releases/publish"]
        R5["GET/POST /admin/cms/menus"]
        R6["GET/PUT /admin/cms/site-config"]
        R7["POST /auth/login + middleware.ts"]
    end

    subgraph DB["Prisma + PostgreSQL (DONE)"]
        D1["Category"]
        D2["Brand"]
        D3["ProductQuery"]
        D4["Release + ReleaseBlock"]
        D5["Promotion"]
        D6["PricingQuote"]
        D7["CmsSiteConfig"]
        D8["CmsTickerSettings + CmsTickerItem"]
        D9["CmsEducationBanner"]
        D10["CmsUgcItem"]
        D11["CmsToggleOverride"]
        D12["CmsBrandSpotlight"]
        D13["CmsOfferBanner"]
        D14["CmsAuditLog"]
    end

    subgraph Media["Media Service"]
        M1["sharp — image optimization"]
        M2["WebP/AVIF conversion"]
        M3["S3/CDN upload"]
        M4["Auto-crop + resize"]
    end

    subgraph Services["Server Services Layer"]
        S1["catalog.service"]
        S2["product.service"]
        S3["home-cms.service"]
        S4["search.service"]
        S5["cart.service"]
        S6["checkout.service"]
    end

    subgraph Engine["Homepage Layout Engine"]
        E1["extractHomeBlocks()"]
        E2["normalizeBlocks()"]
        E3["buildHomeLayout()"]
        E4["dispatchHomeRenderer()"]
    end

    subgraph UI["UI Rendering"]
        U1["HomeScreen"]
        U2["20 Block Renderers"]
        U3["Responsive Layout"]
        U4["Token-Based Styling"]
    end

    %% Admin -> API
    A1 --> R1
    A2 --> R2
    A3 --> R3
    A4 --> R4
    A5 --> R5
    A6 --> R6
    A7 --> R7

    %% Middleware protects all admin routes
    R7 -.->|protects| R1
    R7 -.->|protects| R2
    R7 -.->|protects| R3
    R7 -.->|protects| R4
    R7 -.->|protects| R5
    R7 -.->|protects| R6

    %% API -> DB
    R1 --> D1
    R2 --> D2
    R3 --> D5
    R4 --> D7
    R5 --> D9
    R6 --> D10
    R7 --> D8

    %% API -> Media
    R3 --> M1
    M1 --> M2
    M2 --> M3
    M2 --> M4

    %% DB -> Services
    D1 --> S3
    D2 --> S1
    D3 --> S1
    D4 --> S1
    D5 --> S3
    D7 --> S3
    D9 --> S3

    %% Services -> Engine
    S3 --> E1
    E1 --> E2
    E2 --> E3
    E3 --> E4

    %% Engine -> UI
    E4 --> U1
    U1 --> U2
    U2 --> U3
    U3 --> U4

    classDef admin fill:#2563eb,stroke:#1e40af,color:#fff
    classDef api fill:#7c3aed,stroke:#6d28d9,color:#fff
    classDef db fill:#059669,stroke:#047857,color:#fff
    classDef media fill:#ea580c,stroke:#c2410c,color:#fff
    classDef svc fill:#dc2626,stroke:#b91c1c,color:#fff
    classDef engine fill:#0891b2,stroke:#0e7490,color:#fff
    classDef ui fill:#64748b,stroke:#475569,color:#fff

    class A1,A2,A3,A4,A5,A6,A7 admin
    class R1,R2,R3,R4,R5,R6,R7 api
    class D1,D2,D3,D4,D5,D6,D7,D8,D9,D10,D11 db
    class M1,M2,M3,M4 media
    class S1,S2,S3,S4,S5,S6 svc
    class E1,E2,E3,E4 engine
    class U1,U2,U3,U4 ui
```

---

## Homepage Layout Engine Pipeline (Unchanged — Keep This)

```mermaid
graph LR
    CMS_Block["CMS Block Data"] -->|Server Fetch| Normalize["Normalize Blocks"]
    Normalize -->|Layout Profile| Builder["buildHomeLayout()"]
    Builder -->|Resolved Slots| Dispatcher["dispatchHomeRenderer()"]
    Dispatcher -->|Hero| Hero["Hero Renderer"]
    Dispatcher -->|Product Rail| Rail["Product Rail Renderer"]
    Dispatcher -->|Brand Promo| Promo["Brand Promo Renderer"]
    Dispatcher -->|Other Blocks| Others["Other Renderers"]

    Hero -->|UI| HomeScreen["HomeScreen"]
    Rail -->|UI| HomeScreen
    Promo -->|UI| HomeScreen
    Others -->|UI| HomeScreen

    classDef cms fill:#ea580c,stroke:#c2410c,color:#fff
    classDef process fill:#7c3aed,stroke:#6d28d9,color:#fff
    classDef render fill:#059669,stroke:#047857,color:#fff
    classDef final fill:#2563eb,stroke:#1e40af,color:#fff

    class CMS_Block cms
    class Normalize,Builder,Dispatcher process
    class Hero,Rail,Promo,Others render
    class HomeScreen final
```

---

## Architecture Rules (Allowed vs Forbidden)

```mermaid
graph TB
    subgraph Allowed["✅ Allowed Patterns"]
        A1["Server Components via services"]
        A2["Route Handlers (thin transport)"]
        A3["Server Actions (delegate to services)"]
        A4["Cache Components (tagged caching)"]
        A5["Client islands (mutations)"]
    end

    subgraph Forbidden["❌ Forbidden Patterns"]
        F1["apiClient in Server Components"]
        F2["Direct adapter imports in UI"]
        F3["className in packages/app"]
        F4["process.env in shared packages"]
        F5["Hex literals in shared UI"]
        F6["Platform.OS outside useBreakpoint"]
        F7["Touchable in active components"]
        F8["Server Components calling Route Handlers"]
        F9["External BFF layer"]
    end

    subgraph NonNegotiables["🔒 Non-Negotiables"]
        N1["Tokens over hardcoded values"]
        N2["Providers over adapter imports"]
        N3["Server owns data access"]
        N4["CMS controls content"]
        N5["No Touchable primitives"]
        N6["No Strapi dependency"]
    end

    classDef allowed fill:#059669,stroke:#047857,color:#fff
    classDef forbidden fill:#dc2626,stroke:#b91c1c,color:#fff
    classDef rules fill:#7c3aed,stroke:#6d28d9,color:#fff

    class A1,A2,A3,A4,A5 allowed
    class F1,F2,F3,F4,F5,F6,F7,F8,F9 forbidden
    class N1,N2,N3,N4,N5,N6 rules
```

---

## Strapi Capability Map — What You Build vs What Strapi Provides

```mermaid
graph TB
    subgraph Strapi["What Strapi Would Provide"]
        S1["Content Type Builder"]
        S2["Auto REST/GraphQL API"]
        S3["Media Library + Optimization"]
        S4["RBAC + Auth"]
        S5["i18n System"]
        S6["Drafts + Releases"]
        S7["Admin UI (auto-generated)"]
        S8["Plugin Ecosystem"]
    end

    subgraph Yours["Your Implementation Path"]
        Y1["Zod Schemas + TS Types ✅ Already done"]
        Y2["Custom Route Handlers ✅ Already done"]
        Y3["sharp + S3/CDN — needs building"]
        Y4["Next.js middleware + Prisma users — needs building"]
        Y5["Manual En/Ar fields — improve, keep"]
        Y6["Custom Release System ✅ Already done"]
        Y7["Visual Admin UI — rebuild properly"]
        Y8["Build only what you need"]
    end

    subgraph Replace["What to Replace"]
        R1["JSON files → Prisma + PostgreSQL"]
        R2["Raw fs uploads → sharp + S3"]
        R3["No auth middleware → Add it"]
        R4["JSON-only menus → Visual builders"]
        R5["No caching → ISR + CDN + in-memory"]
    end

    S1 -.->|Already matched| Y1
    S2 -.->|Already matched| Y2
    S3 -.->|Build this| Y3
    S4 -.->|Build this| Y4
    S5 -.->|Keep yours| Y5
    S6 -.->|Already matched| Y6
    S7 -.->|Rebuild this| Y7
    S8 -.->|Skip| Y8

    R1 --> Y2
    R2 --> Y3
    R3 --> Y4
    R4 --> Y7
    R5 --> Y2

    classDef strapi fill:#7c3aed,stroke:#6d28d9,color:#fff
    classDef yours fill:#059669,stroke:#047857,color:#fff
    classDef replace fill:#dc2626,stroke:#b91c1c,color:#fff

    class S1,S2,S3,S4,S5,S6,S7,S8 strapi
    class Y1,Y2,Y3,Y4,Y5,Y6,Y7,Y8 yours
    class R1,R2,R3,R4,R5 replace
```

---

## Build Order — Strapi-Free CMS Completion

```mermaid
graph TB
    subgraph Sprint1["Sprint 1: Foundation (P0 Fixes)"]
        F1["Add Next.js middleware.ts<br/>auth guard for /admin/**"]
        F2["Add Prisma + PostgreSQL<br/>schema for CMS entities"]
        F3["Migrate JSON files → DB<br/>blocks, releases, menus, config"]
        F4["Add CMS caching layer<br/>ISR + in-memory cache"]
    end

    subgraph Sprint2["Sprint 2: Media & Security (P1 Fixes)"]
        F5["Media service: sharp + S3<br/>upload, optimize, WebP, CDN"]
        F6["Add Zod validation<br/>at all route entry points"]
        F7["Add URL validation<br/>href/bannerHref fields"]
        F8["Add input sanitization<br/>XSS protection"]
    end

    subgraph Sprint3["Sprint 3: Admin UX (P1-P2 Fixes)"]
        F9["Split blocks/page.tsx<br/>into sub-components"]
        F10["Build visual menu builder<br/>replace JSON editing"]
        F11["Add drag-and-drop<br/>block ordering with keyboard a11y"]
        F12["Add loading skeletons<br/>error recovery, retry buttons"]
    end

    subgraph Sprint4["Sprint 4: Polish (P2-P3 Fixes)"]
        F13["Add i18n to all admin pages<br/>fix UTF-8 encoding"]
        F14["Add RBAC with Prisma<br/>roles, permissions, audit logs"]
        F15["Parallelize product enrichment<br/>Promise.allSettled"]
        F16["Add rate limiting<br/>public CMS endpoint"]
    end

    F1 --> F2 --> F3 --> F4
    F4 --> F5 --> F6 --> F7 --> F8
    F8 --> F9 --> F10 --> F11 --> F12
    F12 --> F13 --> F14 --> F15 --> F16

    classDef sprint fill:#2563eb,stroke:#1e40af,color:#fff
    classDef s2 fill:#059669,stroke:#047857,color:#fff
    classDef s3 fill:#ea580c,stroke:#c2410c,color:#fff
    classDef s4 fill:#7c3aed,stroke:#6d28d9,color:#fff

    class F1,F2,F3,F4 sprint
    class F5,F6,F7,F8 s2
    class F9,F10,F11,F12 s3
    class F13,F14,F15,F16 s4
```

---

## Phase 1 & 2 Dependency Graph

```mermaid
graph TB
    subgraph Phase1["Phase 1: Real Cosmetics Product (14 Subphases)"]
        direction TB
        P1_1["1.1 Constitution"] --> P1_2["1.2 Architecture"]
        P1_2 --> P1_3["1.3 Shared UI"]
        P1_3 --> P1_4["1.4 CMS/Services"]
        P1_4 --> P1_5["1.5 Homepage Engine"]
        P1_5 --> P1_6["1.6 Visual Foundation"]
        P1_6 --> P1_7["1.7 Homepage Redesign"]
        P1_7 --> P1_8["1.8 Storefront"]
        P1_8 --> P1_9["1.9 Commerce Flows"]
        P1_9 --> P1_10["1.10 Account"]
        P1_10 --> P1_11["1.11 Pharmacist"]
        P1_11 --> P1_12["1.12 Admin/CMS"]
        P1_12 --> P1_13["1.13 Mobile Parity"]
        P1_13 --> P1_14["1.14 Hardening"]
    end

    subgraph Phase2["Phase 2: SaaS Platform (8 Subphases)"]
        direction TB
        P2_1["2.1 SaaS Constitution"] --> P2_2["2.2 Tenancy Model"]
        P2_2 --> P2_3["2.3 Product vs Platform"]
        P2_3 --> P2_4["2.4 Branding Config"]
        P2_4 --> P2_5["2.5 Reusable Modules"]
        P2_5 --> P2_6["2.6 Platform Admin"]
        P2_6 --> P2_7["2.7 Deployment Strategy"]
        P2_7 --> P2_8["2.8 Regression Safety"]
    end

    P1_14 -->|Stable Baseline| P2_1

    classDef p1 fill:#2563eb,stroke:#1e40af,color:#fff
    classDef p2 fill:#059669,stroke:#047857,color:#fff
    classDef connector fill:#dc2626,stroke:#b91c1c,color:#fff

    class P1_1,P1_2,P1_3,P1_4,P1_5,P1_6,P1_7,P1_8,P1_9,P1_10,P1_11,P1_12,P1_13,P1_14 p1
    class P2_1,P2_2,P2_3,P2_4,P2_5,P2_6,P2_7,P2_8 p2
    class P1_14 connector
```

---

## Token System Hierarchy

```mermaid
graph TB
    Tokens["packages/tokens"] --> Colors["colors.xxx<br/>Primary: #222222<br/>Purchase: #a8000d<br/>Status colors"]
    Tokens --> Spacing["spacing.xxx<br/>Never raw numbers"]
    Tokens --> Radius["radius.xxx<br/>Never hardcoded"]
    Tokens --> Typography["typography.xxx<br/>Manrope (sans-serif only)<br/>14px/12px/10-11px scale"]
    Tokens --> Shadows["shadows.xxx<br/>9-level: xs→xl<br/>Semantic elevations"]
    Tokens --> Motion["motion.xxx<br/>300ms micro<br/>600ms page reveals"]

    classDef root fill:#7c3aed,stroke:#6d28d9,color:#fff
    classDef token fill:#0891b2,stroke:#0e7490,color:#fff

    class Tokens root
    class Colors,Spacing,Radius,Typography,Shadows,Motion token
```

---

## What You Already Have vs What You Need to Build

| Capability | Status | Effort |
|---|---|---|
| ✅ Block types + Zod schemas | **Done** — 20 types, discriminated union | — |
| ✅ Layout engine (block → slot → renderer) | **Done** — pure functions, desktop fusion | — |
| ✅ Query reference system | **Done** — block → query → product resolution | — |
| ✅ Release + publish readiness | **Done** — staging, validation, audit trail | — |
| ✅ Admin UI (functional) | **Done** — but needs rebuild for UX quality | Medium |
| ✅ Database (JSON → Prisma) | **Done** — 10 CMS tables, migration script ready | — |
| ✅ Auth middleware | **Done** — middleware.ts guards /admin/** (P0-1) | — |
| 🟡 Media service (sharp + S3) | **Not done** — raw fs uploads don't scale | Medium |
| ✅ CMS caching | **Done** — in-memory LRU cache, 3-min TTL, preview bypass (P0-2) | — |
| 🟡 Input sanitization | **Not done** — XSS risk on text fields | Low |
| 🟡 URL validation | **Not done** — accepts any string | Low |
| 🟡 Visual menu builder | **Not done** — JSON-only editing is poor UX | High |
| 🟡 RBAC with Prisma | **Not done** — basic session check only | Medium |
| 🟡 i18n on admin pages | **Not done** — hardcoded English | Low |
| 🟡 Rate limiting | **Not done** — public endpoint unprotected | Low |

**Total: 3 P0s + P1 done, 5 things to build, 15 things that already exist.** None of them require Strapi.

---

## P0 Fixes Applied — 2026-04-09

### P0-1: Auth Middleware Activated

**Problem:** `proxy.ts` contained solid auth logic (signed HMAC cookies, RBAC matrix, trusted request checks) but was named wrong — Next.js expects `middleware.ts`. Admin pages were unprotected at the edge.

**Fix:** Copied `proxy.ts` → `middleware.ts`. Next.js now executes the auth guard on every request:
- `/admin/**` → requires valid session cookie + admin panel role
- Unauthenticated → redirect to `/auth/login`
- Wrong role → redirect to `/`
- Pharmacist/customer routes → role-based routing

**Files changed:** `apps/next/middleware.ts` (new)

### P0-2: CMS Caching Layer Added

**Problem:** `getHomeCmsResponseData()` (~350 lines) hit all providers and all FS stores on every single request with zero caching. Every SSR page load = 5+ provider calls + 5 `fs.readFile` calls.

**Fix:** Three-layer caching:
1. **In-memory LRU cache** (`cms-cache.ts`) — 50 entries, 5-min TTL, tag-based invalidation
2. **Cached entry point** (`getCachedHomeCmsResponseData`) — wraps the existing function with cache read/write, preview bypass
3. **All callers updated** — home-page, search, product, orders, pharmacist services all use cached version

**Cache behavior:**
- Non-preview requests: cached by `locale:storeId:environment`, 3-minute TTL
- Preview requests: always bypass cache
- On publish: `invalidateCmsCache()` flushes related entries

**Files changed:**
- `apps/next/server/services/home/cms-cache.ts` (new)
- `apps/next/server/services/home/home-cms.service.ts` (added cached entry point)
- `apps/next/server/services/home/home-page.service.ts` (use cached)
- `apps/next/server/services/search/search.service.ts` (use cached)
- `apps/next/server/services/product/product-page.service.ts` (use cached)
- `apps/next/server/services/orders/order-detail.service.ts` (use cached)
- `apps/next/server/services/pharmacist/pharmacist-bootstrap.service.ts` (use cached)

### P1: JSON Stores → Prisma + PostgreSQL

**Problem:** All CMS data (banners, UGC, site config, admin controls, audit logs) stored in JSON files on disk. No concurrent write safety, no transactions, no queries, no scaling.

**Fix:** Extended existing Prisma schema with 10 new CMS tables:
- `CmsSiteConfig` — site-wide branding, top bar, footer, search config (singleton)
- `CmsTickerSettings` — ticker speed (singleton)
- `CmsTickerItem` — scrolling ticker messages
- `CmsEducationBanner` — education banners
- `CmsUgcItem` — user-generated content gallery
- `CmsToggleOverride` — admin toggle overrides
- `CmsBrandSpotlight` — brand spotlight blocks (JSON payload)
- `CmsOfferBanner` — offer banner blocks (JSON payload)
- `CmsAuditLog` — admin operation audit trail

Updated 4 store modules to use Prisma:
- `admin-banners-store.ts` — reads 3 tables in parallel, writes via transaction
- `admin-ugc-store.ts` — reads/writes `CmsUgcItem` table
- `admin-site-config-store.ts` — reads/writes `CmsSiteConfig` singleton
- `admin-controls-store.ts` — reads 4 tables in parallel, writes toggles/spotlights/banners/audits via transaction

**Migration:** `apps/next/scripts/migrate-cms-data.ts` — safe, idempotent script to transfer JSON → DB. Run after `npx prisma migrate deploy`.

**Remaining JSON files:** User overrides (part of identity system, future migration), page-version store (complex release system, future migration).

**Files changed:**
- `apps/next/prisma/schema.prisma` (10 new models)
- `apps/next/prisma/migrations/20260409000000_cms_entities_replace_json_stores/migration.sql` (new)
- `apps/next/server/lib/prisma.ts` (new — Prisma singleton)
- `apps/next/app/api/_lib/admin-banners-store.ts` (use Prisma)
- `apps/next/app/api/_lib/admin-ugc-store.ts` (use Prisma)
- `apps/next/app/api/_lib/admin-site-config-store.ts` (use Prisma)
- `apps/next/app/api/_lib/admin-controls-store.ts` (use Prisma)
- `apps/next/scripts/migrate-cms-data.ts` (new — data migration script)

---

*Generated: 2026-04-09 | Sources: QWEN.md, AGENTS.md, plan.md, requirements.md, CMS audit*
*P0s fixed: Auth + Caching + Prisma CMS storage. Next: Media service (sharp + S3) or UX polish.*
