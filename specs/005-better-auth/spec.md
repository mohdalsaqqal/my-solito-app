# Feature Specification: Better Auth Migration With Security Hardening

**Feature Branch**: `005-better-auth`  
**Created**: 2026-04-14  
**Status**: In Progress  
**Input**: User description: "full implementation plan, implementing and security, audit, fix, security check, deliver"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Better Auth Becomes The Authentication Layer (Priority: P1)

As a platform owner, I want authentication to be backed by `Better Auth` so the
repo no longer relies on a fully custom session/auth lifecycle.

**Why this priority**: This is the core value of the migration and the
foundation for every later hardening step.

**Independent Test**: Sign in, resolve session, sign out, and verify the repo
auth routes operate through Better Auth-backed identity while preserving the
normalized app session shape.

**Acceptance Scenarios**:

1. **Given** a valid user login, **When** authentication succeeds,
   **Then** the repo issues a Better Auth-backed authenticated session.
2. **Given** an authenticated session, **When** `/api/auth/session` is read,
   **Then** the route returns the normalized app session contract already used
   across the repo.
3. **Given** a release-like environment with a weak or missing
   `BETTER_AUTH_SECRET`, **When** Better Auth initialization is attempted,
   **Then** the repo fails closed rather than falling back to legacy auth
   secrets.

---

### User Story 2 - Existing Admin And CMS Authorization Still Works (Priority: P1)

As an admin/operator, I want the existing admin-domain and CMS permissions to
continue working after the auth migration so that no protected workflow loses
security or access control fidelity.

**Why this priority**: The repo's business authorization is more important than
the auth library swap itself.

**Independent Test**: Exercise protected admin and CMS routes with multiple
roles and confirm domain permissions are unchanged after the migration.

**Acceptance Scenarios**:

1. **Given** a user with the `marketing` role, **When** they access marketing
   admin routes, **Then** access decisions match the current
   `admin-rbac.ts` matrix.
2. **Given** a user lacking access to an admin domain, **When** they call the
   corresponding protected route, **Then** the route still denies access
   server-side.

---

### User Story 3 - Security Audit And Hardening Pass Completes Before Delivery (Priority: P2)

As the team shipping the auth migration, I want a security-focused review and
verification pass so the new authentication setup is not just functional but
defensible.

**Why this priority**: Auth migrations are high-risk and should not ship based
on happy-path functionality alone.

**Independent Test**: Run the required security and regression checks,
validate session, logout, route protection, and verify no protected route can
be reached with invalid or downgraded identity state.

**Acceptance Scenarios**:

1. **Given** the migration is implemented, **When** the security audit checklist
   is run, **Then** all required auth, session, RBAC, mutation, and audit-log
   checks pass or are explicitly documented as blockers.
2. **Given** the delivery candidate is built, **When** the repo verification
   suite is executed, **Then** auth-sensitive routes and build flows remain
   green.

## Edge Cases

- What happens when Better Auth initialization fails but legacy auth still
  exists during the transition window?
- What happens when a user has a valid Better Auth identity but no app-owned
  role mapping?
- What happens when a legacy custom session and a Better Auth session are both
  present during the cutover?
- What happens when logout clears one session source but not the other?
- What happens when password/account flows move to Better Auth but admin/CMS
  authorization still depends on app-owned role metadata?
- What happens when request-bound auth/session routes are analyzed during
  prerender with `cacheComponents` enabled?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use `Better Auth` as the authentication/session
  provider once the migration is complete.
- **FR-002**: System MUST preserve the normalized app session contract used by
  the repo: `userId`, `email`, `name`, `role`.
- **FR-003**: System MUST keep admin-domain RBAC and CMS authorization app-owned.
- **FR-004**: Route handlers MUST continue to use thin server-owned auth helper
  boundaries rather than consuming raw Better Auth objects directly.
- **FR-005**: System MUST support a temporary compatibility period where legacy
  custom sessions can still be read during cutover.
- **FR-006**: System MUST stop issuing legacy custom sessions once Better Auth
  becomes the active authentication source.
- **FR-007**: System MUST preserve trusted mutation request protections.
- **FR-008**: System MUST preserve or improve audit logging behavior for
  protected admin/CMS mutations.
- **FR-009**: System MUST include security-focused verification before the
  migration is considered delivered.
- **FR-010**: System MUST document delivery gates and rollback considerations.
- **FR-011**: Release-like environments MUST require a dedicated strong
  `BETTER_AUTH_SECRET` and MUST fail closed when it is weak or missing.
- **FR-012**: CI, examples, and operator-facing documentation MUST reflect the
  Better Auth environment contract.
- **FR-013**: Request-bound auth/session routes MUST remain compatible with the
  repo's `cacheComponents` / prerender model.
- **FR-014**: Expected prerender bailout diagnostics MUST NOT be surfaced as
  misleading `BFF_FAIL` errors during debug-prerender verification.

### Key Entities *(include if feature involves data)*

- **NormalizedAppSession**: The repo-owned session shape consumed by route
  handlers and services.
- **BetterAuthIdentity**: Better Auth user/account/session records used only as
  the authentication source.
- **AppOwnedRoleMapping**: Repo-owned role and permission metadata that drives
  admin-domain authorization.
- **ProtectedAdminRoute**: Any route under `apps/next/app/api/admin/**` that
  depends on authenticated identity and domain authorization.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Auth routes operate on Better Auth-backed sessions while still
  returning the normalized app session contract.
- **SC-002**: Existing admin-domain permission outcomes remain unchanged for
  supported roles after migration.
- **SC-003**: Legacy custom session issuance is removed after the transition
  window without breaking protected route access.
- **SC-004**: Security verification and regression checks are documented and
  executed before delivery.
- **SC-005**: Delivery artifacts include implementation plan, backlog, and
  verification criteria for the migration.
- **SC-006**: Release-like environments reject weak or missing
  `BETTER_AUTH_SECRET` configuration.
- **SC-007**: `yarn --cwd apps/next build --webpack --debug-prerender`
  completes without flooding the logs with expected auth-related prerender
  bailout noise.

## Assumptions

- The repo will keep its custom admin and CMS authorization model.
- `Strapi` is not part of the recommended production stack.
- `Prisma/Postgres` remains the canonical persistence layer for auth-linked
  app-owned metadata, CMS data, releases, and audits.
- The migration should be phased and reversible rather than a big-bang swap.
