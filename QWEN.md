# QWEN.md — Solito v5 Premium Cosmetics Commerce Platform

## Project Overview

A **cross-platform cosmetics commerce platform** built as a Solito v5 monorepo, powering **Real Cosmetics** — a high-density, commercial beauty marketplace with ~15,000 products across many brands. The system serves both web (Next.js 16 App Router) and mobile (Expo 54 React Native) from a shared codebase.

**Brand Direction:** Mass-market commercial beauty (reference: niceonesa.com). Sans-serif-led, dense, conversion-oriented UI — NOT luxury-editorial (anti-references: Aesop, Glossier).

### Tech Stack

| Layer | Technology |
|---|---|
| **Web** | Next.js 16 (App Router), React 19, Uniwind, Tailwind CSS 4 |
| **Mobile** | Expo 54, React Native 0.81, Reanimated 4, Uniwind |
| **Shared UI** | React Native primitives → DOM via Uniwind (RNR-centered) |
| **State** | Server-first (services → providers → adapters) |
| **Database** | Prisma (ORM) |
| **Package Manager** | Yarn 4.13 (workspaces) |
| **Build Orchestration** | Turbo |
| **i18n** | i18next + Crowdin (EN/AR with RTL support) |

---

## Monorepo Structure

```
apps/
  next/         — Next.js web app + server layer (services, route handlers, server actions)
  expo/         — React Native mobile app (Expo)
  strapi/       — (excluded from workspaces)

packages/
  app/          — Shared screens, features, business logic (web + native)
  ui/           — Shared RNR-centered component system
    reusables/    — Core shared control layer (cva + className, Tailwind/Uniwind variants)
    components/   — Product-facing shared UI (inline token styles)
    primitives/   — Legacy API surface (do not grow)
    responsive/   — useBreakpoint(), layout profiles
  tokens/       — Design tokens (colors, spacing, typography, radius, shadows, motion, etc.)
  providers/    — Provider contracts + registry
  adapters/     — External integrations (all mock data today)
```

### Canonical Data Flow

```
UI (Server + Client Components)
  → apps/next/server/services
  → packages/providers (registry)
  → packages/adapters (mock today, real later)
```

### Canonical UI Flow

```
Shared UI Consumers
  → packages/ui/components
  → packages/ui/reusables
```

---

## Key Commands

### Development

```bash
yarn web              # Start Next.js dev (stable mode, with dev-stable script)
yarn web:prod         # Build and start production server
yarn web:dev:raw      # Raw Next.js dev with webpack
yarn expo             # Start Expo mobile app
yarn native           # Alias for expo start
```

### Verification (REQUIRED after every change)

```bash
yarn guard:checks     # Catches: token violations, forbidden imports, className leaks, hardcoded strings
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false  # TypeScript check
```

**Do not proceed until both pass clean.**

### Build (when touching Next.js architecture)

```bash
cd apps/next && next build --webpack --debug-prerender
```

### i18n

```bash
yarn i18n:extract         # Extract strings with i18next-parser
yarn i18n:crowdin:push    # Push to Crowdin
yarn i18n:crowdin:mt      # Run Crowdin machine translation
yarn i18n:crowdin:pull    # Pull translations from Crowdin
yarn i18n:types           # Generate type definitions
yarn i18n:check           # Check i18n completeness
yarn i18n:guard:hardcoded # Check for new hardcoded user-facing strings
yarn i18n:guard:baseline  # Update hardcoded string baseline
```

### Data

```bash
yarn data:generate:mock-erp-products   # Generate mock ERP product data
```

### Codex (AI-assisted workflow)

```bash
yarn codex:route          # Route a task through .codex system
yarn codex:review         # Review current changes
yarn codex:fix            # Fix guard/review findings
yarn codex:guard          # Version check + guard:checks
```

---

## Architecture Rules (Non-Negotiables)

### Core Principles

- **Tokens over hardcoded values** — always use design tokens
- **Adapters over direct external calls** — external integrations go through adapters
- **Providers over adapter imports** — services import providers, not adapters
- **Server layer owns all data access** — no client-side API calls when server can own them
- **CMS controls content, not layout** — layout-as-data pattern
- **Do not reintroduce public `Touchable`-style legacy primitives** into the active shared UI contract

### Forbidden Patterns

| Pattern | Reason |
|---|---|
| `apiClient` in Server Components | Server must use services, not HTTP client |
| Direct adapter imports in UI | UI imports providers, not adapters |
| `className` in `packages/app` | App layer uses inline token styles |
| `process.env` in `packages/app` or `packages/ui` | No env access in shared packages |
| Hex literals (`#hex`) in shared UI | Must use tokens from `@real/tokens` |
| `Platform.OS` outside `useBreakpoint.ts` | Single source of truth for platform branching |
| `Touchable` in active shared components | Legacy primitive, replaced by RNR patterns |
| Server Components calling internal Route Handlers | Use services directly |
| External BFF layer | Next.js IS the server layer |

### Allowed Patterns

| Pattern | Where |
|---|---|
| Server Components fetching via services | `apps/next/server/services` |
| Route Handlers (thin transport) | `apps/next/app/api/**` |
| Server Actions (delegating to services) | Next.js server actions |
| Cache Components with tagged caching | Public reads in Next.js |
| Client islands | Mutations, browser-only state |

---

## Next.js Rules (P0)

### Allowed

- Server Components fetching data through `apps/next/server/services`
- Route Handlers under `app/api`
- Server Actions only when they delegate to services
- Cache Components and tagged caching for safe public reads
- Client islands for mutations, browser-only state, and UI interactions

### Forbidden

- Server Components calling internal Route Handlers over HTTP
- Reintroducing `apiClient` in Server Components
- Direct adapter usage in UI
- External API calls from the client when the server layer should own them
- External BFF layer

### Cache Components Rules

- Keep `cacheComponents` enabled
- Fix request-bound rendering with lower `Suspense` boundaries and nested async server components
- Do not use old dynamic-route shortcuts that conflict with Cache Components
- Keep request-bound flows dynamic only where they actually need request state

---

## Shared UI Rules (P0)

### Active Contract

- The active shared UI system is full RNR-centered
- `packages/ui/reusables` is the core shared control layer
- `packages/ui/components` is the product-facing shared UI layer
- `packages/ui/primitives` must not grow new legacy API surface

### Forbidden

- Reintroducing public `Touchable` usage in active shared components
- Reintroducing old primitive-only contracts when an RNR shared component already exists
- Bypassing tokens in shared UI

---

## Token System

All design values flow through `packages/tokens/`:

| Token Type | Source | Usage |
|---|---|---|
| **Colors** | `colors.xxx` from `@real/tokens` | Inline: `colors.primary`; Reusables: `bg-primary` className |
| **Spacing** | `spacing.xxx` | Never raw numbers |
| **Radius** | `radius.xxx` | Never hardcoded |
| **Typography** | `typography.xxx`, `fontWeights.xxx`, `lineHeights.xxx` | Sans-serif only (Manrope) |
| **Shadows** | `shadows.xxx` (9-level: xs→xl) | Semantic elevation aliases |
| **Motion** | `motion.xxx` | 300ms micro, 600ms page reveals |

### Typography Scale (Phase 1 — Dense Commercial)

All sizes are compact for efficient scanning:
- Headlines: 14px
- Body/UI text: 12px
- Labels/meta: 10-11px
- Font: Manrope (sans-serif only)

### Color Palette

- **Primary CTA:** `#222222` (dark neutral) with white text
- **Purchase intent:** `#a8000d` (deep blood red — reserved for buy/add-to-cart)
- **Shell surfaces:** `#f9f9f9`, `#ffffff`, `#f3f3f3` (light neutral)
- **Status:** Green (success), Gold (warning), Red (danger/error/sale), Blue (info)

---

## Layout-As-Data

Flow:
```
CMS → Server Layer → Normalized Blocks → UI
```

---

## Routing

- Use Next.js App Router under `apps/next/app`
- Use `proxy.ts` for routing/auth/locale entry behavior
- Keep root layout compatible with Cache Components

---

## Removed / Disallowed

- Public `Touchable` shared UI contract
- Server-side `apiClient`
- External BFF

---

## Layer Responsibilities

### `apps/next`

Owns:
- Server Components
- Route Handlers
- Server Actions
- `server/services`

Rules:
- Import providers, not adapters
- Normalize server data
- Keep page reads in services
- Keep route handlers thin

### `packages/app`

Owns shared screens and logic.

Rules:
- No adapters
- No `process.env`
- No `className`

### `packages/ui`

Owns pure UI, shared reusable controls, product-facing shared components.

### `packages/providers`

Owns contracts and registry.

### `packages/adapters`

Owns external integrations only.

---

## Services Layer

Location: `apps/next/server/services/`

Responsibilities:
- Business logic
- Provider calls
- Shared server composition
- Reusable read and mutation orchestration

Services import from providers (not adapters), normalize data, and return typed results.

---

## Shared UI Component Guide

### Decision: Where to create?

| What | Location |
|---|---|
| Reusable control (button, input, badge) | `packages/ui/reusables/` |
| Product-facing UI section (rail, card, banner) | `packages/ui/components/` |
| Homepage CMS block renderer | `packages/app/features/home/renderers/` |
| Shared screen (web + native) | `packages/app/screens/` |
| Web-only page | `apps/next/app/[locale]/` |
| Native-only screen | `apps/expo/app/` |

### Creating `packages/ui/components/MyComponent.tsx`

1. Create `MyComponent.tsx` using React Native primitives: `Box`, `Text`, `Image`, `Pressable`
2. Style with inline tokens only: `colors.xxx`, `spacing.xxx`, `typography.xxx`, `radius.xxx`
3. **No** `className`, **no** hex, **no** hardcoded px/rgba, **no** `Platform.OS`
4. Use `useBreakpoint()` from `@real/ui/responsive` for responsive layout decisions
5. For native-only scroll/gesture differences: create `MyComponent.native.tsx` alongside
6. Export from `packages/ui/components/index.ts`

### Creating `packages/ui/reusables/MyControl.tsx`

- Uses `cva` + `className` for Tailwind/Uniwind variants (web + native via Uniwind)
- Uses token class names: `bg-primary`, `text-foreground`, `rounded-none`
- **No** hex in className strings — use CSS token vars (`bg-primary-hover`) defined in `global.css`
- Export from `packages/ui/reusables/index.ts` if one exists, or import directly

### Adding a New Homepage CMS Block Type

1. Define `MyNewBlock` with `type: 'my_new_block'` literal in `packages/app/lib/cms/blocks.ts` → add to `HomeBlock` union
2. Create renderer in `packages/app/features/home/renderers/renderMyNewBlock.tsx`:
   - Props: `{ slot: IndependentRenderSlot, ...callbacks }`
   - Type guard: `if (block.type !== 'my_new_block') return null`
   - Map block data → UI component from `packages/ui/components/`
3. Wire into `HomeBlocksRenderer.tsx` dispatcher — import the renderer, add dispatch case in `dispatchHomeRenderer`
4. Add mock data in `packages/adapters/mock/`
5. Run `yarn guard:checks` + `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`

### Token Enforcement (guard:checks)

- `packages/app` and `packages/ui` TypeScript files: no hex literals, no `className`, no `process.env`
- Inline styles: always `colors.xxx`, `spacing.xxx`, `radius.xxx` from `@real/tokens`
- className-based (reusables): use Tailwind token classes, no arbitrary hex values `bg-[#hex]`
- Radius: always use `radius.xxx` from `@real/tokens` — never hardcode values

### Cross-Platform Guarantee

Anything in `packages/` renders on both web (Next.js) and native (Expo).
- React Native primitives → DOM elements on web via Uniwind
- `useBreakpoint()` is the only place `Platform.OS` may live
- Same component, zero duplication, both platforms

---

## Homepage Layout Engine

The homepage is CMS-driven through a layout-as-data pattern:

```
CMS → Server Layer → Normalized Blocks → UI
```

### Block Pipeline

```
HomeScreen
  ├── hasPublishedBlocks → HomeBlocksRenderer
  │     ├── useBreakpoint() → LayoutProfile
  │     ├── buildHomeLayout(rawBlocks, profile) → ResolvedRenderSlot[]
  │     └── dispatchHomeRenderer(slot) → typed renderer per block type
  └── no blocks → HomeLegacyScreen (fallback)
```

### Supported Block Types

`hero`, `hero_carousel`, `product_slider`, `brand_promo`, `promo_strip`, `category_shortcuts`, `offer_stack`, `sticky_listing_promo`, `flash_sale`, `brand_spotlight`, `offer_banners`, `education_banner`, `newsletter_cta`, `top_brands`, `ugc_gallery`, `personalized_rail`, `editorial_hotspot`, `pdp_offer_cluster`, `cart_upsell_rail`

### Key Files

- `packages/app/lib/cms/blocks.ts` — Block type definitions + Zod schemas
- `packages/app/features/home/HomeBlocksRenderer.tsx` — Main dispatcher
- `packages/app/features/home/renderers/` — Individual block renderers
- `apps/next/server/services/home/` — SSR data services
- `apps/next/app/page.tsx` — Homepage entry point

---

## Server Services Layer

Location: `apps/next/server/services/`

| Service | Responsibility |
|---|---|
| `account/` | User account, addresses, test history |
| `admin/` | Admin dashboard data, catalog management |
| `cart/` | Shopping cart operations |
| `catalog/` | Products, categories, brands |
| `checkout/` | Checkout flow, quotes, order placement |
| `home/` | Homepage layout data, CMS blocks |
| `orders/` | Order history and detail |
| `pharmacist/` | Pharmacist dashboard, customer lookup, test review |
| `product/` | Product detail, PDP data |
| `search/` | Search results, suggestions |

Services import from providers (not adapters), normalize data, and return typed results.

---

## i18n & RTL

- **Languages:** English (EN) and Arabic (AR)
- **RTL:** Full RTL support via `rtl-manager.ts` / `rtl-manager.native.ts`
- **Translation pipeline:** i18next extraction → Crowdin MT → pull back
- **Guard:** Hardcoded user-facing strings are flagged by `yarn i18n:guard:hardcoded`

---

## Accessibility

Target: **WCAG AA** compliance

- Contrast ratios: 4.5:1 normal text, 3:1 large text/UI
- Touch targets: minimum 44×44px
- Reduced motion: respected across all animations
- Color not sole indicator of state

---

## Development Conventions

### Coding Style

- **Prettier:** 2-space indent, no semicolons, single quotes
- **TypeScript:** Strict mode, `strictNullChecks`, `noUncheckedIndexedAccess`
- **Imports:** Use monorepo path aliases (`@real/ui`, `@real/tokens`, etc.)
- **No hex literals** in shared packages — always use tokens
- **No className** in `packages/app` — use inline token styles

### Testing

- API route tests in `apps/next/app/api/**/route.test.ts`
- Component tests in `packages/ui/components/**/*.test.ts`
- Contract tests in `packages/app/screens/*.test.ts`

### Git Workflow

- Branch naming: descriptive (e.g., `001-constitution-spec-backfill`)
- Use Spec Kit workflow for feature development: `/speckit.constitution` → `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`

---

## Spec Kit — Brownfield Mode

This project uses **Spec Kit** across two top-level phases:

### Phase 1: Real Cosmetics Commerce Product (14 subphases)
Constitution → Architecture baseline → Shared UI → CMS → Homepage engine → Visual redesign → Storefront → Commerce flows → Account → Pharmacist/test → Admin → Mobile parity → Hardening

### Phase 2: SaaS Platform (8 subphases)
Additive platform layer that must NOT modify or break Phase 1 behavior.

**Rule:** Phase 2 extends the system without changing Phase 1 business behavior.

---

## Memory Files

These files maintain session context across agent restarts:

- `SESSION-STATE.md` — Active working memory (current task, open questions, key files)
- `RECENT_CONTEXT.md` — Auto-updated recent context (last session summary)
- `MEMORY.md` — Long-term decisions and conventions
- `plan.md` — Full Spec Kit execution plan
- `requirements.md` — Phase requirements specification
- `.impeccable.md` — Design context and aesthetic direction

**Update these after every substantial change.**

---

## Verification Checklist (Definition of Done)

### Minimum
- [ ] `yarn guard:checks` passes (no token/class/env/hex violations)

### When changing `apps/next` architecture/build behavior
- [ ] `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` passes
- [ ] `next build --webpack --debug-prerender` from `apps/next`

### Full Definition of Done
- [ ] Guards pass
- [ ] Required type/build verification passes for the touched layer
- [ ] Data flows via the server layer
- [ ] Shared UI respects the active RNR contract
- [ ] Memory files updated after substantial work

---

## Token Efficiency — Parallel Agent Dispatch

**Mandatory for all agentic AI executing multi-file implementation tasks in this repo.**

### The Rule

Pre-read all required context before dispatching agents. Then dispatch one agent per file in parallel — each agent receives a self-contained prompt with only the context it needs. Agents must never explore the codebase speculatively.

### Protocol

1. The orchestrating agent reads the relevant existing files first (narrow, targeted reads only)
2. Relevant snippets are extracted and pasted directly into each sub-agent prompt
3. Each sub-agent is given exact file content to write — no ambiguity, no open-ended search
4. All sub-agents are launched in parallel (`run_in_background: true` where supported)
5. After all complete, the orchestrator spot-checks key lines only — no full re-reads

### Forbidden

- Telling an agent to "explore the codebase and figure out what to write"
- Putting multiple output files in one agent prompt
- Doing sequential multi-file work in the main context when parallel dispatch is possible
- Agents writing to overlapping files (causes conflicts)

### Why This Matters

Each sub-agent's token usage is isolated from the main context. Parallel dispatch solves N files in the time of 1 file. The orchestrator context stays lean for coordination and verification only. This preserves output quality while minimizing quota consumption.

---

## Agent Source Of Truth (P0)

### Mandatory Startup Protocol

At the start of every new conversation, before searching the repo or opening arbitrary files, agents must:

1. **Check memory files** — read `SESSION-STATE.md`, `RECENT_CONTEXT.md`, and `MEMORY.md` for current context
2. Read `AGENTS.md`
3. Read `docs/architecture-index.md`
4. Read `graphify-out/GRAPH_REPORT.md`
5. Choose the smallest matching bounded-context graph under `graphify-out/contexts/`
6. Read that context's `GRAPH_REPORT.md` or `wiki/index.md`
7. Only then search raw files inside that narrowed context

This startup protocol is mandatory unless the user explicitly asks to ignore repo guidance.

### Navigation Order

All agents should build context in this order:

1. **Memory files** (`SESSION-STATE.md`, `RECENT_CONTEXT.md`, `MEMORY.md`)
2. `AGENTS.md`
3. `docs/architecture-index.md`
4. `graphify-out/GRAPH_REPORT.md`
5. The smallest matching bounded-context graph under `graphify-out/contexts/`
6. Raw files inside that narrowed context only

### Bounded Context Graphs

| Context | Path | Start Here When |
|---|---|---|
| `apps-next-api` | `graphify-out/contexts/apps-next-api/` | exploring route handlers, auth/session, admin APIs, BFF entry points |
| `apps-next-services` | `graphify-out/contexts/apps-next-services/` | exploring server services, orchestration, provider-backed business logic |
| `packages-providers` | `graphify-out/contexts/packages-providers/` | exploring contracts, registry, provider boundaries |
| `packages-adapters` | `graphify-out/contexts/packages-adapters/` | exploring external integrations and mock implementations |
| `packages-app` | `graphify-out/contexts/packages-app/` | exploring shared screens, flows, block renderers |
| `packages-ui` | `graphify-out/contexts/packages-ui/` | exploring shared UI, reusables, responsive helpers |

### Rules

- Do not start with whole-repo grep if a matching bounded-context graph exists.
- Use `GRAPH_REPORT.md` and `wiki/index.md` inside the selected context before opening raw files.
- Rebuild bounded-context graphs after substantial architecture changes with `py -3 scripts/build_graphify_contexts.py`.

---

## Quick Reference

### Common Imports

```typescript
// Tokens
import { colors, spacing, typography, radius } from '@real/tokens'

// UI components
import { Box, Text, Pressable, Image } from '@real/ui/primitives'
import { Button } from '@real/ui/reusables/button'
import { useBreakpoint } from '@real/ui/responsive'

// App shared
import type { HomeBlock } from '@real/app/lib/cms/blocks'
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Platform-specific: `ComponentName.native.tsx` or `ComponentName.tsx`
- Services: `kebab-case.service.ts` (e.g., `home-layout-data.service.ts`)
- Renderers: `renderBlockType.tsx` (e.g., `renderHeroBlock.tsx`)

---

*Last updated: 2026-04-10*
