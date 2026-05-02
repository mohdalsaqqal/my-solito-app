# Delivery Workflow

This is the repo-local OpenAI Symphony operating model for end-to-end delivery.

`AGENTS.md` remains the architecture source of truth. These delivery files define how work moves from idea to verified output.

## Core Rule

Every delivery task must be small, scoped, and verifiable.

Do not mark work done because code exists. Mark it done only when the task's verification commands pass, the relevant aspect file is updated, blockers are recorded, and no broken reachable surface remains.

## State Machine

Use these statuses for aspect tasks and blockers:

- `[ ]` Not started
- `[~]` In progress or partially verified
- `[x]` Verified done
- `[!]` Blocked by external dependency or another task

## Ticket Format

Every task should be written in this shape before implementation starts:

```md
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

## Work Session Loop

1. Follow `AGENTS.md` startup protocol.
2. Read `docs/delivery/DELIVERY_MATRIX.md`.
3. Read `docs/delivery/BLOCKERS.md`.
4. Pick one ticket from one aspect.
5. Read only the smallest relevant bounded context.
6. Implement only the ticket scope.
7. Run the ticket verification commands.
8. If a command fails:
   - fix it when the failure is in scope;
   - otherwise add or update a blocker in `BLOCKERS.md`.
9. Update the aspect file, `checklist.md`, and memory files when status changes.
10. Stop only after the ticket is either verified done or explicitly blocked.

## Agent Dispatch Rule

Use parallel agents only for independent tickets with disjoint write sets. Each agent gets:

- the specific aspect task;
- exact files or snippets needed;
- exact verification commands;
- no permission to explore the whole repo.

The orchestrator owns final integration, verification, and status updates.

## Verification Rule

Use named gates from `scripts/verify-delivery.mjs`.

Examples:

```bash
yarn verify:delivery
yarn verify:delivery:full
node scripts/verify-delivery.mjs --gate expo-typecheck
node scripts/verify-delivery.mjs --list
```

If a named gate fails, record it as a blocker with the command, first failing file, affected aspect, and next action.
