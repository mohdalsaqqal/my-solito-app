# Delivery Matrix

This file maps project aspects to gates. Keep it updated when a new feature, blocker, or delivery requirement changes.

## Gate Profiles

### Current Required Gates

These should pass before a normal delivery slice is considered locally verified:

| Gate | Command | Aspect Coverage |
|---|---|---|
| `guard-checks` | `node scripts/guard-checks.mjs` | Architecture, UI rules, AI guardrails |
| `next-typecheck` | `node --max-old-space-size=4096 node_modules/typescript/bin/tsc -p apps/next/tsconfig.json --noEmit --incremental false` | Next server/app integration |
| `expo-functional` | `yarn verify:expo-functional` | Expo static app/config/router/push/EAS checks |
| `expo-typecheck` | `yarn --cwd apps/expo tsc --noEmit --incremental false` | Expo native app/shared package compile |
| `notifications-focused` | `yarn verify:notifications` | Notifications |
| `retention-consultation-focused` | `yarn verify:retention-consultation` | Referral, loyalty, account tests, pharmacist consultation |
| `next-api-full` | `yarn --cwd apps/next test:api` | Full API + service test suite |

### Functional Gates

Run these when customer-facing behavior changes:

| Gate | Command | Aspect Coverage |
|---|---|---|
| `storefront-static` | `yarn verify:functional-storefront:static` | Web storefront seed/static checks |
| `storefront-live` | `yarn verify:functional-storefront` | Web storefront end-to-end smoke |
| `cms-lifecycle` | `yarn verify:cms-lifecycle` | CMS edit, reorder, publish, rollback, schedule smoke |
| `account-management` | `yarn verify:account-management` | Better Auth, account surfaces, tenant membership schema |
| `payments-checkout` | `yarn verify:payments-checkout` | Payment intent, order write-back, webhook, reconciliation |
| `retention-consultation-focused` | `yarn verify:retention-consultation` | Referral, loyalty, account tests, pharmacist consultation |
| `odoo-static` | `node scripts/smoke-odoo-connection.mjs` | Odoo catalog/order write-back contract smoke |
| `shopify-scope` | `yarn verify:shopify-scope` | Shopify adapter scope smoke |
| `postgresql-mapping` | `yarn verify:postgresql-mapping` | Custom PostgreSQL adapter mapping smoke |
| `meilisearch-adapter` | `yarn verify:meilisearch-adapter` | Meilisearch SearchProvider adapter smoke |
| `search-discovery` | `yarn verify:search-discovery` | Search filters, facets, sort, indexing dry-run |
| `devops-deployment` | `yarn verify:devops-deployment` | Staging runbook, CI/Vercel/EAS/provisioning readiness |
| `operations-observability` | `yarn verify:operations-observability` | Health endpoint, uptime runbook, incident runbook |
| `security-compliance` | `yarn verify:security-compliance` | Headers, auth security, scans, penetration-test readiness |
| `platform-operations` | `yarn verify:platform-operations` | Tenant provisioning, tenant config, operator runbooks |
| `documentation-knowledge` | `yarn verify:documentation-knowledge` | Developer docs, operator index, component catalog, handoff docs |
| `ai-development-process` | `yarn verify:ai-development-process` | Startup protocol, memory, graphify contexts, workflow, AI guardrails |
| `launch-post-launch` | `yarn verify:launch-post-launch` | Beta plan, migration, go-live checklist, support, feedback loop |
| `pharmacist-browser` | `yarn verify:pharmacist-browser` | Web pharmacist browser-click consultation smoke |
| `e2e-a11y` | `yarn e2e:a11y` | Web accessibility smoke |

### Quality Profile

Use this before a client-reviewable milestone when no external credentials/devices are required:

```bash
yarn verify:delivery:quality
```

This runs architecture guards, Next/Expo type gates, notifications, retention/consultation, account, payments, search, CMS lifecycle, storefront static smoke, full API suite, and Next production build.

### Deploy Profile

Use this before staging deployment or deployment-runbook changes:

```bash
yarn verify:delivery:deploy
```

This runs architecture guards, Next typecheck, DevOps deploy-readiness smoke, and Next production build.

### Operations Profile

Use this before observability or operational-runbook changes:

```bash
node scripts/verify-delivery.mjs --profile operations
```

This runs architecture guards, Next typecheck, and operations/observability smoke.

### Security Profile

Use this before security/compliance changes:

```bash
node scripts/verify-delivery.mjs --profile security
```

This runs architecture guards, Next typecheck, and security/compliance smoke.

### Platform Profile

Use this before tenant provisioning or operator-runbook changes:

```bash
node scripts/verify-delivery.mjs --profile platform
```

This runs architecture guards, Next typecheck, and platform-operations smoke.

### Docs Profile

Use this before documentation or handoff changes:

```bash
node scripts/verify-delivery.mjs --profile docs
```

This runs the documentation/knowledge smoke.

### AI Process Profile

Use this before AI workflow or agent-rule changes:

```bash
node scripts/verify-delivery.mjs --profile ai
```

This runs the AI development process smoke.

### Launch Profile

Use this before launch, post-launch, or handoff-readiness changes:

```bash
node scripts/verify-delivery.mjs --profile launch
```

This runs the launch/post-launch smoke.

### Hardening Gates

These may currently expose known backlog. They become required after blockers are cleared:

| Gate | Command | Current Status |
|---|---|---|
| `expo-typecheck` | `yarn --cwd apps/expo tsc --noEmit --incremental false` | Promoted to current required gate |
| `next-api-full` | `yarn --cwd apps/next test:api` | Promoted to current required gate |
| `next-build` | `REQUIRE_PRODUCTION_AUTH=false BETTER_AUTH_SECRET=... yarn workspace next-app build` | Passes: 149 static pages, ready for promotion |

## Aspect Ownership

| Aspect | File | Primary Gates |
|---|---|---|
| Product & Business Foundation | `aspects/01-product-business-foundation.md` | docs review |
| Architecture & Design System | `aspects/02-architecture-design-system.md` | `guard-checks`, `next-typecheck` |
| Storefront Web & Native | `aspects/03-storefront-web-native.md` | `storefront-live`, `pharmacist-browser`, `expo-functional`, `expo-typecheck` |
| CMS & Content Management | `aspects/04-cms-content-management.md` | `cms-lifecycle`, CMS focused tests, `next-typecheck` |
| Backend Integration | `aspects/05-backend-integration.md` | `odoo-static`, `retention-consultation-focused`, `shopify-scope`, `postgresql-mapping`, `meilisearch-adapter`, `guard-checks` |
| User & Account Management | `aspects/06-user-account-management.md` | `account-management`, `retention-consultation-focused`, auth/account focused tests |
| Payments & Checkout | `aspects/07-payments-checkout.md` | `payments-checkout`, checkout/order/payment tests |
| Search & Discovery | `aspects/08-search-discovery.md` | `search-discovery`, `meilisearch-adapter`, search tests |
| Notifications | `aspects/09-notifications.md` | `notifications-focused`, `expo-functional`, physical push smoke |
| Quality & Testing | `aspects/10-quality-testing.md` | all named gates |
| DevOps & Deployment | `aspects/11-devops-deployment.md` | `devops-deployment`, `next-build`, deploy profile |
| Operations & Observability | `aspects/12-operations-observability.md` | `operations-observability`, operations profile |
| Security & Compliance | `aspects/13-security-compliance.md` | `security-compliance`, security profile |
| Platform Operations | `aspects/14-platform-operations.md` | `platform-operations`, platform profile |
| Documentation & Knowledge | `aspects/15-documentation-knowledge.md` | `documentation-knowledge`, docs profile |
| AI Development Process | `aspects/16-ai-development-process.md` | `ai-development-process`, AI profile |
| Launch & Post-Launch | `aspects/17-launch-post-launch.md` | `launch-post-launch`, launch profile |
