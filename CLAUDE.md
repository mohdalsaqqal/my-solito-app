# CLAUDE.md — Claude Code Support Shim

> **AGENTS.md is the source of truth** for all architecture rules, data-flow principles, and UI contracts. This file contains only Claude Code–specific operational notes. Do not duplicate architecture rules here — reference AGENTS.md instead.

## Skill Invocation

- Skills are located in `.claude/skills/` — each skill has a `SKILL.md` manifest.
- The `frontend-design` skill is the primary skill for building UI components.
- Speckit skills (`speckit-*`) live in `.claude/skills/` and handle spec → plan → tasks → implement flows.

## Memory Paths

- Session memory: `SESSION-STATE.md`, `RECENT_CONTEXT.md`, `MEMORY.md` (repo root)
- Constitution: `.specify/memory/constitution.md`
- Feature specs: `specs/<NNN-feature-name>/`

## Shortcuts

- `yarn web` — start Next.js dev server
- `yarn guard:checks` — run all guard scripts (tokens, className, hex, env)
- `yarn tsc -p apps/next/tsconfig.json --noEmit` — type check
- `yarn guard:hygiene` — repo hygiene check (Principle XV)
- `yarn guard:agent-docs` — source-of-truth check (Principle XIV)

## Notes

- Use `bash` commands via `run_shell_command` tool, not inline shell.
- When implementing multi-file changes, use parallel agent dispatch per AGENTS.md Principle VII.
- Always run verification commands after making changes.
