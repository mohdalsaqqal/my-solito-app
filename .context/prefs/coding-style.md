# Coding Style Guide

> 此文件定义团队编码规范，所有 LLM 工具在修改代码时必须遵守。
> 提交到 Git，团队共享。

## General
- Prefer small, reviewable changes; avoid unrelated refactors.
- Keep functions short (<50 lines); avoid deep nesting (≤3 levels).
- Name things explicitly; no single-letter variables except loop counters.
- Handle errors explicitly; never swallow errors silently.

## Language-Specific

### TypeScript
- Use strict mode; prefer `interface` over `type` for object shapes.
- No `className` in `packages/app` — tokens only via inline styles.
- No `process.env` in `packages/app` or `packages/ui`.
- No hex literals (`#...`) in shared UI TypeScript files.
- No `Platform.OS` checks in shared files — use `useBreakpoint()`.

### React Native / Shared UI
- React Native primitives only: `View`/`Box`, `Text`, `Image`, `Pressable`.
- Tokens over hardcoded values: `colors.xxx`, `spacing.xxx`, `typography.xxx`, `radius.xxx`.
- `.native.tsx` extension for native-only behavior (ScrollView, gestures).

## Git Commits
- Conventional Commits, imperative mood.
- Atomic commits: one logical change per commit.

## Testing
- Every feat/fix MUST include corresponding tests.
- Coverage must not decrease.
- Fix flow: write failing test FIRST, then fix code.

## Security
- Never log secrets (tokens/keys/cookies/JWT).
- Validate inputs at trust boundaries.
