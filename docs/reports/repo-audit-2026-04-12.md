# Repository Audit Report

Date: 2026-04-12
Reviewer: Codex
Scope: Full repository review across architecture, tech stack, data flow, security, UI/UX, accessibility, and QA

## Executive Summary

This repository shows a strong architectural intent and a surprisingly disciplined platform model for a cross-platform commerce codebase. The repo has a clear layered shape:

`UI -> Next.js server layer -> services -> provider registry -> adapters`

That model is documented in [AGENTS.md](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/AGENTS.md) and is materially reflected in the code, especially around `apps/next/server/services`, `packages/providers`, and `packages/adapters`.

The strongest aspects of the system are:
- a clear monorepo split between web, mobile, shared screens, shared UI, providers, and adapters
- a provider/adapter abstraction that makes mock-to-real integration swap possible
- meaningful local QA automation with guards, service tests, API tests, and Playwright accessibility smoke coverage
- a serious token system and shared UI strategy that tries to preserve cross-platform consistency

The main weaknesses are not conceptual. They are operational and implementation-level:
- hosted CI is structurally fragile because the workflow references nonexistent package tsconfig files
- abuse protection is not production-grade yet because rate limiting is in-memory and per-process
- session handling is better than ad hoc cookie logic, but still stores readable identity metadata in a signed cookie payload
- service boundaries are directionally good but still somewhat coupled to HTTP `Request` objects
- i18n and accessibility discipline is uneven in shared UI, especially in overlays and quick-view flows

Overall assessment:
- Architecture: strong
- Product engineering maturity: medium-high
- Security posture: medium
- UI system maturity: medium-high
- Accessibility maturity: medium
- QA maturity: medium-high

## Audit Scorecard

| Area | Score | Notes |
|---|---:|---|
| Architecture | 8/10 | Strong layered model, good separation, some coupling remains |
| Tech Stack & Platform Choices | 8/10 | Modern, coherent stack; some complexity overhead |
| Data Flow | 7/10 | Mostly disciplined server-first flow; some service/HTTP coupling |
| Security | 6/10 | Good baseline controls, but rate limiting and session design need hardening |
| UI/UX | 7/10 | Strong token and shared UI foundations; some complexity and polish gaps |
| Accessibility | 6/10 | Good intent and some real work, but incomplete coverage and i18n/a11y gaps |
| QA & Delivery | 7/10 | Strong local test story; hosted CI configuration drift is a major issue |
| Overall | 7/10 | Good platform with credible structure, not yet fully hardened for professional-scale delivery |

## Tech Stack Review

### Web
- Next.js App Router 16.2.1 in [apps/next/package.json](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/package.json)
- React 19.2.4
- Prisma 6.5.0
- Playwright for E2E in [package.json](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/package.json) and [playwright.config.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/playwright.config.ts)

### Mobile
- Expo 54 in [apps/expo/package.json](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/expo/package.json)
- React Native 0.81.4
- shared package-driven screen model via `@real/app`

### Shared UI / Styling
- token-based design system in [packages/tokens/index.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/tokens/index.ts)
- shared UI in `packages/ui/components`
- reusable primitives/variants in `packages/ui/reusables`
- hybrid styling model:
  - tokenized inline RN-style objects for shared components
  - `className` + `cva` + Uniwind/Tailwind in reusables, e.g. [packages/ui/reusables/button.tsx](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/reusables/button.tsx)

### Build / Orchestration
- Yarn 4 workspaces in [package.json](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/package.json)
- Turbo for test orchestration in [turbo.json](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/turbo.json)
- Next custom config with RNW aliases and security headers in [apps/next/next.config.mjs](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/next.config.mjs)

## Architecture Review

### What is strong

1. Clear layer ownership
- `apps/next` owns the server layer and route handlers.
- `packages/providers` owns contracts and provider registry.
- `packages/adapters` owns external integrations and mocks.
- `packages/app` owns shared screens and flows.
- `packages/ui` owns the shared UI system.

This is documented and actually reflected in the code. The provider registry in [packages/providers/registry.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/providers/registry.ts) is a concrete enforcement point for the architecture.

2. Good service-layer discipline
- Example: the homepage is assembled through services in [apps/next/server/services/home/home-page.service.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/home/home-page.service.ts) and [apps/next/server/services/home/home-cms.service.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/home/home-cms.service.ts), not by pushing direct adapter calls into page components.

3. Provider/adaptor swap model is credible
- `providerReadiness` and strict startup enforcement in [packages/providers/registry.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/providers/registry.ts:48) through [packages/providers/registry.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/providers/registry.ts:77) are thoughtful and useful.

### Where it is weaker

1. Services are not fully pure domain services
- [apps/next/server/services/home/home-page.service.ts:9](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/home/home-page.service.ts:9)
- [apps/next/server/services/_lib/public-discovery.ts:13](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/_lib/public-discovery.ts:13)

The service layer still constructs and passes `Request` objects and depends on `next/headers`. That keeps request context available, but it also makes services more transport-aware than ideal. This is acceptable pragmatically, but it weakens the claimed boundary between HTTP edge and domain orchestration.

2. Runtime complexity is high
- The repo combines App Router, shared RN components, RN Web aliasing, token CSS bridge generation, provider registry, and mock/real integration switching.
- This is powerful, but it raises the cognitive load substantially for onboarding and long-term maintenance.

## Data Flow Review

### Positive

The intended data flow is real:
- page layer calls service layer
- service layer calls providers
- providers resolve adapters

Examples:
- homepage page in [apps/next/app/page.tsx](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/page.tsx:25)
- service composition in [apps/next/server/services/home/home-layout-data.service.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/home/home-layout-data.service.ts:16)
- provider contract in [packages/providers/contracts/ProductProvider.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/providers/contracts/ProductProvider.ts:49)
- mock adapter implementation in [packages/adapters/mock/product/index.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/adapters/mock/product/index.ts)

### Concern

The service layer often uses `Promise.allSettled` and partial-failure tolerance to keep pages rendering. That is pragmatic for commerce landing pages, but it means degraded states may become normal rather than exceptional.

Examples:
- [apps/next/server/services/home/home-page.service.ts:12](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/home/home-page.service.ts:12)
- [apps/next/server/services/_lib/public-discovery.ts:56](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/server/services/_lib/public-discovery.ts:56)

This is fine for non-critical discovery content, but the same pattern should be used carefully in checkout, auth, and order flows.

## Security Review

### What is good

1. Centralized security policy
- [apps/next/app/api/_lib/security-policy.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/security-policy.ts)

2. Trusted mutation enforcement
- [apps/next/app/api/_lib/request-auth.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.ts)
- covered by tests in [apps/next/app/api/_lib/request-auth.test.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/request-auth.test.ts)

3. Secure cookie attributes and production-secret requirement
- [apps/next/app/api/_lib/security-policy.ts:21](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/security-policy.ts:21)
- [apps/next/app/api/_lib/security-policy.ts:55](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/security-policy.ts:55)
- [apps/next/app/api/_lib/auth-session.test.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.test.ts)

4. Security headers in Next config
- [apps/next/next.config.mjs](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/next.config.mjs)

### Top Security Findings

#### [P1] In-memory rate limiting is not production-grade
Location:
- [apps/next/app/api/_lib/rate-limiter.ts:116](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/rate-limiter.ts:116)
- [apps/next/app/api/_lib/rate-limiter.ts:161](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/rate-limiter.ts:161)
- [apps/next/app/api/_lib/rate-limiter.ts:171](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/rate-limiter.ts:171)
- [apps/next/app/layout.tsx:10](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/layout.tsx:10)

Impact:
- limits are per-process, not shared across instances
- rate limiting can be bypassed or behave inconsistently under horizontal scale
- clients without forwarding headers collapse into the `unknown` bucket, causing accidental shared throttling

Recommendation:
- move to a shared backing store such as Redis or platform-native edge rate limiting
- treat `unknown` IP fallback as a degraded path with separate handling

#### [P2] Auth cookie payload is signed but still readable and contains identity metadata
Location:
- [apps/next/app/api/_lib/auth-session.ts:29](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.ts:29)
- [apps/next/app/api/_lib/auth-session.ts:80](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.ts:80)
- [apps/next/app/api/_lib/auth-session.ts:88](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.ts:88)

Impact:
- cookie includes `userId`, `email`, `name`, `role`, `sessionId`, `csrfToken`
- integrity is protected, but confidentiality is not
- this increases privacy exposure and makes the session format harder to evolve safely

Recommendation:
- prefer opaque session IDs with server-side storage, or encrypt the payload if stateless sessions are required
- if current design is retained, remove unused fields from the cookie payload

#### [P2] Auth logic is duplicated across Node and proxy layers
Location:
- [apps/next/app/api/_lib/auth-session.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/api/_lib/auth-session.ts)
- [apps/next/proxy.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/proxy.ts)

Impact:
- two implementations of signed-cookie parsing increase maintenance risk
- edge/runtime divergence can create subtle auth bugs

Recommendation:
- centralize shared parsing logic in a runtime-compatible module usable from both environments

## UI/UX Review

### What is good

1. The design system has a real visual point of view
- [packages/tokens/colors.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/tokens/colors.ts)
- this is not generic gray/purple startup styling; it has explicit brand intent

2. Shared UI has meaningful responsive and motion utilities
- [packages/ui/components/usePrefersReducedMotion.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/usePrefersReducedMotion.ts)
- [packages/ui/components/useFocusTrap.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/useFocusTrap.ts)

3. Product card and overlay components show genuine product thinking
- [packages/ui/components/ProductCard.tsx](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/ProductCard.tsx)
- [packages/ui/components/chrome/SearchOverlay.tsx](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/chrome/SearchOverlay.tsx)

### UI/UX concerns

#### [P2] Styling model is split across two paradigms
Location:
- [packages/ui/reusables/button.tsx](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/reusables/button.tsx:8)
- [packages/ui/components/ProductCard.tsx](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/ProductCard.tsx)

Impact:
- product-facing components use tokenized inline RN-style objects
- reusables use `className` + CVA + Uniwind
- this increases onboarding cost and makes consistency harder to enforce

Recommendation:
- keep both layers if necessary, but document the boundary much more rigorously and add lint/guard support for misuse

#### [P3] Homepage Suspense boundary does not currently buy much
Location:
- [apps/next/app/page.tsx:25](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/page.tsx:25)
- [apps/next/app/page.tsx:28](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/page.tsx:28)

Impact:
- data is awaited before the `Suspense` boundary renders
- this means the fallback spinner is mostly decorative rather than enabling streaming

Recommendation:
- move async work lower into nested server components if streaming is a real goal

## Accessibility Review

### What is good

1. Skip link exists
- [apps/next/app/layout.tsx:81](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/apps/next/app/layout.tsx:81)

2. Focus trap utility exists and is reused
- [packages/ui/components/useFocusTrap.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/useFocusTrap.ts)

3. Reduced motion support exists
- [packages/ui/components/usePrefersReducedMotion.ts:15](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/usePrefersReducedMotion.ts:15)

4. Button touch targets are intentionally sized around 44px
- [packages/ui/reusables/button.tsx:47](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/reusables/button.tsx:47)

### Accessibility findings

#### [P2] Shared UI still contains hardcoded English strings in interactive flows
Location:
- [packages/ui/components/chrome/SearchOverlay.tsx:97](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/chrome/SearchOverlay.tsx:97)
- [packages/ui/components/chrome/SearchOverlay.tsx:186](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/chrome/SearchOverlay.tsx:186)
- [packages/ui/components/chrome/SearchOverlay.tsx:220](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/chrome/SearchOverlay.tsx:220)
- [packages/ui/components/chrome/SearchOverlay.tsx:232](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/chrome/SearchOverlay.tsx:232)
- [packages/ui/components/QuickViewModal.tsx:323](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/packages/ui/components/QuickViewModal.tsx:323)

Impact:
- weakens Arabic support
- accessible names and messages are not localized consistently
- increases risk of mixed-language UX in critical shopping flows

Recommendation:
- complete the i18n pass for shared UI copy before treating Arabic support as production-ready

#### [P2] Accessibility automation is useful but shallow
Location:
- [e2e/accessibility.spec.ts](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/e2e/accessibility.spec.ts)

Impact:
- heading hierarchy, keyboard navigation, labels, skip link, and alt text are checked
- there is no automated contrast testing, landmark/ARIA audit, modal trap verification, or axe integration

Recommendation:
- add `axe-core` or equivalent automated accessibility scans
- add coverage for dialogs, forms, checkout, auth, and admin flows

## QA Review

### What is strong

1. Good local quality gate spread
- architecture guard in [scripts/guard-checks.mjs](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/scripts/guard-checks.mjs)
- hygiene guard
- agent-doc guard
- service/API tests
- Playwright accessibility run

2. Test coverage breadth is real
- 28 service-layer test files
- 25 API test files
- 17 UI test files under `packages/ui`
- 8 app/shared-flow tests under `packages/app`

3. CI job split is directionally correct
- [`.github/workflows/ci.yml`](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/.github/workflows/ci.yml)

### Top QA finding

#### [P1] Hosted CI is misconfigured to typecheck files that do not exist
Location:
- [`.github/workflows/ci.yml:54`](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/.github/workflows/ci.yml:54)
- [`.github/workflows/ci.yml:66`](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/.github/workflows/ci.yml:66)
- [`.github/workflows/ci.yml:69`](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/.github/workflows/ci.yml:69)
- [`.github/workflows/ci.yml:81`](C:/Users/hamoo/Downloads/solito%20v5%20docs/my-solito-app/.github/workflows/ci.yml:81)

Verification:
- `packages/app/tsconfig.json` does not exist
- `packages/ui/tsconfig.json` does not exist

Impact:
- hosted checks can fail even when the actual local verification flow is green
- branch protection becomes unreliable
- delivery confidence drops because CI no longer reflects the real source tree

Recommendation:
- either add valid package-local tsconfig files or change the CI jobs to typecheck through the existing root/consumer tsconfig strategy

## Strengths Worth Preserving

- The repo has a real architectural backbone, not just folders with good names.
- The provider/adapter separation is one of the strongest design choices in the codebase.
- Token discipline is materially enforced through guards, not just style docs.
- Accessibility is not ignored; there is actual code and automated coverage for it.
- The local quality bar is above average for a product repo of this complexity.

## Priority Recommendations

1. Fix hosted CI first
- align `.github/workflows/ci.yml` with actual tsconfig ownership
- this is the most immediate release and trust issue

2. Upgrade rate limiting to a shared store
- current implementation is acceptable for local/dev and weak for real production abuse scenarios

3. Harden session design
- move toward opaque server-side sessions or encrypted stateless cookies

4. Reduce service-layer HTTP coupling
- isolate request-context adaptation from business services where possible

5. Finish i18n/a11y cleanup in shared UI
- prioritize overlays, quick views, auth, cart, and checkout

6. Expand QA from smoke to assurance
- add accessibility engine checks
- add responsive regression checks
- add explicit checkout/auth/admin critical path tests

## Final Verdict

This is a serious engineering codebase with strong platform instincts. It is not a toy repo and not a “UI demo plus backend later” setup. The architecture is mostly credible, the shared-platform ambitions are real, and the engineering quality bar is above average.

The main gap is that operational rigor has not fully caught up with architectural ambition. If CI alignment, rate limiting, and shared-UI i18n/a11y debt are addressed, this repo can move from “well-structured and promising” to “professionally dependable.”
