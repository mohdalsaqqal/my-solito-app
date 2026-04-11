# Qwen Project Summary

> **AGENTS.md is the source of truth** for all architecture rules, data-flow principles, and UI contracts. This file contains only Qwen-specific operational notes. Do not duplicate architecture rules here — reference AGENTS.md instead.

## Project

Solito v5 premium cosmetics commerce platform — cross-platform monorepo (Next.js 16 + Expo 54).

## Qwen-Specific Notes

- Skills are located in `.qwen/skills/` — each skill has its own SKILL.md.
- Commands are in `.qwen/commands/` (speckit.* commands).
- Settings: `.qwen/settings.json`
- Use the `/speckit.*` commands for spec-driven development workflow.

## Quick Commands

- `yarn web` — start dev server
- `yarn guard:checks` — run all guard scripts
- `yarn tsc -p apps/next/tsconfig.json --noEmit` — type check
- `yarn guard:hygiene` — repo hygiene (Principle XV)
- `yarn guard:agent-docs` — source-of-truth check (Principle XIV)

## Key Architecture Reminders

- Server layer owns data access (`apps/next/server/services/`)
- Tokens over hardcoded values (import from `@real/tokens`)
- See AGENTS.md for full architecture rules.
