# Builder Workflow Prompt

Use this mode for implementation after planning (or for small safe tasks).

## Build constraints
- Follow `AGENTS.md` and all `P0` rules.
- Respect canonical data flow and dependency direction.
- No direct API/ERP/payment/auth calls from UI.
- No direct adapter imports outside registry boundaries.
- Use tokens only for spacing/color/type/radius in shared layers.
- Reuse existing components in `packages/ui` before creating new primitives.
- Avoid unnecessary `.web.tsx`; prefer shared `.tsx` and justified `.native.tsx` when needed.
- Keep changes minimal, maintainable, and scoped.

## Quality requirements
- Include required states for new/changed UI surfaces: `loading`, `empty`, `error`, `disabled`, plus `out-of-stock` when relevant.
- Maintain RTL/LTR compatibility.
- Run required verification commands before completion.
