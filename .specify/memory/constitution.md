<!--
  Sync Impact Report
  ==================
  Version change: 1.3.0 -> 1.4.0 (MINOR)
  Bump rationale: Added one new principle (XVII) and expanded the
    architecture constraints / definition of done to codify the
    production CMS operating model for this repo: in-repo Next.js +
    Prisma is the canonical CMS stack, services own CMS orchestration,
    and mock CMS adapters are seed/fallback fixtures rather than live
    production sources of truth.

  Modified principles:
    - VI. CMS Controls Content, Not Layout (operationalized by the new
      CMS production-source-of-truth rules below)
  Added:
    - Principle XVII: In-Repo CMS Canonical Source of Truth
  Removed sections: None

  Templates requiring updates:
    - .specify/templates/plan-template.md - reviewed, no edits needed
    - .specify/templates/spec-template.md - reviewed, no edits needed
    - .specify/templates/tasks-template.md - reviewed, no edits needed
    - .specify/templates/commands/*.md - not present in this repo
    - AGENTS.md - updated to mirror the permanent CMS rule
  Follow-up TODOs: None
-->
# Commerce Platform Constitution

## Core Principles

### I. Server-Owned Data Access

All data access MUST flow through the server layer
(`apps/next/server/services`). Server Components fetch via
services; services call the provider registry; the registry
delegates to adapters. No UI layer may call adapters or
external APIs directly. Expo clients MUST use `apiClient` to
reach the Next.js BFF — never bypass the server layer.

**Rationale**: Single enforcement point for auth, caching,
and data normalization. Prevents client-side drift and
ensures every read/write is auditable in one place.

### II. Token-Driven Design

No hardcoded design values (hex, rgba, px literals) in shared
UI packages. All visual properties MUST reference tokens from
`@real/tokens`: `colors.xxx`, `spacing.xxx`, `radius.xxx`,
`typography.xxx`, `fontWeights.xxx`. Reusable controls using
Tailwind/Uniwind MUST use token class names (`bg-primary`,
`text-foreground`) — never arbitrary hex values.

**Rationale**: Cross-platform consistency between Next.js and
Expo. A single token change propagates everywhere; hardcoded
values create invisible drift.

### III. Provider-Mediated Integration

External integrations MUST live in `packages/adapters` and
MUST be accessed exclusively through `packages/providers`
(registry pattern). No package outside `packages/adapters`
may import an adapter directly. All adapters are mock today
and MUST be swap-ready for real implementations.

**Rationale**: Decouples business logic from vendor APIs.
Enables mock-first development and zero-disruption provider
swaps.

### IV. Width-Driven Responsive Layout and Touch Compliance

Layout decisions MUST be driven by viewport width, not
`Platform.OS`. The `useBreakpoint()` hook in
`packages/ui/responsive/` is the single source of truth for
responsive behavior. `Platform.OS` MUST only appear inside
`useBreakpoint.ts` — never in per-component branching.
Native-only behavior (scroll, gestures) uses `.native.tsx`
file extensions, not runtime platform checks.

All interactive elements MUST meet a minimum 44×44px touch
target (WCAG 2.5.5). Icon buttons, quantity controls, delete
actions, and navigation arrows MUST have wrappers that ensure
this minimum regardless of visual icon size. Fluid layouts
MUST avoid hardcoded pixel widths that overflow small
viewports (320px baseline). Magic-number positioning values
MUST be derived from token references, not hardcoded literals.

**Rationale**: Same width produces the same layout on web and
native. Eliminates per-component platform forks and ensures
SSR baseline (mobile profile, width 0) is safe. Touch
compliance is non-negotiable for mobile usability.

### V. Layered Package Boundaries

Each monorepo package has a strict responsibility boundary:

- `packages/app` — shared screens and flows. No adapters,
  no `process.env`, no `className`.
- `packages/ui` — pure UI. Reusable controls in
  `reusables/`, product-facing components in `components/`.
  No `process.env`.
- `packages/providers` — contracts and registry only.
- `packages/adapters` — external integrations only.
- `apps/next` — web app, server layer, route handlers,
  server actions, `server/services`.
- `apps/expo` — mobile app.

**Rationale**: Strict boundaries prevent cross-contamination.
Shared packages render on both platforms; leaking web-only or
server-only concerns breaks the cross-platform guarantee.

### VI. CMS Controls Content, Not Layout

The homepage layout engine follows Layout-As-Data: CMS
delivers normalized blocks, the server layer passes them
through, and the UI dispatches typed renderers. CMS data
defines what content appears — not how it is arranged. Layout
decisions belong to `buildHomeLayout` and `useBreakpoint`.

**Rationale**: Prevents CMS schema from becoming a layout
DSL. Keeps rendering logic testable and platform-aware
without coupling to external content structure.

### VII. Parallel Agent Dispatch for Multi-File Work

When agentic AI performs multi-file implementation tasks, the
orchestrating agent MUST pre-read all required context, then
dispatch one sub-agent per file in parallel. Each sub-agent
receives a self-contained prompt with exact file content to
write. Agents MUST NOT explore the codebase speculatively or
handle multiple output files.

**Rationale**: Isolates token usage per sub-agent, solves N
files in the time of one, and keeps the orchestrator context
lean for coordination and verification.

### VIII. Spec-Driven Delivery

All major work MUST be specification-driven. Each subphase
follows the Spec Kit workflow: constitution → specify →
clarify → plan → tasks → analyze → implement. Already-
implemented work MUST be retroactively documented as specs to
establish accepted behavior and regression boundaries. No
subphase is complete until its spec is written, clarified,
planned, and verified.

**Rationale**: Prevents drift between intent and
implementation. Retroactive specs lock existing behavior so
future work cannot silently regress it. The brownfield
program model demands documentation of current state before
extending it.

### IX. Phase Isolation — Phase 2 Must Not Break Phase 1

Phase 1 (Real Cosmetics end-to-end commerce product) is the
compatibility baseline. Phase 2 (SaaS platform) MUST be
purely additive — it extends the system without changing the
business behavior of Phase 1. Real Cosmetics MUST continue to
function as the reference tenant/product throughout
platformization. Platform abstractions MUST NOT force
regressions into the product baseline.

**Rationale**: Real Cosmetics is the anchor product. The SaaS
platform grows around it. If Phase 2 destabilizes Phase 1,
both phases fail. Treating Phase 1 as an immutable baseline
forces clean separation of product-specific and platform-
specific concerns.

### X. Accessibility as a First-Class Concern

All shared UI MUST meet WCAG 2.1 AA compliance. Interactive
elements MUST be keyboard-navigable with visible focus
indicators. Form inputs MUST have associated labels (visible
or visually hidden). Semantic HTML elements (`<article>`,
`<nav>`, `<button>`, headings) MUST be used over generic
containers with ARIA roles. Screen reader testing (NVDA or
VoiceOver) MUST be part of verification for user-facing
flows. Carousel controls MUST support keyboard pause and
`aria-current` state.

**Rationale**: Accessibility is not an enhancement — it is a
baseline requirement. Keyboard and screen reader users are
first-class users. Semantic structure benefits all users and
improves SEO, maintainability, and testability.

### XI. Performance Baseline

Large components (100+ lines) that receive props MUST be
wrapped with `React.memo`. Expensive computations
(`Intl.NumberFormat`, format functions, derived calculations)
MUST be memoized with `useMemo` or `useCallback`. Animation
keyframes MUST be defined in global CSS, not injected via
imperative DOM manipulation. `setInterval` timers MUST use
stable references — dependency arrays MUST NOT include
frequently-changing values that cause interval recreation.
Window dimension listeners MUST be debounced or replaced with
`useBreakpoint()`.

**Rationale**: Unnecessary re-renders degrade perceived
performance on every platform. Memoization is cheap insurance
against cascading render waste. Stable intervals and cached
queries prevent background work from compounding during idle
periods.

### XII. Theme Completeness

Every surface that uses inline style tokens
(`style={{ color: colors.xxx }}`) MUST have a dark-mode
equivalent. The `useThemeColors()` hook (or equivalent theme
context) MUST be the single source of truth for color
resolution — never hardcoded hex or HSL literals in
component JSX. Color tokens MUST use consistent HSL format
across the entire token map. The CSS token bridge
(`global.css`) MUST mirror JS token values exactly.

**Rationale**: Broken dark mode is worse than no dark mode.
Partial theming creates jarring visual inconsistencies that
undermine trust. Consistent token format prevents silent drift
between JS and CSS layers.

### XIII. Visual Quality Standards

Shared UI MUST NOT contain AI-generated tells: gratuitous
glassmorphism blur, imperceptible overlay stacking, decorative
chrome without hierarchy value, or copy that conflicts with
brand direction (e.g., luxury-editorial language for a mass-
market product). Magic numbers (opacity, letterSpacing,
shadow strings, positioning offsets) MUST be extracted to
named tokens. Component sizing and spacing MUST use the design
token system — never arbitrary px, rem, or percentage values
without token backing.

**Rationale**: Visual quality is a trust signal. AI tells and
decorative chrome signal low craft and erode user confidence.
Tokenized values enable systematic refinement and cross-
platform consistency.

### XIV. AGENTS.md as Sole Source of Truth

`AGENTS.md` is the single authoritative source of truth for
architecture rules, platform operating model, and non-
negotiables that govern all agent and human contributors. All
other agent-facing guidance files are **support shims** for
specific tools and MUST NOT duplicate or diverge from
`AGENTS.md`. Support shims include — and are limited to —
the following roles:

- `CLAUDE.md` — Claude Code support shim
- `GEMINI.md` — Gemini CLI support shim
- `.github/copilot-instructions.md` — GitHub Copilot support shim
- `.codex/context.md` — Codex CLI support shim
- `.qwen/PROJECT_SUMMARY.md` — Qwen support shim
- `.impeccable.md` — Impeccable support shim

Each support shim MUST:

1. Open with an explicit pointer: *"AGENTS.md is the source of
   truth. Read it first. This file exists only to surface
   tool-specific quirks for <agent name>."*
2. Contain only agent-specific operational notes (tool
   invocation patterns, shortcuts, memory locations) that do
   NOT belong in `AGENTS.md`.
3. MUST NOT re-state architecture rules, non-negotiables, or
   principles — reference `AGENTS.md` by link instead.
4. Stay under 150 lines. Shim bloat is a smell.

When architecture rules change, `AGENTS.md` MUST be updated
first. Support shims are updated only if the change affects
tool-specific operation. Any contradiction between `AGENTS.md`
and a support shim MUST be resolved in favor of `AGENTS.md`,
and the shim MUST be corrected within the same change set.

A guard script (`scripts/check-agent-docs.mjs`) MUST enforce
these rules in CI: shim line count, presence of the pointer,
and absence of duplicated non-negotiables.

**Rationale**: Multiple agent-doc files drift when updated
independently. A single source of truth with thin, clearly-
scoped support shims eliminates ambiguity about which file
wins, reduces maintenance burden, and prevents architectural
rules from fragmenting across tool-specific copies.

### XV. Repo Hygiene and Working Tree Discipline

The repository root and working tree are part of the product.
A messy working tree erodes signal-to-noise for every
contributor and invites new violations. The following rules
are non-negotiable:

1. **AI tool vendor directories** (`.adal/`, `.augment/`,
   `.cline/`, `.codebuddy/`, `.commandcode/`, `.continue/`,
   `.crush/`, `.cursor/`, `.factory/`, `.goose/`, `.iflow/`,
   `.junie/`, `.kilocode/`, `.kiro/`, `.kode/`, `.mcpjam/`,
   `.mux/`, `.neovate/`, `.openhands/`, `.pi/`, `.pochi/`,
   `.qoder/`, `.roo/`, `.trae/`, `.vibe/`, `.windsurf/`,
   `.zencoder/`, and any future equivalents) MUST be
   `.gitignore`d. They are local tool caches, not project
   artifacts.
2. **Planning and audit files** (`*_audit.md`, `AUDIT_*.md`,
   `current-*-snapshot.md`, `issues.md`, `*_old.md`,
   `DeliveryExecution*.md`, `Milestones.md`, `Requirments.md`,
   `RequirementsTraceability.md`, `Req.md`, `Tasks.md`,
   `PROMPT.md`, `FeatureExtensionBlueprint.md`) MUST NOT live
   at repo root. Active plans live under `docs/plans/`.
   Completed plans are removed via a close-out commit, not
   left to rot.
3. **Build artifacts** (`.next/`, `dist/`, `coverage/`,
   `.turbo/`) MUST be fully `.gitignore`d. Accidental
   commits MUST be reverted in the same branch.
4. **No parallel source-of-truth files**. `AGENTS_old.md` or
   any `*_old.md` MUST either move to `docs/archive/` with a
   dated filename or be deleted.
5. **Working tree deletions** (files shown as `D` in
   `git status`) MUST be committed or restored within the
   same task. Leaving mass deletions staged across sessions
   is forbidden — it hides intent and blocks clean merges.
6. A guard script (`scripts/guard-hygiene.mjs`) MUST enforce
   these rules in CI and fail the build on violations.

**Rationale**: Architectural quality erodes when the repo
looks like a scratchpad. New contributors mistake the mess
for the norm. Hygiene is cheap to maintain and prohibitively
expensive to retrofit once drift is normalized.

### XVI. Operational Quality Baseline

Operational quality — testing coverage, CI discipline, and
dependency pinning — is a first-class concern alongside
architecture. The following baselines are non-negotiable:

1. **Service-layer testing**: Every file in
   `apps/next/server/services/` MUST have at least one smoke
   test covering the happy path and one failure path. The
   service layer is the highest-risk surface in the
   architecture; untested services are a liability.
2. **Test discovery via glob**: Test runner configuration
   MUST use glob patterns (e.g., `**/*.test.ts`) rather than
   hand-maintained file lists. Hand-lists drift; globs do
   not.
3. **Root test orchestration**: A root-level `yarn test`
   script MUST orchestrate all workspace tests via Turbo so
   contributors can run the full suite with one command.
4. **CI job separation**: The GitHub Actions workflow MUST
   split quality gates into distinct parallel jobs — `lint`,
   `typecheck`, `guard-checks`, `guard-hygiene`,
   `unit-tests`, `api-tests`, `e2e-a11y`, `build`. A
   monolithic job that bundles everything is forbidden: when
   one thing fails, contributors must be able to see which
   thing failed without re-running the rest.
5. **Framework version pinning**: `next`, `react`,
   `react-dom`, `react-native`, `react-native-reanimated`,
   `react-native-web`, and `typescript` MUST be pinned to
   exact versions (no `^` or `~`) in every `package.json`.
   Caret ranges on framework majors produce unreproducible
   builds and silent upgrade surprises.
6. **Memory overrides require a tracked root cause**: Any
   `NODE_OPTIONS=--max-old-space-size=*` override in a
   package script MUST reference an issue explaining the
   underlying cause. Memory overrides without root-cause
   tracking are forbidden — they mask leaks.
7. **Workspace exclusions require documentation**: Any
   workspace excluded from the root `workspaces` field (e.g.,
   `"!apps/strapi"`) MUST have a comment in the root
   `package.json` or a `docs/` note explaining why.

**Rationale**: A well-architected codebase with weak
operational discipline degrades silently. Tests, CI
isolation, and dependency pinning are the control loop that
keeps architectural investment from decaying. These rules
codify the minimum viable discipline for a production-grade
monorepo.

### XVII. In-Repo CMS Canonical Source of Truth

This repository's production CMS stack MUST remain in-repo:
`apps/next` owns the CMS server layer and admin surfaces, and
Prisma/Postgres is the canonical persistence layer for all
mutable, admin-editable CMS content. CMS reads and writes
MUST be orchestrated through `apps/next/server/services`;
Route Handlers and Server Actions remain thin transport
layers. Prisma rows MUST NOT be returned directly to the UI;
services MUST normalize them into stable CMS/view models
before rendering.

`packages/adapters/mock/cms` MAY exist for seed data,
contract testing, local bootstrap, or explicit fallback
behavior, but it MUST NOT be the live production source of
truth for storefront CMS content. If content is editable in
admin, it MUST be stored in Prisma. JSON columns MAY be used
for flexible payloads, but typed columns are REQUIRED for
fields that need validation, filtering, ordering, publish
state, or operational reporting.

Draft/publish/versioning, auditability, and rollback are
part of the CMS contract. All production CMS entities MUST
support explicit lifecycle state, actor attribution, and
deterministic publish behavior.

**Rationale**: This repo's CMS, admin, and commerce
operations are tightly coupled. A split source-of-truth model
between mock adapters and persisted content creates
unverifiable behavior, weak governance, and fragile publish
flows. Keeping the CMS in-repo preserves architectural
consistency and makes the system production-operable.

## Architecture Constraints

- Route Handlers are thin transport. Business logic lives in
  services.
- Mutable CMS reads and writes MUST flow through
  `apps/next/server/services`; Prisma is the production CMS
  persistence layer, and mock CMS adapters are seed/fallback
  fixtures only.
- Server Components MUST NOT call internal Route Handlers
  over HTTP.
- `apiClient` is banned server-side. It exists only for Expo
  client-to-BFF communication.
- Cache Components MUST remain enabled in `apps/next`. Fix
  request-bound rendering with lower Suspense boundaries, not
  by disabling caching.
- `proxy.ts` handles routing, auth, and locale entry
  behavior. Not `middleware.ts`.
- No external BFF layer.
- No public `Touchable`-style legacy primitives in the active
  shared UI contract.

## Program Model

This is a brownfield Spec Kit program with two top-level
phases:

**Phase 1 — Real Cosmetics End-to-End Commerce Product**
Deliver the full commerce system as a stable, branded,
production-grade cosmetics marketplace. Phase 1 behavior
becomes the compatibility baseline for Phase 2. Subphases
1.1 through 1.14 cover constitution backfill, architecture
lock, shared UI, CMS/services, homepage engine, visual
redesign, storefront, commerce flows, account/retention,
pharmacist/diagnostic flows, admin/operations, mobile parity,
and hardening.

**Phase 2 — SaaS Platform**
Turn the Phase 1 foundation into a reusable SaaS platform.
Phase 2 is additive only. Subphases 2.1 through 2.8 cover
SaaS constitution, tenancy model, product/platform
boundaries, branding/configuration, reusable commerce
modules, platform admin, deployment strategy, and
compatibility/regression safety.

**Execution order**: Phase 1 completes before Phase 2 begins.
Within each phase, subphases execute sequentially in numbered
order.

## Development Workflow

### Verification (NON-NEGOTIABLE)

After every implementation task, run in order:

1. `yarn guard:checks` — catches token violations, forbidden
   imports, className leaks, hardcoded strings.
2. `yarn guard:hygiene` — enforces Principle XV (repo
   hygiene and working tree discipline).
3. `yarn guard:agent-docs` — enforces Principle XIV
   (AGENTS.md source of truth and support shim limits).
4. `yarn tsc -p apps/next/tsconfig.json --noEmit
   --incremental false` — catches TypeScript errors.
5. `next build --webpack --debug-prerender` (from
   `apps/next`) — only when touching build behavior, routing,
   or Cache Components.

No task is done until steps 1–4 pass clean.

### Definition of Done

A subphase is complete only when:

- Its requirements are documented.
- The Spec Kit spec is written and clarified.
- The technical plan is aligned to this repo.
- Tasks are defined.
- Implementation respects repo architecture.
- Guards pass (checks, hygiene, agent-docs).
- Required type/build verification passes for the touched
  layer.
- Data flows via the server layer.
- CMS reads/writes respect the in-repo Next.js + Prisma
  production model and no live storefront path depends on
  mock CMS data as its canonical source.
- Shared UI respects the active RNR contract.
- Memory files are updated for substantial changes.
- The result leaves the codebase more stable and more
  constrained than before.

### Memory Sync

After substantial updates (architecture, data-flow, shared UI
contract, build/config changes, major tradeoff decisions),
agents MUST update `SESSION-STATE.md`, `RECENT_CONTEXT.md`,
and `MEMORY.md`. Update `AGENTS.md` when architecture rules
change or new permanent platform rules are introduced.
Support shims (CLAUDE.md, GEMINI.md, etc.) are updated only
when tool-specific operation changes — never to mirror
`AGENTS.md` content.

## Governance

This constitution is the highest-authority document for
architectural and development decisions in this repository.
It supersedes all other practices, agent guidance, and ad-hoc
conventions. Where this constitution and `AGENTS.md`
disagree, the constitution wins and `AGENTS.md` MUST be
corrected in the same change set.

### Amendment Procedure

1. Propose the change with rationale and impact scope.
2. Document the change in a Sync Impact Report (HTML comment
   at the top of this file).
3. Update the version using semantic versioning:
   - **MAJOR**: Principle removal or backward-incompatible
     redefinition.
   - **MINOR**: New principle or materially expanded
     guidance.
   - **PATCH**: Clarifications, wording, typo fixes.
4. Update `LAST_AMENDED_DATE` to the date of change.
5. Propagate changes to dependent templates (`plan-template`,
   `spec-template`, `tasks-template`) and update the Sync
   Impact Report with propagation status.

### Spec Kit Workflow

Every subphase MUST follow the Spec Kit flow in order:

1. `/speckit.constitution` — verify/update constitution
2. `/speckit.specify` — write feature specification
3. `/speckit.clarify` — resolve ambiguities
4. `/speckit.plan` — produce implementation plan
5. `/speckit.tasks` — generate task list
6. `/speckit.analyze` — analyze readiness
7. `/speckit.implement` — execute implementation

For retroactive specs (already-implemented work), the same
flow applies: document existing state, record accepted
behavior, identify gaps, and lock regression boundaries.

### Phase-Gate Compliance

- No Phase 2 subphase may begin until Phase 1 exit criteria
  are met.
- Phase 1 exit criteria: Real Cosmetics works end-to-end,
  architecture is stable and spec-backed, design language is
  consistent, critical flows are production-ready.
- Phase 2 work MUST include explicit regression verification
  against Phase 1 behavior as part of its Definition of Done.

### Compliance Review

All implementation plans MUST pass a Constitution Check gate
(see `plan-template.md`) before Phase 0 research begins and
again after Phase 1 design. Violations MUST be justified in
the Complexity Tracking table or resolved before proceeding.

**Version**: 1.4.0 | **Ratified**: 2026-04-03 | **Last Amended**: 2026-04-13

