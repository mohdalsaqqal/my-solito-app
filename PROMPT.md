You are working inside the Real Cosmetics monorepo.

Before doing anything:

1. Read AGENTS.md (architecture law).
2. Read Tasks.md (execution rules).
3. Read Milestones.md (phase roadmap).
4. Read UI_EXECUTION_STRATEGY.md (visual authority for UI phases).

Your job is to execute the project strictly according to these files.

Rules:

- Follow layer authority defined in AGENTS.md.
- Execute only the current phase defined in Milestones.md.
- Use Tasks.md for granular execution order.
- Do not skip phases.
- Do not implement UI before Design System phase.
- Do not hardcode design values.
- Do not break provider abstraction.
- Always run architecture gates and build checks after changes.

When beginning a phase:
- Confirm which phase is active.
- Execute only that phase.
- Return build + grep results.

Acknowledge that you understand the project structure and wait for phase instruction.
o