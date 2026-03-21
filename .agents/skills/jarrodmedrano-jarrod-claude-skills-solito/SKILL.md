---
name: solito
description: This skill should be used when working on this Solito v5 commerce repo (Next.js App Router + Expo customer app). It covers shared screen composition, Solito navigation, platform boundaries, tokens, RTL, provider/BFF data flow, and common cross-platform pitfalls specific to this codebase.
---

# Solito Skill For This Repo

Use this skill for work involving:
- shared screens in `packages/app`
- shared UI in `packages/ui`
- Solito navigation and route wiring
- Expo customer-app behavior
- Next.js App Router web routes and shared shells
- cross-platform bugs caused by platform file splits, client boundaries, or routing mismatches

## Repo Model

This repository is a web-first premium commerce platform:
- `apps/next` owns the web app and BFF routes
- `apps/expo` owns the customer mobile app only
- `packages/app` owns shared commerce screens and logic
- `packages/ui` owns shared primitives and reusable UI components
- `packages/providers` owns contracts and registry selection
- `packages/adapters` owns external implementations

Canonical flow:

`UI -> apiClient -> BFF -> provider registry -> adapters`

Do not bypass this chain from shared UI or shared app code.

## Solito Rules

### Navigation
- URL is the source of truth.
- Use `solito/navigation` for App Router paths.
- Do not use `solito/router` in App Router code paths.
- Keep web and native route glue minimal. Shared screens belong in `packages/app`.

### Platform Boundaries
- Default to shared `.tsx`.
- Use `.native.tsx` only for real native differences.
- Use `.web.tsx` only when unavoidable, and treat it as a pause-trigger decision.
- Expo must not expose admin or pharmacist web-only routes.

### Client Boundaries
- If a shared component uses React hooks or browser-only state on the web side, make the client boundary explicit.
- Avoid accidental Next App Router server/client crashes by keeping hook-using shared UI inside clear client components.

### Shared UI
- Shared reusable UI belongs in `packages/ui`, not `packages/app`.
- `packages/app` must not use `className`.
- UniWind is allowed only in `packages/ui/**`.
- Visual values must come from tokens.
- RTL compatibility is mandatory for new UI work.

### Data and Contracts
- Shared app code may import providers, never adapters.
- BFF routes import providers, never adapters.
- Adapters must not leak raw infra errors.
- Expo should talk to BFF endpoints, not adapters or external systems directly.

## Recommended Workflow
1. Confirm whether the work belongs in `packages/ui`, `packages/app`, `apps/next`, or `apps/expo`.
2. Prefer extending an existing shared contract before creating a new primitive or platform fork.
3. Keep route files thin and import shared screens from `packages/app`.
4. Check LTR and RTL when UI changes are involved.
5. Run repo guard checks before completion.

## Common Pitfalls
- Putting reusable shared UI in `packages/app` instead of `packages/ui`
- Adding `className` inside `packages/app`
- Importing adapters into shared code
- Using `solito/router` in App Router paths
- Creating `.web.tsx` too early
- Letting web-only concerns leak into Expo routes
- Missing explicit client boundaries for hook-using shared components

## Source Of Truth
- Follow `AGENTS.md` first.
- Use this skill as the Solito-specific implementation layer for that handbook.
- Treat the global `solito-v5-shared-ui` skill as legacy guidance unless it is updated to match this repo.
