# Architecture Index

This repo uses a layered source-of-truth model for humans and agents.

Related reference:
- [Production Blueprint](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/production-blueprint.md)
- [SaaS Migration Path](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/saas-migration.md)
- [Commerce Platform Delivery Checklist](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/checklist.md)
- [Delivery Workflow](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/delivery/WORKFLOW.md)
- [Delivery Matrix](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/delivery/DELIVERY_MATRIX.md)
- [Blocker Register](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/delivery/BLOCKERS.md)

## Source Of Truth Order

1. [AGENTS.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/AGENTS.md)
2. This file
3. [checklist.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/checklist.md) for delivery status
4. [Delivery Matrix](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/delivery/DELIVERY_MATRIX.md) and [Blocker Register](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/delivery/BLOCKERS.md) for delivery workflow state
5. `graphify-out/GRAPH_REPORT.md`
6. The smallest matching bounded-context graph under `graphify-out/contexts/`
7. Raw source files

## Canonical Repo Boundaries

| Area | Owns | Read This Graph First |
|---|---|---|
| `apps/next/app/api` | Route handlers, auth/session edges, BFF entry points | `graphify-out/contexts/apps-next-api/` |
| `apps/next/server/services` | Business logic, orchestration, provider calls | `graphify-out/contexts/apps-next-services/` |
| `packages/providers` | Contracts and registry | `graphify-out/contexts/packages-providers/` |
| `packages/adapters` | External integrations and mocks | `graphify-out/contexts/packages-adapters/` |
| `packages/app` | Shared screens, flows, block renderers | `graphify-out/contexts/packages-app/` |
| `packages/ui` | Shared UI system, reusables, responsive helpers | `graphify-out/contexts/packages-ui/` |

## Repo Flow

### Data flow

`UI -> Next.js server layer -> services -> provider registry -> adapters`

### UI flow

`Shared consumers -> packages/ui/components -> packages/ui/reusables`

## Agent Navigation Protocol

When an agent needs project context:

1. Read [AGENTS.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/AGENTS.md).
2. Read [checklist.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/checklist.md).
3. Read [Delivery Matrix](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/delivery/DELIVERY_MATRIX.md) and [Blocker Register](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/docs/delivery/BLOCKERS.md).
4. Read the smallest relevant delivery aspect file under `docs/delivery/aspects/`.
5. Read `graphify-out/GRAPH_REPORT.md`.
6. Choose one context graph from the table above.
7. Read that context's `GRAPH_REPORT.md` or `wiki/index.md`.
8. Use raw file search only inside that narrowed context.

## Selection Heuristics

| Question type | Best starting context |
|---|---|
| "How does auth/session/admin access work?" | `apps-next-api` |
| "Where should business logic live?" | `apps-next-services` |
| "What contract should this feature depend on?" | `packages-providers` |
| "Where is the external integration implemented?" | `packages-adapters` |
| "Which shared screen or feature owns this flow?" | `packages-app` |
| "Which reusable/shared UI component should I extend?" | `packages-ui` |

## Constraints

- These graphs are navigation aids, not replacements for the actual code.
- The canonical architecture rules still live in [AGENTS.md](/C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/AGENTS.md).
- Rebuild the graphs after substantial architecture changes with `py -3 scripts/build_graphify_contexts.py`.
