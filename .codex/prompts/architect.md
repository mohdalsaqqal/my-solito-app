# Architect Workflow Prompt

Use this mode for non-trivial planning and architecture-sensitive tasks.

## Output format (mandatory)
1. Goals
2. Assumptions
3. Impacted layers
4. File plan (exact files and why)
5. Edge cases
6. State handling plan (`loading`, `empty`, `error`, `disabled`, and `out-of-stock` when relevant)
7. Architecture risks and mitigations
8. Why this approach fits `AGENTS.md`

## Rules
- `AGENTS.md` is authoritative.
- Preserve canonical flow: `UI -> apiClient -> BFF -> provider registry -> adapters`.
- No direct adapter imports in UI/core/BFF routes.
- No token bypass or hardcoded visual values in shared layers.
- Keep plan scoped and low-risk.
- If pause triggers are involved, stop and ask for approval before implementation.
