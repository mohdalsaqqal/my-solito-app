# CLAUDE.md — Claude Code Support Shim

> **AGENTS.md is the source of truth** for all architecture rules, data-flow principles, and UI contracts. This file contains only Claude Code–specific operational notes. Do not duplicate architecture rules here — reference AGENTS.md instead.

## MANDATORY — Read AGENTS.md Before Every Task

**You must read `AGENTS.md` before starting any task, every time, no exceptions.**

This is not optional. Do not rely on memory of a previous read — AGENTS.md may have changed. Read it fresh at the start of every conversation.

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
- `yarn native` — start Expo dev server
- `yarn guard:checks` — run all guard scripts (tokens, className, hex, env)
- `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false` — type check (use --incremental false for accurate results)
- `yarn guard:hygiene` — repo hygiene check (Principle XV)
- `yarn guard:agent-docs` — source-of-truth check (Principle XIV)
- `yarn test` — run all tests (turbo)
- `yarn --cwd apps/next test:api` — API route tests only
- `yarn e2e` — Playwright e2e suite
- `yarn e2e:a11y` — accessibility-only e2e run
- `yarn i18n:check` — check i18n coverage
- `yarn verify:audit-remediation` — full combined verification (guard + tsc + api tests + a11y)

## MANDATORY — Follow the Delivery Workflow

**You must follow the Delivery Workflow below for every task, every time, unless the user explicitly says otherwise.**

Do not skip steps. Do not mark work done without running verification. Do not implement outside the ticket scope. The only valid override is a direct user instruction in the current conversation.

---

## Delivery Workflow

Full process lives in `docs/delivery/WORKFLOW.md`. Summary:

**Every task must be small, scoped, and verifiable. Do not mark work done because code exists.**

### Work Session Loop

1. Follow the Startup Protocol below.
2. Read `docs/delivery/DELIVERY_MATRIX.md`.
3. Read `docs/delivery/BLOCKERS.md`.
4. Pick one ticket from one aspect file under `docs/delivery/aspects/`.
5. Read only the smallest relevant bounded context.
6. Implement only the ticket scope.
7. Run the ticket's verification commands.
8. If a command fails: fix it (if in scope) or add/update a blocker in `docs/delivery/BLOCKERS.md`.
9. Update the aspect file, `checklist.md`, and memory files when status changes.
10. Stop only after the ticket is verified done or explicitly blocked.

### Ticket Format

Write this before starting any implementation:

```
ID:
Aspect:
Goal:
Scope:
Files/Bounded Context:
Verification:
Done Means:
Blockers:
Notes:
```

### Task Statuses

- `[ ]` Not started
- `[~]` In progress / partially verified
- `[x]` Verified done
- `[!]` Blocked

### Named Verification Gates

```bash
yarn verify:delivery
yarn verify:delivery:full
node scripts/verify-delivery.mjs --gate expo-typecheck
node scripts/verify-delivery.mjs --list
```

### Agent Dispatch Rule

Use parallel agents only for independent tickets with disjoint write sets. Each agent receives the specific task, exact files/snippets, exact verification commands, and no permission to explore the whole repo. The orchestrator owns final integration, verification, and status updates.

---

## Notes

- Use `bash` commands via the `Bash` tool, not inline shell.
- When implementing multi-file changes, use parallel agent dispatch per AGENTS.md Token Efficiency section.
- Always run verification commands after making changes.
- When changing `apps/next` architecture/build: also run `next build --webpack --debug-prerender` from `apps/next`.
- Do not mark a task done if a required verification gate fails — fix it or record a blocker in `docs/delivery/BLOCKERS.md`.

## Startup Protocol

At the start of every new conversation, before searching the repo or opening arbitrary files:

0. **Activate Caveman first** — `C:\Users\hamoo\.agents\skills\caveman\SKILL.md`
1. Read `SESSION-STATE.md`, `RECENT_CONTEXT.md`, `MEMORY.md`
2. Read `AGENTS.md`
3. Read `checklist.md`
4. Read `docs/delivery/DELIVERY_MATRIX.md` and `docs/delivery/BLOCKERS.md`
5. Read the smallest relevant file under `docs/delivery/aspects/`
6. Read `docs/architecture-index.md`
7. Read `graphify-out/GRAPH_REPORT.md`
8. Choose the smallest matching bounded-context graph under `graphify-out/contexts/`
9. Read that context's `GRAPH_REPORT.md` or `wiki/index.md`
10. Only then search raw files inside that narrowed context

**Mandatory startup status** — report at start of work:
- `caveman`: `active` or `inactive`
- `graphify`: `checked` or `not checked` (use `not checked (user override)` if user asked to skip)
