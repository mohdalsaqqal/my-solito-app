# Contract: `scripts/check-agent-docs.mjs`

**Kind**: Node.js ESM CLI script
**Invoked as**: `node scripts/check-agent-docs.mjs [options]` (also via `yarn guard:agent-docs`)
**Enforces**: Constitution Principle XIV (AGENTS.md as Sole Source of Truth)

## CLI Surface

```
Usage: check-agent-docs.mjs [--verbose] [--json]

Options:
  --verbose        Print each shim evaluation, not just failures.
  --json           Emit a machine-readable JSON summary.
  -h, --help       Print this help and exit 0.

Environment:
  SKIP_GUARD_AGENT_DOCS=1   Skip the check, log a warning, exit 0.
                            Ignored on main (exits 1 if set on main).
```

## Input

- **`AGENTS.md`**: canonical file. The script verifies that a `## Source of Truth` section exists within the first 30 lines and declares the six support-shim paths.
- **Support-shim files** (fixed path list, matching the `ShimDescriptor` finite set in data-model.md):
  - `CLAUDE.md`
  - `GEMINI.md`
  - `.github/copilot-instructions.md`
  - `.codex/context.md`
  - `.qwen/PROJECT_SUMMARY.md`
  - `.impeccable.md`
- **Forbidden-phrase set**: hardcoded constant inside the script, matching the seed list in data-model.md entity `ForbiddenPhraseSet`.

## Behavior

1. Read `AGENTS.md` and verify the `## Source of Truth` section exists with the full six-shim list. If absent or incomplete, emit `AD-000` FAIL.
2. For each shim path in the ShimDescriptor list:
   a. If the file does not exist, emit `AD-001` FAIL.
   b. Read the first 30 lines. If the phrase `"AGENTS.md is the source of truth"` (case-insensitive) is not present, emit `AD-002` FAIL.
   c. Count total lines. If > 150, emit `AD-003` WARN.
   d. Scan the full file for any phrase in the forbidden-phrase set. For each match, emit `AD-004` FAIL with file path, line number, and matched phrase.
3. Print human-readable report (or JSON) and exit with code based on findings.

## Output (human mode)

```
check-agent-docs v1 — Principle XIV enforcement
────────────────────────────────────────────────
✓ PASS  AGENTS.md           Source of Truth section present
✓ PASS  CLAUDE.md           72 lines, pointer present, no forbidden phrases
✖ FAIL  GEMINI.md:43        AD-004: duplicated architecture rule
        Matched phrase: "Server Components MUST NOT call internal Route Handlers"
        This phrase belongs only in AGENTS.md and the constitution.
        Remove or replace with: "See AGENTS.md for architecture rules."
! WARN  .github/copilot-instructions.md   164 lines (ceiling 150) — review recommended
✓ PASS  .codex/context.md   89 lines
✓ PASS  .qwen/PROJECT_SUMMARY.md  41 lines
✓ PASS  .impeccable.md      67 lines

1 FAIL, 1 WARN — exit 1
```

## Output (JSON mode)

```json
{
  "script": "check-agent-docs",
  "version": 1,
  "exitCode": 1,
  "shims": [
    { "path": "CLAUDE.md", "lineCount": 72, "pointerPresent": true, "forbiddenMatches": [], "status": "PASS" },
    { "path": "GEMINI.md", "lineCount": 98, "pointerPresent": true, "forbiddenMatches": [
      { "line": 43, "phrase": "Server Components MUST NOT call internal Route Handlers" }
    ], "status": "FAIL" }
  ],
  "summary": { "fail": 1, "warn": 1, "pass": 5 }
}
```

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | All shims pass. Warnings may be present. |
| `1` | At least one shim fails. |
| `2` | Script error. |

## Performance Contract

- Full check MUST complete in under 2 seconds. Scan size is fixed (6 small files + AGENTS.md).

## Test Contract

A test at `scripts/check-agent-docs.test.mjs` MUST cover:
1. Clean state (all shims pointer-first, no forbidden phrases) → exit 0.
2. Shim missing pointer paragraph → exit 1 with AD-002 finding.
3. Shim containing forbidden phrase verbatim → exit 1 with AD-004 finding and correct line number.
4. Shim > 150 lines → exit 0 with AD-003 WARN.
5. Missing shim file → exit 1 with AD-001.
6. Missing `## Source of Truth` section in AGENTS.md → exit 1 with AD-000.

## Interaction With `allowedExceptionFiles`

The phrase-match check skips `AGENTS.md` itself and `.specify/memory/constitution.md`. These files are allowed — required, in fact — to contain the forbidden phrases. Any other file containing them is a violation.
