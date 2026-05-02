# 13 Security & Compliance

Status: `[~]`

## Goal

Deliver validation, auth, authorization, secrets, secure headers, minimal PII, vulnerability scanning, and penetration-test readiness.

## Current State

- [x] Better Auth foundation exists.
- [x] Server authorization patterns exist.
- [x] Zod validation is widely used.
- [x] CSP/security headers are configured in `apps/next/next.config.mjs`.
- [x] HSTS is opt-in through `ENABLE_HSTS=true` and documented to avoid domain lockout before HTTPS readiness.
- [~] Tenant DB scoping/RLS not complete.
- [x] Dependency scanning/security workflow exists through `.github/workflows/security.yml`.
- [x] Security/compliance runbook exists in `docs/delivery/runbooks/security-compliance.md`.
- [x] Security/compliance smoke exists through `yarn verify:security-compliance`.
- [ ] Penetration test not performed.

## Tasks

- [ ] Audit route handlers for Zod coverage.
- [x] Audit deployed CSP/HSTS.
- [x] Add dependency scanning confirmation.
- [x] Plan penetration test before go-live.
- [x] Add security/compliance verification gate.

## Verification

```bash
node scripts/guard-checks.mjs
yarn verify:security-compliance
node scripts/verify-delivery.mjs --profile security
```

2026-05-01 local result: `node scripts/verify-delivery.mjs --profile security` passed.

Hosted security workflow must run in GitHub before production handoff.

## Blockers

- Hosted CI/security tooling access still blocks live CodeQL/Dependency Review/Gitleaks confirmation.
- External penetration tester/vendor access still blocks completed penetration test.
