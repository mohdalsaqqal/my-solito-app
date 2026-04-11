# AGENTS VERSION
- Version: `v4.2`
- Last updated: `2026-04-11`
- This file is the **sole source of truth** for architecture rules, platform operating model, and non-negotiables.

## Source of Truth

**AGENTS.md is the source of truth.** All architecture rules, data-flow principles, and UI contracts live here.

The following files exist as **support shims only** — they contain tool-specific operational notes and MUST NOT duplicate any architecture rule from this file. Each opens with a pointer back to AGENTS.md:

| Shim File | Allowed Scope |
|---|---|
| `CLAUDE.md` | Claude Code skill invocation, memory paths, shortcuts |
| `GEMINI.md` | Gemini CLI-specific notes |
| `.github/copilot-instructions.md` | GitHub Copilot-specific notes |
| `.codex/context.md` | Codex CLI-specific notes |
| `.qwen/PROJECT_SUMMARY.md` | Qwen-specific notes |
| `.impeccable.md` | Impeccable-specific notes |

Any architecture rule duplicated in a shim file is a violation enforced by `yarn guard:agent-docs`.

---

# Platform Operating Model

- `apps/next` owns:
  - Web app (App Router)
  - Server layer
  - Route Handlers
  - Server Actions
  - `server/services`
- `apps/expo` owns the mobile app
- `packages/ui` owns the active shared UI system
- `packages/app` owns shared screens and flows
- `packages/providers` owns contracts plus registry
- `packages/adapters` owns external integrations

---

# Core Architecture (P0)

## Canonical Data Flow

UI (Server + Client Components)
-> Next.js Server Layer
-> Services
-> Provider Registry
-> Adapters

## Canonical UI Flow

Shared UI Consumers
-> `packages/ui/components`
-> `packages/ui/reusables`

---

# Non-Negotiables

- Tokens over hardcoded values
- Adapters over direct external calls
- Providers over adapter imports
- Server layer owns all data access
- CMS controls content, not layout
- Do not reintroduce public `Touchable`-style legacy primitives into the active shared UI contract

---

# Next.js Rules (P0)

## Allowed

- Server Components fetching data through `apps/next/server/services`
- Route Handlers under `app/api`
- Server Actions only when they delegate to services
- Cache Components and tagged caching for safe public reads
- Client islands for mutations, browser-only state, and UI interactions

## Forbidden

- Server Components calling internal Route Handlers over HTTP
- Reintroducing `apiClient` in Server Components
- Direct adapter usage in UI
- External API calls from the client when the server layer should own them
- External BFF layer

## Cache Components Rules

- Keep `cacheComponents` enabled
- Fix request-bound rendering with lower `Suspense` boundaries and nested async server components
- Do not use old dynamic-route shortcuts that conflict with Cache Components
- Keep request-bound flows dynamic only where they actually need request state

---

# Shared UI Rules (P0)

## Active Contract

- The active shared UI system is full RNR-centered
- `packages/ui/reusables` is the core shared control layer
- `packages/ui/components` is the product-facing shared UI layer
- `packages/ui/primitives` must not grow new legacy API surface

## Forbidden

- Reintroducing public `Touchable` usage in active shared components
- Reintroducing old primitive-only contracts when an RNR shared component already exists
- Bypassing tokens in shared UI

---

# Monorepo Structure

apps/
  next/
  expo/

packages/
  app/
  ui/
  tokens/
  providers/
  adapters/

---

# Layer Responsibilities

## `apps/next`

- Server Components
- Route Handlers
- Server Actions
- `server/services`

Rules:
- Import providers, not adapters
- Normalize server data
- Keep page reads in services
- Keep route handlers thin

## `packages/app`

- Shared screens and logic

Rules:
- No adapters
- No `process.env`
- No `className`

## `packages/ui`

- Pure UI
- Shared reusable controls
- Product-facing shared components

## `packages/providers`

- Contracts
- Registry

## `packages/adapters`

- External integrations only

---

# Services Layer

Location:
`apps/next/server/services`

Responsibilities:
- Business logic
- Provider calls
- Shared server composition
- Reusable read and mutation orchestration

---

# Layout-As-Data

Flow:
CMS -> Server Layer -> Normalized Blocks -> UI

---

# Tokens

- No hardcoded design values in shared UI
- Use tokens for colors, spacing, radius, typography, and sizing

---

# Routing

- Use Next.js App Router under `apps/next/app`
- Use `proxy.ts` for routing/auth/locale entry behavior
- Keep root layout compatible with Cache Components

---

# Removed / Disallowed

- Public `Touchable` shared UI contract
- Server-side `apiClient`
- External BFF

---

# Creating New Components

## Decision: which layer?

| Goal | Location |
|---|---|
| Reusable control (button, input, badge) | `packages/ui/reusables/` |
| Product-facing UI section (rail, card, banner, hotspot) | `packages/ui/components/` |
| Homepage CMS block renderer | `packages/app/features/home/renderers/` |
| Shared screen (web + native) | `packages/app/screens/` |
| Web-only page | `apps/next/app/[locale]/` |
| Native-only screen | `apps/expo/app/` |

## Shared UI component (`packages/ui/components/`)

1. Create `MyComponent.tsx` using React Native primitives: `Box`, `Text`, `Image`, `Pressable`
2. Style with inline tokens only: `colors.xxx`, `spacing.xxx`, `typography.xxx`, `radius.xxx`
3. No `className`, no hex, no hardcoded px/rgba, no `Platform.OS`
4. Use `useBreakpoint()` from `@real/ui/responsive` for responsive layout decisions
5. For native-only scroll/gesture differences: create `MyComponent.native.tsx` alongside
6. Export from `packages/ui/components/index.ts`

## Reusable control (`packages/ui/reusables/`)

- Uses `cva` + `className` for Tailwind/Uniwind variants (web + native via Uniwind)
- Uses token class names: `bg-primary`, `text-foreground`, `rounded-none`
- No hex in className strings — use CSS token vars (`bg-primary-hover`) defined in `global.css`
- Export from `packages/ui/reusables/index.ts` if one exists, or import directly

## New homepage CMS block type

Step 1 — `packages/app/lib/cms/blocks.ts`:
- Define `MyNewBlock` with `type: 'my_new_block'` literal
- Add to `HomeBlock` union type

Step 2 — `packages/app/features/home/renderers/renderMyNewBlock.tsx`:
- Props: `{ slot: IndependentRenderSlot, ...callbacks }`
- Type guard: `if (block.type !== 'my_new_block') return null`
- Map block data → UI component from `packages/ui/components/`

Step 3 — `packages/app/features/home/HomeBlocksRenderer.tsx`:
- Import the renderer
- Add dispatch case in `dispatchHomeRenderer` function

Step 4 — Add mock data in `packages/adapters/mock/`

Step 5 — Run `yarn guard:checks` + `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`

## Token enforcement (guard:checks)

- `packages/app` and `packages/ui` TypeScript files: no hex literals, no `className`, no `process.env`
- Inline styles: always `colors.xxx`, `spacing.xxx`, `radius.xxx` from `@real/tokens`
- className-based (reusables): use Tailwind token classes, no arbitrary hex values `bg-[#hex]`
- Radius: always use `radius.xxx` from `@real/tokens` — never hardcode values

## Cross-platform guarantee

Anything in `packages/` renders on both web (Next.js) and native (Expo).
- React Native primitives → DOM elements on web via Uniwind
- `useBreakpoint()` is the only place `Platform.OS` may live
- Same component, zero duplication, both platforms

---

# Memory Update Rule

After every substantial update, agents must sync the repo memory.

## Update Required

- `SESSION-STATE.md`
- `RECENT_CONTEXT.md`
- `MEMORY.md`

## Update `AGENTS.md` Too When

- Architecture rules changed
- A previously forbidden pattern becomes allowed
- A new permanent platform rule was introduced

## "Substantial Update" Means

- Architecture changes
- Data-flow changes
- Shared UI contract changes
- Build/config changes
- Major verification or tradeoff decisions

---

# Agent Source Of Truth (P0)

## Mandatory Startup Protocol

At the start of every new conversation, before searching the repo or opening arbitrary files, agents must:

1. **Check memory files** — read `SESSION-STATE.md`, `RECENT_CONTEXT.md`, and `MEMORY.md` for current working context, open questions, and recent decisions
2. Read `AGENTS.md`
3. Read `docs/architecture-index.md`
4. Read `graphify-out/GRAPH_REPORT.md`
5. Choose the smallest matching bounded-context graph under `graphify-out/contexts/`
6. Read that context's `GRAPH_REPORT.md` or `wiki/index.md`
7. Only then search raw files inside that narrowed context

This startup protocol is mandatory unless the user explicitly asks to ignore repo guidance.

## Navigation Order

All agents should build context in this order:

1. **Memory files** (`SESSION-STATE.md`, `RECENT_CONTEXT.md`, `MEMORY.md`)
2. `AGENTS.md`
3. `docs/architecture-index.md`
4. `graphify-out/GRAPH_REPORT.md`
5. The smallest matching bounded-context graph under `graphify-out/contexts/`
6. Raw files inside that narrowed context only

## Bounded Context Graphs

| Context | Path | Start Here When |
|---|---|---|
| `apps-next-api` | `graphify-out/contexts/apps-next-api/` | exploring route handlers, auth/session, admin APIs, BFF entry points |
| `apps-next-services` | `graphify-out/contexts/apps-next-services/` | exploring server services, orchestration, provider-backed business logic |
| `packages-providers` | `graphify-out/contexts/packages-providers/` | exploring contracts, registry, provider boundaries |
| `packages-adapters` | `graphify-out/contexts/packages-adapters/` | exploring external integrations and mock implementations |
| `packages-app` | `graphify-out/contexts/packages-app/` | exploring shared screens, flows, block renderers |
| `packages-ui` | `graphify-out/contexts/packages-ui/` | exploring shared UI, reusables, responsive helpers |

## Rules

- Do not start with whole-repo grep if a matching bounded-context graph exists.
- Use `GRAPH_REPORT.md` and `wiki/index.md` inside the selected context before opening raw files.
- Rebuild bounded-context graphs after substantial architecture changes with `py -3 scripts/build_graphify_contexts.py`.

---

# Verification

Minimum:
- `yarn guard:checks`

When changing `apps/next` architecture/build behavior:
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- `next build --webpack --debug-prerender` from `apps/next`

---

# Definition of Done

- Guards pass
- Required type/build verification passes for the touched layer
- Data flows via the server layer
- Shared UI respects the active RNR contract
- Memory files are updated after substantial work

---

# Token Efficiency — Parallel Agent Dispatch

**Mandatory for all agentic AI executing multi-file implementation tasks in this repo.**

## The Rule

Pre-read all required context before dispatching agents. Then dispatch one agent per file in parallel — each agent receives a self-contained prompt with only the context it needs. Agents must never explore the codebase speculatively.

## Protocol

1. The orchestrating agent reads the relevant existing files first (narrow, targeted reads only)
2. Relevant snippets are extracted and pasted directly into each sub-agent prompt
3. Each sub-agent is given exact file content to write — no ambiguity, no open-ended search
4. All sub-agents are launched in parallel (`run_in_background: true` where supported)
5. After all complete, the orchestrator spot-checks key lines only — no full re-reads

## Forbidden

- Telling an agent to "explore the codebase and figure out what to write"
- Putting multiple output files in one agent prompt
- Doing sequential multi-file work in the main context when parallel dispatch is possible
- Agents writing to overlapping files (causes conflicts)

## Why This Matters

Each sub-agent's token usage is isolated from the main context. Parallel dispatch solves N files in the time of 1 file. The orchestrator context stays lean for coordination and verification only. This preserves output quality while minimizing quota consumption.

---

# END

## graphify

This project has graphify bounded-context graphs under `graphify-out/contexts/`.

Rules:
- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` to choose the correct bounded context
- Then read the selected context's `GRAPH_REPORT.md` or `wiki/index.md` before searching raw files
- After substantial architecture changes, run `py -3 scripts/build_graphify_contexts.py` to refresh the graph set
