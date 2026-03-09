# LuxeGlow Market - Comprehensive Technical Documentation

**Version:** 1.0  
**Last Updated:** March 2, 2026  
**Framework:** Solito v5 (Expo + Next.js)  
**Architecture:** Monorepo with Turborepo

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Monorepo Structure](#monorepo-structure)
6. [Design System](#design-system)
7. [Core Patterns](#core-patterns)
8. [Development Workflow](#development-workflow)
9. [API Architecture](#api-architecture)
10. [Security & Environment](#security--environment)
11. [Quality Assurance](#quality-assurance)
12. [Deployment](#deployment)

---

## Executive Summary

LuxeGlow Market is a **premium cross-platform commerce platform** built with a web-first approach, delivering a luxury shopping experience across web (Next.js) and mobile (Expo). The architecture emphasizes:

- **Replaceable backend integrations** via adapter pattern
- **RTL support** for English/Arabic localization
- **CMS-driven content** with localized fields
- **Premium visual design** with strict design token governance
- **Clean architectural boundaries** between core commerce and extension modules

---

## Project Overview

### Business Purpose

A luxury cosmetics and beauty products marketplace featuring:

- **Customer-facing storefront** (Web + Mobile)
- **Pharmacist consultation workflow** (Web tablet-optimized)
- **Admin dashboard** for operations management
- **CMS integration** for marketing content

### Key Features

| Feature | Description |
|---------|-------------|
| Product Catalog | Browse by category, brand, with advanced filtering |
| Shopping Cart | Persistent cart with toast/drawer interactions |
| Checkout | Multi-step checkout with delivery/pickup options |
| Loyalty Program | Points-based rewards system |
| Diagnostics | Skin/health consultation sessions |
| Pharmacist Consult | Professional consultation booking |
| Multi-language | Full RTL support (EN/AR) |
| Admin Dashboard | Order management, CMS toggles, user controls |

---

## Architecture

### Architectural Principles

```
P0 (Blocker Rules - Must Pass Before Merge):
├── Tokens over hardcoded values
├── Adapters over direct external calls
├── Modules over embedded feature logic
├── Slots over hardcoded injection points
└── Config/CMS over code for mutable business rules
```

### Canonical Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                         UI Layer                         │
│                    (@real/app, @real/ui)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      API Client                          │
│              (packages/app/lib/api-client.ts)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    BFF Layer (Next.js)                   │
│                  apps/next/app/api/**                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Provider Registry                      │
│              (packages/providers/registry.ts)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      Adapters                            │
│         (packages/adapters/mock, cms-strapi, etc.)       │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. UI Layer (`@real/ui`)
- **Purpose:** Shared primitives and components
- **Allowed:** UniWind styling, token imports
- **Forbidden:** Business logic, provider/adapter imports, `process.env`

#### 2. Core Commerce (`@real/app`)
- **Purpose:** Shared screens, features, domain logic
- **Allowed:** Provider imports via registry, apiClient
- **Forbidden:** Direct adapter imports, `process.env`, `className`

#### 3. BFF Layer (`apps/next/app/api`)
- **Purpose:** Backend-for-Frontend API routes
- **Allowed:** Provider imports, response normalization
- **Forbidden:** Direct adapter imports, raw error exposure

#### 4. Providers (`@real/providers/contracts`)
- **Purpose:** Interface definitions and result contracts
- **Pattern:** `ProviderResult<T>` envelope with `ok/fail` handlers

#### 5. Adapters (`@real/adapters`)
- **Purpose:** External system implementations
- **Examples:** Mock, Strapi CMS, Odoo ERP, payment gateways
- **Rule:** Never imported directly by UI/core/BFF

---

## Technology Stack

### Core Frameworks

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI library |
| Next.js | 15 | Web app + BFF |
| Expo | SDK 53 | Mobile app |
| Solito | v5 | Cross-platform navigation |
| React Navigation | 7 | Mobile navigation |
| TypeScript | 5.2+ | Type safety |

### Styling & Design

| Technology | Version | Purpose |
|------------|---------|---------|
| UniWind | 1.3.2 | Styling engine |
| Tailwind CSS | 4.1.13 | Utility classes |
| Moti | - | Animations |
| Cairo Font | - | Arabic/Latin typography |

### Development Tools

| Tool | Purpose |
|------|---------|
| Turborepo | Monorepo build orchestration |
| Yarn 4.7.0 | Package manager |
| ESLint | Code linting |
| Ripgrep | Guard scan searches |

### Backend Integrations (via Adapters)

| System | Purpose |
|--------|---------|
| Strapi | CMS for marketing content |
| Odoo | ERP for products/orders |
| Mock Adapters | Development/testing |

---

## Monorepo Structure

```
my-solito-app/
├── apps/
│   ├── next/                    # Web app + BFF
│   │   ├── app/
│   │   │   ├── api/            # BFF routes
│   │   │   ├── (routes)/       # Page routes
│   │   │   ├── layout.tsx      # Root layout (RTL setup)
│   │   │   └── page.tsx        # Home page
│   │   ├── apiClient.ts        # Next.js API client
│   │   ├── proxy.ts            # Middleware for role routing
│   │   └── next.config.js
│   │
│   ├── expo/                   # Mobile app
│   │   ├── app/                # Screen routes
│   │   ├── App.tsx             # Entry point
│   │   ├── app.json            # Expo config
│   │   └── tailwind.config.js
│   │
│   └── strapi/                 # CMS (if self-hosted)
│
├── packages/
│   ├── app/                    # Shared screens + features
│   │   ├── screens/            # Screen components
│   │   ├── features/           # Feature modules
│   │   │   ├── home/
│   │   │   ├── product/
│   │   │   ├── shell/          # Header/Footer/Layout
│   │   │   └── user/
│   │   ├── lib/
│   │   │   ├── api-client.ts   # Typed API factory
│   │   │   ├── endpoints.ts    # Endpoint definitions
│   │   │   └── types.ts        # API types
│   │   ├── navigation/         # Solito navigation helpers
│   │   ├── provider/           # React providers (web/noop)
│   │   └── index.ts            # Public exports
│   │
│   ├── ui/                     # Design system
│   │   ├── components/         # Composite components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── SectionHeading.tsx
│   │   ├── primitives/         # Low-level primitives
│   │   │   ├── Box.tsx
│   │   │   ├── Text.tsx
│   │   │   └── Container.tsx
│   │   ├── layout/             # Layout utilities
│   │   ├── reusables/          # High-level compositions
│   │   ├── UI_RULES.md         # UI governance rules
│   │   └── index.ts
│   │
│   ├── tokens/                 # Design tokens
│   │   ├── colors.ts           # HSL color palette
│   │   ├── spacing.ts          # 8px rhythm scale
│   │   ├── typography.ts       # Type scale + roles
│   │   ├── radius.ts           # Border radius (0-4px)
│   │   ├── shadows.ts          # Elevation tokens
│   │   ├── elevation.ts        # Shadow recipes
│   │   ├── motion.ts           # Animation durations
│   │   └── index.ts
│   │
│   ├── providers/
│   │   ├── contracts/          # Provider interfaces
│   │   │   ├── types.ts        # ProviderResult<T>
│   │   │   ├── ProductProvider.ts
│   │   │   ├── CartProvider.ts
│   │   │   ├── OrderProvider.ts
│   │   │   ├── AuthProvider.ts
│   │   │   ├── CMSProvider.ts
│   │   │   └── ...
│   │   ├── registry.ts         # Adapter selection logic
│   │   └── index.ts
│   │
│   └── adapters/
│       ├── mock/               # Mock implementations
│       │   ├── product/
│       │   ├── cart/
│       │   ├── order/
│       │   ├── auth/
│       │   └── cms/
│       ├── cms-strapi/         # Strapi CMS adapter
│       └── index.ts
│
├── tools/
│   ├── inspector/              # Dev tools
│   └── ...
│
├── scripts/
│   └── guard-checks.sh         # Architecture enforcement
│
├── docs/
│   ├── UI_ARCHITECTURE.md      # UI spec (pixel contract)
│   └── ...
│
├── AGENTS.md                   # AI agent execution policy
├── package.json                # Root workspace
├── tsconfig.json               # Path aliases
├── turbo.json                  # Turborepo config
└── .env.example                # Environment template
```

---

## Design System

### Token Categories

All visual values **must** come from tokens. Hardcoded values are forbidden.

#### Colors (`packages/tokens/colors.ts`)

```typescript
export const colors = {
  // Base surfaces
  background: 'hsl(0 0% 100%)',
  backgroundSecondary: 'hsl(0 0% 98%)',
  surface: 'hsl(0 0% 100%)',
  
  // Text
  text: 'hsl(0 0% 0%)',
  textPrimary: 'hsl(0 0% 0%)',
  textSecondary: 'hsl(0 0% 33%)',
  mutedText: 'hsl(0 0% 33%)',
  
  // Brand
  primary: 'hsl(0 0% 0%)',
  secondary: 'hsl(358 74% 50%)',  // Red accent
  brandPrimary: 'hsl(358 74% 50%)',
  brandPrimaryHover: 'hsl(358 74% 44%)',
  
  // Status
  success: 'hsl(162 100% 39%)',
  warning: 'hsl(40 100% 50%)',
  danger: 'hsl(358 100% 42%)',
  error: 'hsl(358 100% 42%)',
}
```

**Color Rules:**
- HSL format only (for tone control)
- No HEX values in component code
- Red accent reserved for:
  - Primary CTAs
  - Discount badges
  - Critical highlights

#### Typography (`packages/tokens/typography.ts`)

```typescript
export const typography = {
  // Five-tier hierarchy
  displayTier: 36,      // Hero headlines
  headlineTier: 32,     // Section titles
  subHeadlineTier: 20,  // Subheaders
  bodyTier: 16,         // Body copy
  captionTier: 12,      // Meta text
  
  // Semantic roles
  bodySm: 14,
  bodyMd: 16,
  bodyLg: 18,
  hero: 48,
  price: 20,
  nav: 13,
  label: 12,
  footer: 13,
}
```

**Typography Rules:**
- Maximum 3 typography roles per component
- Price must be visually dominant in commerce components
- Heading > Body > Caption hierarchy enforced
- No arbitrary pixel sizes

#### Spacing

```typescript
export const spacing = {
  xs: 4,    // Micro gaps
  sm: 8,    // Internal component gaps
  md: 16,   // Card internal spacing
  lg: 24,   // Section spacing
  xl: 32,   // Large section gaps
  '2xl': 48,
  '3xl': 64,
}
```

**Spacing Rules:**
- 8px rhythm baseline
- Internal spacing < External spacing
- Section spacing ≥ lg (24px)

#### Radius

```typescript
export const radius = {
  sm: 2,    // Subtle rounding
  md: 4,    // Default elevated surfaces
  lg: 6,    // Rare, large containers
}
```

**Radius Rules:**
- Maximum 4px for most components
- Prefer 0-2px for containers
- No 12px+ rounded cards

---

## Core Patterns

### 1. Provider Pattern

Provider contracts define interfaces without implementation:

```typescript
// packages/providers/contracts/ProductProvider.ts
export interface ProductProvider {
  list(filters?: ProductFilter): Promise<ProviderResult<Product[]>>
  get(id: string): Promise<ProviderResult<Product>>
}

// packages/providers/contracts/types.ts
export type ProviderResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }
```

### 2. Adapter Pattern

Adapters implement provider contracts:

```typescript
// packages/adapters/mock/product/index.ts
export const mockProductAdapter: ProductProvider = {
  async list(filters) {
    return { ok: true, data: mockProducts }
  },
  async get(id) {
    return { ok: true, data: mockProduct }
  },
}
```

### 3. Provider Registry

Registry selects adapter based on environment:

```typescript
// packages/providers/registry.ts
const useMock = process.env.USE_MOCK !== 'false'

export const productProvider = useMock
  ? mockProductAdapter
  : odooProductAdapter  // When available
```

### 4. BFF Response Normalization

All BFF routes return standardized envelope:

```typescript
// apps/next/app/api/_lib/response.ts
export function ok<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function fail(code: string, message: string, status = 500) {
  return Response.json(
    { success: false, error: { code, message } },
    { status }
  )
}
```

### 5. Extension Slot Pattern

Modules inject UI via explicit slots:

```typescript
// packages/app/platform/extensions/slots.ts
export type CheckoutExtension = ComponentType
export const checkoutExtensions: CheckoutExtension[] = []

// Module registration:
checkoutExtensions.push(LoyaltyRedeemPanel)

// Rendering:
{checkoutExtensions.map((Ext, i) => <Ext key={i} />)}
```

### 6. API Client Factory

```typescript
// packages/app/lib/api-client.ts
export const createApiClient = (cfg: { baseUrl: string }) => {
  const baseUrl = normalizeBaseUrl(cfg.baseUrl)
  
  return {
    products: {
      list: (filters) => request<Product[]>(endpoints.productsFiltered(filters)),
      get: (id) => request<Product>(endpoints.product(id)),
    },
    cart: {
      get: () => request<Cart>(endpoints.cart),
      add: (id, qty) => request<Cart>(endpoints.cartAdd, { method: 'POST' }),
    },
  }
}
```

### 7. RTL Support

**Next.js (Web):**
```typescript
const locale = acceptLanguage.split(',')[0]
const dir = locale.startsWith('ar') ? 'rtl' : 'ltr'
return <html lang={locale} dir={dir}>
```

**Expo (Mobile):**
```typescript
I18nManager.allowRTL(isRTL)
I18nManager.forceRTL(isRTL)
```

---

## Development Workflow

### Installation

```bash
yarn  # Install all dependencies
```

### Development Commands

```bash
yarn web:dev    # Next.js dev server
yarn native     # Expo dev server
yarn web        # Build for production
yarn guard:checks  # Run architecture scans
```

### Adding Dependencies

**Pure JS (cross-platform):**
```bash
cd packages/app && yarn add date-fns && cd ../.. && yarn
```

**Native libraries:**
```bash
cd apps/expo && yarn add react-native-reanimated && cd ../.. && yarn
```

---

## API Architecture

### BFF Routes

```
apps/next/app/api/
├── products/       # GET /api/products
├── cart/           # POST /api/cart/add
├── checkout/       # POST /api/checkout/quote
├── orders/         # GET /api/orders
├── auth/           # POST /api/auth/login
├── account/        # GET /api/account/overview
├── admin/          # POST /api/admin/cache
└── pharmacist/     # POST /api/pharmacist/submit
```

### Environment Variables

```bash
USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
AUTH_SESSION_SECRET=change-me-in-production
STRAPI_URL=
ODOO_URL=
```

---

## Security & Environment

### Security Rules

1. **No secrets in client code** - `*_SECRET` vars forbidden in shared packages
2. **No hardcoded credentials** - All URLs/tokens from environment
3. **Response sanitization** - BFF normalizes all errors
4. **Role-based routing** - Middleware restricts admin/pharmacist routes

### Guard Scans

```bash
yarn guard:checks
```

Checks: No `className` in app, no `process.env` in shared, no adapter imports in UI, no hex colors, no deprecated Solito props.

---

## Quality Assurance

### Component States

Every UI component must define:
- `loading` - Data fetching
- `empty` - No data
- `error` - Error with recovery
- `disabled` - Interactive disabled
- `out-of-stock` - Product unavailable

### RTL Validation

All UI blocks validated in both LTR and RTL modes.

---

## Deployment

### Vercel (Web)

```bash
yarn web  # Build
# Deploy apps/next/.next
```

### Expo (Mobile)

```bash
cd apps/expo
eas build --profile production
```

---

## Appendix: Role Definitions

| Role | Platforms | Routes |
|------|-----------|--------|
| Customer | Web + Mobile | `/`, `/shop`, `/cart`, `/account` |
| Pharmacist | Web only | `/pharmasset/*` |
| Admin | Web only | `/admin/*` |

---

**End of Documentation**
