# Blocker Register

Use this file for named, reproducible blockers. A blocker must include the command that detects it.

## Active Blockers

### BLK-001 - Expo Typecheck Exposes Shared Package Type Debt

Status: `[x]` Resolved on 2026-04-29  
Aspect: Storefront Web & Native, Quality & Testing  
Command:

```bash
yarn --cwd apps/expo tsc --noEmit --incremental false
```

Resolution:

- Scoped `apps/expo/tsconfig.json` to native-reachable app/UI/token/provider-contract files instead of compiling adapter implementations, tests, and reference files.
- Fixed strict shared-package compile issues in release mocks, home layout, i18n wrappers, product card parsing, QR typing, auth error parsing, native star rating, focus trap, RN slot typing, and textarea typing.
- Promoted `expo-typecheck` into the current delivery profile.

Impact:

- `expo-functional` static smoke passes.
- `expo-typecheck` now passes locally and is a required current delivery gate.

Follow-up:

- Physical-device native smoke, deep-link validation, and Maestro coverage remain separate Aspect 03 tasks.

### BLK-002 - Full API Suite Needs Stable Local DB/Disk Rerun

Status: `[x]` Resolved on 2026-04-29  
Aspect: Quality & Testing  
Command:

```bash
yarn --cwd apps/next test:api
```

Resolution:

- Root cause: test cleanup paths used `APPS_NEXT_ROOT/.data/` while stores use `process.cwd()/.data/`. Functional storefront smoke left stale referral/program data in root `.data/` that tests never cleaned, causing 16 state isolation failures across referral, checkout, and order tests.
- Fixed 7 test files to use `process.cwd()` for `.data/` and `.tmp/` cleanup, matching the store paths.
- Added `connect_timeout=2` to test DATABASE_URL so Prisma connection attempts fail fast when Postgres is unavailable (was ~5s default per attempt, causing cumulative timeout).
- Added `--test-timeout=30000` as a safety net in the test:api script.
- Full suite now passes under the quality profile: `225/225` without a running Postgres.

### BLK-003 - Release Hygiene Has Pre-Existing Staged Deletions

Status: `[x]` Resolved on 2026-04-29  
Aspect: DevOps & Deployment  
Command:

```bash
yarn guard:hygiene
```

Resolution:

- Committed 2277 staged deletions that were previously removed from the git index via `git rm --cached` but never committed.
- All deleted files were either `.gitignore`'d generated output (graphify-out, .agents, .claude, .playwright, .tmp, .data, build logs) or previously deleted dead scaffolds (apps/strapi, real-cosmetics-admin, src/Figma).
- `yarn guard:hygiene` now passes with 0 FAIL, 0 WARN.

## Template

```md
### BLK-000 - Title

Status: `[!]`
Aspect:
Command:

```bash
command here
```

First failing file:
Impact:
Next action:
```
