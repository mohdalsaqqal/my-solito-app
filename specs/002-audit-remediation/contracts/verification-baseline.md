# Contract: Verification Baseline

## Purpose

Define the repository-level verification expectations for the remediation scope so pass/fail results are trustworthy and repeatable.

## Contract

- The repository root is the canonical verification entry point.
- Required verification commands must produce deterministic results from that entry point.
- Test harness defects must be fixed or documented as prerequisites before results are treated as release signals.

## Required Verification Set

| Check | Expected Behavior |
|-------|-------------------|
| Guard checks | Enforce repo-specific architecture and shared UI rules without false positives in the remediated scope |
| Next.js typecheck | Detect type regressions in the remediated scope |
| API test suite | Fail only for real route or contract regressions in the remediated scope |
| Accessibility and browser smoke coverage | Use supported tooling and stable assertions for the remediated scope |

## Notes

- A verification failure is acceptable only when it points to a real broken contract or a declared environment prerequisite.
- Invocation-path-sensitive tests are considered harness defects and must not remain part of the release baseline.
