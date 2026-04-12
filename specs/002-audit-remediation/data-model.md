# Data Model: Audit Remediation Plan

**Phase 1 output for spec 002-audit-remediation**  
**Date**: 2026-04-09

## Overview

This feature is primarily policy and behavior remediation rather than a new end-user data feature. The entities below describe the contracts that the implementation must enforce.

## Entities

### Authenticated Session Policy

Defines the minimum conditions under which a protected customer or admin request can proceed.

| Field | Type | Description |
|-------|------|-------------|
| Secret Requirement | Rule | Whether release-ready environments require an explicit session secret |
| Cookie Attributes | Rule Set | Required security attributes for auth cookie issuance and clearing |
| Role Scope | Enum Set | Roles permitted to access protected customer, pharmacist, and admin surfaces |
| Environment Behavior | Rule | Differences between development-safe and production-safe handling |
| Failure Response | Response Contract | Standardized rejection behavior when session validation fails |

**Validation rules**:

- Protected routes must never rely on a hardcoded secret in a release-ready path.
- Cookie issuance and cookie clearing must use a consistent security policy.
- Invalid sessions must fail closed.

### Protected Mutation Request

Represents any state-changing request that depends on cookies and therefore requires explicit request validation.

| Field | Type | Description |
|-------|------|-------------|
| Route Identifier | String | The route or route family being protected |
| Auth Requirement | Boolean | Whether an authenticated session is required |
| Request Context Requirement | Rule Set | Required request-origin or request-metadata conditions |
| Exemption Type | Enum | Browser mutation, machine webhook, internal non-browser client, or public route |
| Failure Response | Response Contract | Standardized rejection payload when request validation fails |

**Validation rules**:

- Browser-driven mutations require both auth and trusted request context.
- Exemptions must be explicit and documented.
- Rejections must occur before business logic mutates state.

### Administrative Asset Upload Policy

Defines what file types may be accepted and how same-origin uploads are stored.

| Field | Type | Description |
|-------|------|-------------|
| Route Identifier | String | Upload endpoint under admin control |
| Allowed Types | Set | Policy-approved file types |
| Rejected Types | Set | Disallowed file types in the remediated scope |
| Size Limit | Numeric Rule | Maximum accepted upload size |
| Storage Target | String | Same-origin storage location for accepted assets |
| Rejection Contract | Response Contract | Standardized error behavior for invalid uploads |

**Validation rules**:

- Unsafe same-origin asset types must be rejected consistently.
- Accepted assets must stay within declared size and type limits.
- Policy must be aligned across all remediated upload endpoints.

### Provider Readiness Contract

Defines whether a provider path is suitable for development-only use or release-ready use.

| Field | Type | Description |
|-------|------|-------------|
| Domain | String | Catalog, auth, checkout, CMS, admin, etc. |
| Readiness Tier | Enum | Development-only, test-safe, release-ready |
| Active Source | Enum | Mock-backed, external-backed, mixed, or unavailable |
| Fallback Rule | Rule | Whether fallback is allowed, disallowed, or fail-fast |
| Verification Requirement | Rule | Evidence needed before the domain is considered release-ready |

**Validation rules**:

- Production-sensitive domains must not silently degrade into mock behavior.
- Documentation must match runtime selection behavior.
- Domains that remain mock-only must be obvious to release operators.

### Verification Baseline

The required release-confidence checks for the remediated scope.

| Field | Type | Description |
|-------|------|-------------|
| Command | String | Verification command or suite |
| Scope | String | What behavior the command protects |
| Invocation Root | String | Required execution entry point |
| Expected Result | Enum | Pass, fail with real regression, or fail due to environment prerequisite |
| Known Flake Status | Enum | None, mitigated, or out of scope |

**Validation rules**:

- Root invocation must be documented and stable.
- Failures must map to actual broken behavior or a declared prerequisite.
- Verification must cover the remediated security and readiness surfaces.
