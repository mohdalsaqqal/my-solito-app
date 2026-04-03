# CLAUDE.md

This file is auto-loaded by Claude Code at every session start.
The full architecture rules and platform operating model live in **AGENTS.md** — read that first.

---

## Repo At A Glance

**REAL Cosmetics** — cross-platform beauty commerce platform.
Solito v5 monorepo: Next.js 16 (web + BFF) + Expo 54 (React Native mobile).

```
apps/next      — Next.js App Router, server layer, BFF
apps/expo      — React Native / Expo mobile app
packages/app   — Shared screens, features, sections, lib
packages/ui    — Shared RNR-centered component system
packages/tokens — Design tokens (colors, spacing, typography, etc.)
packages/providers — Contracts + provider registry
packages/adapters  — External integrations (all mock today)
```

---

## Non-Negotiables (from AGENTS.md)

- Server Components → `apps/next/server/services` only. Never call adapters or internal HTTP.
- No `apiClient` in Server Components. It is banned server-side.
- Route Handlers are thin transport layers. Business logic lives in services.
- Shared UI is full RNR-centered. No `Touchable` in active shared contracts.
- Tokens over hardcoded values. No hex, rgba, or px literals in shared UI.
- No `className` in `packages/app`. No `process.env` in `packages/app`.
- Cache Components are enabled in `apps/next`. Keep them enabled.
- `proxy.ts` handles routing, auth, and locale. Not `middleware.ts`.

---

## Canonical Data Flow

```
UI (Server + Client Components)
  → apps/next/server/services
  → packages/providers (registry)
  → packages/adapters (mock today, real later)
```

For Expo:
```
apps/expo (React Native)
  → apiClient (HTTP to Next.js BFF)
  → apps/next/server/services (same service layer)
```

---

## Active Work (as of 2026-04-03)

### Completed
- [x] Editorial Monolith design system — tokens, global.css, fonts, button, input, header
- [x] Homepage block pipeline fix — `block.version ?? 'v1'`, full `PageBlock[]` passthrough
- [x] Home layout engine Phases 1–6 — complete, all block types dispatched to typed renderers

### Home Engine — Final State
```
HomeScreen
  ├── hasPublishedBlocks → HomeBlocksScreen (~45 lines)
  │     └── HomeBlocksRenderer
  │           ├── useBreakpoint() → LayoutProfile
  │           ├── buildHomeLayout(rawBlocks, profile) → ResolvedRenderSlot[]
  │           └── dispatchHomeRenderer(slot) → typed renderer
  └── no blocks → HomeLegacyScreen (fallback)
```

Plan: `docs/project/homepage-layout-engine-plan.md`

---

## Key Architectural Decisions

| Decision | Reason |
|---|---|
| Width-driven layout (not Platform.OS) | Same width = same layout on web and native |
| `Platform.OS` only in `useBreakpoint.ts` | Single source of truth, no per-component branching |
| SSR baseline = mobile profile (width 0) | Safe first render, no layout shift |
| `useBreakpoint` in `packages/ui/responsive/` | Shared across web and Expo |
| Mock adapters behind provider registry | Swap-ready for real integrations |
| Cache Components enabled in apps/next | Public reads cached with tags |

---

## Token Efficiency — Parallel Agent Dispatch

**Always use this approach for multi-file implementation tasks.**

### The Rule
Before writing any file, pre-read all required context yourself. Then dispatch one agent per file in parallel — each with a self-contained prompt containing only what it needs. Never ask an agent to explore the codebase.

### How to Apply
1. Read the relevant existing files yourself first (narrow, targeted reads)
2. Extract only the snippets each agent needs and paste them directly into the prompt
3. Give the agent the exact file content to write — no ambiguity, no exploration
4. Launch all agents in parallel with `run_in_background: true`
5. After all complete, spot-check key lines — don't re-read entire files

### What NOT to Do
- Do not ask an agent to "explore the codebase and figure it out" — that wastes tokens on searching
- Do not put multiple files in one agent prompt — longer context = more tokens, errors block all tasks
- Do not do sequential multi-file work in the main context when parallel dispatch is possible

### Why
Each agent's token usage is isolated from the main context. Parallel dispatch solves N files in the time of 1. The main context stays lean for coordination and verification only.

---

## Verification Commands

**REQUIRED after every implementation task — no exceptions.**

Run in this order:

```bash
# 1. Always — catches token violations, forbidden imports, className leaks, hardcoded strings
yarn guard:checks

# 2. Always — catches TypeScript errors in the Next.js layer
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false

# 3. Only when touching Next.js build behavior, routing, or Cache Components
# (run from apps/next)
next build --webpack --debug-prerender
```

**Do not proceed to the next phase or report a task as done until both `yarn guard:checks` and `yarn tsc` pass clean.**

---

## Creating New Components — Decision Guide

### Which layer?

| What you're building | Where it goes |
|---|---|
| Reusable UI control (button, input, badge) | `packages/ui/reusables/` |
| Product-facing UI section (rail, card, banner) | `packages/ui/components/` |
| Homepage CMS block renderer | `packages/app/features/home/renderers/` |
| Shared screen (web + native) | `packages/app/screens/` |
| Web-only page | `apps/next/app/[locale]/` |
| Native-only screen | `apps/expo/app/` |

### Creating a shared UI component (`packages/ui/components/`)

1. Create `packages/ui/components/MyComponent.tsx`
   - React Native primitives only (`View`/`Box`, `Text`, `Image`, `Pressable`)
   - Inline styles using tokens: `colors.xxx`, `spacing.xxx`, `typography.xxx`, `radius.xxx`
   - No `className`, no hex values, no hardcoded px/rgba
   - No `Platform.OS` checks — use `useBreakpoint()` for layout decisions
   - For native-only scroll behavior: create `MyComponent.native.tsx` alongside

2. Export from `packages/ui/components/index.ts`

3. Run verification:
   ```bash
   yarn guard:checks
   yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false
   ```

### Creating a new homepage CMS block type

1. **Define the block type** in `packages/app/lib/cms/blocks.ts`:
   - Add `MyNewBlock` type with `type: 'my_new_block'` literal
   - Add to `HomeBlock` union

2. **Create the renderer** in `packages/app/features/home/renderers/renderMyNewBlock.tsx`:
   - Accepts `{ slot: IndependentRenderSlot, ...callbacks }`
   - Guards `if (block.type !== 'my_new_block') return null`
   - Maps block data → UI component props
   - Renders a component from `packages/ui/components/`

3. **Wire into dispatcher** in `packages/app/features/home/HomeBlocksRenderer.tsx`:
   - Add import at top
   - Add `if (block.type === 'my_new_block')` case in `dispatchHomeRenderer`

4. **Add to mock data** in `packages/adapters/mock/` so the block appears in dev

5. Run verification (guard + tsc)

### Token rules (enforced by guard:checks)

- Colors → `colors.xxx` from `@real/tokens` (inline style) or `bg-primary` Tailwind class (reusables)
- Spacing → `spacing.xxx` — never raw numbers
- Radius → `radius.xxx` — all 0 per DESIGN.md except `radius.full` (9999px)
- Typography → `typography.xxx` and `fontWeights.xxx`
- No hex literals (`#...`) in `packages/app` or `packages/ui` TypeScript files
- `className` is forbidden in `packages/app`
- `process.env` is forbidden in `packages/app` and `packages/ui`

---

## Memory Files

- `MEMORY.md` — long-term decisions and conventions (auto-memory)
- `docs/project/homepage-layout-engine-plan.md` — layout engine plan
- `docs/plans/` — all feature/design plans
