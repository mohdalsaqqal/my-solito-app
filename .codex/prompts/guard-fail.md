# Guard Failure Workflow Prompt

If `yarn guard:checks` fails:

1. Stop and inspect the exact failing guard output.
2. Do not continue blindly to additional implementation.
3. Identify the smallest compliant fix.
4. Apply minimal changes only.
5. Re-run `yarn guard:checks`.
6. If still failing and root cause implies a pause trigger, stop and request guidance.

## Prohibited behavior
- Ignoring guard failures.
- Suppressing guards to proceed.
- Broad rewrites unrelated to the failing rule.
