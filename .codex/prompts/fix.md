# Fix Workflow Prompt

Use this mode to patch issues identified by review, tests, or guard checks.

## Fix rules
- Fix minimally and locally; avoid broad refactors.
- Keep architecture and layer boundaries intact.
- Preserve behavior unless bug requires behavior change.
- Prefer existing patterns/components before adding new ones.
- Re-run impacted checks after each fix batch.

## Output structure
1. Root cause
2. Minimal fix plan
3. Files changed
4. Verification run
5. Residual risk
