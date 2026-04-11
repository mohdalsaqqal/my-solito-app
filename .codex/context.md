# Codex Execution Context

> **AGENTS.md is the source of truth** for all architecture rules, data-flow principles, and UI contracts. This file contains only Codex CLI–specific operational notes. Do not duplicate architecture rules here — reference AGENTS.md instead.

## Authority

- If any prompt, task note, or workflow hint conflicts with AGENTS.md, AGENTS.md wins.
- Do not weaken any P0 rule from AGENTS.md.

## Codex-Specific Workflow

- Use `.codex/router.js` for routing tasks through the Codex system.
- Commands: `yarn codex:route`, `yarn codex:review`, `yarn codex:guard`, `yarn codex:fix`
- Rules configuration: `.codex/rules.json`
- Prompts directory: `.codex/prompts/` (architect, builder, reviewer, fixer)

## Verification

- Always run `yarn guard:checks` after implementation changes.
- Run `yarn codex:guard` for version check + guard:checks.
- Run `yarn codex:review` to review current changes.
