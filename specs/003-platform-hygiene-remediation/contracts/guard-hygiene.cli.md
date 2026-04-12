# Contract: `scripts/guard-hygiene.mjs`

**Kind**: Node.js ESM CLI script
**Invoked as**: `node scripts/guard-hygiene.mjs [options]` (also via `yarn guard:hygiene`)
**Enforces**: Constitution Principle XV (Repo Hygiene and Working Tree Discipline) and Principle XVI framework-pin rule (`HY-011`)

## CLI Surface

```
Usage: guard-hygiene.mjs [--since <ref>] [--verbose] [--json]

Options:
  --since <ref>    Scope check to files changed since <ref>. Defaults to
                   full repo scan in CI, empty (full scan) locally.
  --verbose        Print each rule evaluation result, not just failures.
  --json           Emit a machine-readable JSON summary instead of human text.
  -h, --help       Print this help and exit 0.

Environment:
  SKIP_GUARD_HYGIENE=1   Skip the check, log a loud warning, and exit 0.
                         Ignored on main branch (script exits 1 if set on main).
```

## Input

- **Working tree state**: the script reads the current repository tree starting from the directory passed as `process.cwd()`. It MUST be invoked from the repository root.
- **`.gitignore`**: parsed to verify `HY-001` and `HY-007` vendor and build-artifact ignore coverage.
- **`package.json` files**: all manifests discovered via glob `**/package.json` (excluding `node_modules`) are parsed for `HY-009` memory-override annotation, `HY-010` workspace-exclusion doc reference, and `HY-011` framework-pin check.
- **Repo root directory listing**: to verify `HY-002` through `HY-006` forbidden-path rules.
- **`git status --porcelain` output**: to verify `HY-008` staged-deletion advisory.

## Behavior

1. Load the seed rule list (hardcoded in the script, matching the HygieneRule entity seed in data-model.md).
2. For each rule, evaluate against the relevant scope and collect a `Finding` record: `{ ruleId, severity, path, message }`.
3. Group findings by severity.
4. If any `FAIL` finding exists, exit code `1` after printing the human-readable report (or JSON if `--json`).
5. If only `WARN` findings exist, exit code `0` with the warnings printed.
6. If no findings, exit code `0` with a one-line `Hygiene OK` message.

## Output (human mode)

```
guard-hygiene v1 — Principle XV enforcement
─────────────────────────────────────────
✖ FAIL  HY-002  repo-root  AUDIT_REPORT.md
        Audit/snapshot files are forbidden at repo root.
        Move to docs/archive/ or delete. (Constitution Principle XV)

✖ FAIL  HY-011  apps/next/package.json
        Framework pin violation: "next": "^16.2.1" — must be exact.
        Remove the ^ and pin to the version resolved in yarn.lock. (Constitution Principle XVI)

! WARN  HY-008  working-tree
        57 files staged for deletion. Commit or restore before pushing.

2 FAIL, 1 WARN — exit 1
```

## Output (JSON mode)

```json
{
  "script": "guard-hygiene",
  "version": 1,
  "exitCode": 1,
  "findings": [
    {
      "ruleId": "HY-002",
      "severity": "FAIL",
      "path": "AUDIT_REPORT.md",
      "message": "Audit/snapshot files are forbidden at repo root.",
      "principle": "XV"
    }
  ],
  "summary": { "fail": 2, "warn": 1, "pass": 9 }
}
```

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | No failures. Warnings may be present. |
| `1` | At least one failing rule. |
| `2` | Script error (unreadable file, malformed JSON, etc.). Reserved — not used by normal rules. |

## Performance Contract

- Full repo scan MUST complete in under 5 seconds on a clean working tree (data-model constraint).
- `--since` scan SHOULD complete in under 2 seconds for typical PR diffs.

## Test Contract

- A test at `scripts/guard-hygiene.test.mjs` MUST exist and cover:
  1. Clean working tree → exit 0, zero findings.
  2. Staged `AUDIT_REPORT.md` at root → exit 1 with HY-006 finding.
  3. Missing `.cline/` entry in `.gitignore` → exit 1 with HY-001 finding.
  4. `apps/next/package.json` with `"next": "^16.2.1"` → exit 1 with HY-011 finding.
  5. `SKIP_GUARD_HYGIENE=1` on a non-`main` branch → exit 0 with skip log.
  6. `SKIP_GUARD_HYGIENE=1` on `main` → exit 1 with skip-forbidden error.
