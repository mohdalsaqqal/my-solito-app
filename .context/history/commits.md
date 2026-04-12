# Commit Decision History

> Human-readable view of `commits.jsonl`.
> Canonical store: `commits.jsonl` (JSONL, append-only)

| Date | Context-Id | Commit | Summary | Decisions | Bugs | Risk |
|------|-----------|--------|---------|-----------|------|------|
| 2026-04-12 | 003-platform-hygiene-remediation | 57b2b8d, c1ebf17, 39751dc | Shipped hygiene guards, agent-doc enforcement, service-test parity, and an audit cleanup for stale tests/orchestration. | Active `.gitignore` parsing, real `## Source of Truth` enforcement, real root `yarn test`, stale verification docs corrected, `proxy.ts` as the single routing/auth entry | PR experiment and final hosted CI confirmation still pending outside local verification | Medium |
