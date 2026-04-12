# Contract: Service-Layer Test File Shape

**Kind**: Test file template and parity rule
**Enforces**: Constitution Principle XVI (Operational Quality Baseline — FR-014, SC-005)

This contract defines the minimum shape every service-layer test file MUST have, and the parity rule that ties each service file to its test.

## File Location Rule

For every source file at `apps/next/server/services/<subdir>/<name>.ts` that is not marked exempt, a test file MUST exist at:

```
apps/next/server/services/<subdir>/<name>.test.ts
```

Co-location follows the existing repository convention. No `__tests__/` directories.

## Exemption Marker

A service source file MAY opt out of the test requirement by including this comment within its first 10 lines:

```ts
// @hygiene-exempt: barrel-reexport
```

The comment MUST name the exemption reason. `barrel-reexport` is the only reason honored at feature-ship time. Additional exemption reasons require a constitution patch.

## Minimum Test File Shape

Every non-exempt test file MUST contain at least two tests matching this template:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
// Import the module under test using its source path.
// Example:
// import { getCartSummary } from './cart.service.ts';

test('<serviceName> - happy path returns expected shape', async () => {
  // Arrange: seed the provider registry with mock data (already the default)
  // Act: call the exported service function(s)
  // Assert: verify shape — at minimum, verify the top-level fields exist
  assert.ok(true, 'replace with real happy-path assertion');
});

test('<serviceName> - failure path surfaces a typed error', async () => {
  // Arrange: force a provider failure by passing invalid input OR by
  //          overriding the mock adapter temporarily
  // Act + Assert: use assert.rejects or assert.throws with a matcher
  assert.ok(true, 'replace with real failure-path assertion');
});
```

## Test Name Conventions

The `test-service-layer` CI job parses test names to verify coverage. Each test file MUST contain:

- **At least one test whose name matches** the regex `/happy\s+path/i`.
- **At least one test whose name matches** the regex `/failure\s+path/i`.

Files failing either match cause the `test-service-layer` gate to FAIL with a clear message naming the offending file.

## Imports and Module Boundaries

- Tests MUST import from the service file's own path, not from an aggregated barrel. This ensures the test actually exercises the target file's exports.
- Tests MUST NOT import from `packages/adapters/*` directly — they go through `packages/providers` per Constitution Principle III.
- Tests MUST NOT fetch over HTTP. The service layer is server-side; testing via HTTP is the API-test layer, not the service-test layer.

## Parity Rule (enforced by `scripts/list-service-files.mjs`)

```
FOR each file in glob("apps/next/server/services/**/*.ts") WHERE file is not a *.test.ts:
  IF file contains "// @hygiene-exempt: barrel-reexport" in first 10 lines:
    SKIP
  ELSE:
    EXPECT sibling file "<name>.test.ts" to exist.
    EXPECT file to contain test names matching /happy\s+path/i AND /failure\s+path/i.
  END
END
```

Any failed expectation causes the parity helper to exit `1` with a list of uncovered files.

## Running the Tests

Tests are discovered and executed by `yarn --cwd apps/next test:api`, which after this feature runs uses the glob:

```
node --test app/api/**/*.test.ts apps/next/server/services/**/*.test.ts
```

No hand-list per FR-015.

## Performance Contract

- The full service-layer test run (28 files × 2 tests = 56 tests) MUST complete in under 60 seconds on a developer laptop. Smoke tests are fast by construction.

## Example: `apps/next/server/services/cart/cart.service.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCartSummary } from './cart.service.ts';

test('cart.service - happy path returns expected shape', async () => {
  const summary = await getCartSummary({ userId: 'mock-user-1' });
  assert.ok(summary, 'summary should not be null');
  assert.ok('items' in summary, 'summary should have items array');
  assert.ok('total' in summary, 'summary should have total');
});

test('cart.service - failure path surfaces a typed error', async () => {
  await assert.rejects(
    () => getCartSummary({ userId: '' }),
    /user\s*id/i,
    'empty user id should be rejected with a clear error',
  );
});
```

This is a smoke test. It does not exercise every code path — it exists to catch the "the module is completely broken" case and to provide a landing pad for future regression tests.
