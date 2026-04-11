# GitHub Copilot Instructions

> **AGENTS.md is the source of truth** for all architecture rules, data-flow principles, and UI contracts. This file contains only GitHub Copilot–specific operational notes. Do not duplicate architecture rules here — reference AGENTS.md instead.

## Project Overview

Solito v5 monorepo — cross-platform cosmetics commerce platform (Next.js 16 + Expo 54).

## Key Conventions for Copilot

- **TypeScript strict mode** — always use typed imports, no `any`
- **Design tokens** — import from `@real/tokens`, never hardcode colors/spacing
- **Server-first** — data flows through `apps/next/server/services`, not client API calls
- **Shared UI** — `packages/ui/components` uses React Native primitives styled with inline tokens
- **Reusables** — `packages/ui/reusables` uses `cva` + `className` for variants

## Useful Commands

- `yarn guard:checks` — verify token/class/env compliance
- `yarn tsc -p apps/next/tsconfig.json --noEmit` — type check
- `yarn web` — start dev server

## What to Avoid

- Hex color literals in `packages/app` or `packages/ui`
- `className` in `packages/app` (use inline token styles)
- Direct adapter imports in UI (use providers instead)
