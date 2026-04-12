# Codex Workflow System

This folder provides a lightweight task-routing and execution framework for AI coding agents.

## Files
- `context.md`: shared execution context; `AGENTS.md` precedence.
- `rules.json`: domain routing, keywords, prompt selection, model hints, guard/planning flags.
- `router.js`: task classifier + workflow selector + pause-trigger detection + optional guard execution.
- `prompts/*.md`: mode-specific prompt templates.

## Basic usage
```bash
node .codex/router.js "design checkout flow"
node .codex/router.js "implement product card hover animation"
node .codex/router.js "review cart drawer changes"
```

## Optional flags
```bash
node .codex/router.js --mode architect "refactor provider registry"
node .codex/router.js --mode reviewer --run-guard "review checkout changes"
node .codex/router.js --mode fix "fix guard failures in shop screen"
node .codex/router.js --json "implement rtl-safe account tabs"
```

## Guard integration
- Router can run `yarn guard:checks`:
  - explicitly with `--run-guard`
  - automatically for build/release-like tasks where guard is required.

## Pause-trigger integration
- Router halts on known pause-trigger keywords and exits with non-zero status.
- When halted, request user guidance before coding.

## Notes
- This workflow augments `AGENTS.md`; it does not replace architecture policy.
- Keep workflows additive and low-risk.

## Version sync discipline
- `AGENTS.md` version and `.codex/rules.json` `agentsVersion` must stay aligned.
- Check with:
```bash
yarn codex:version-check
```

## Router tests
```bash
yarn codex:test
```
