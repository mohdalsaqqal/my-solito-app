# Environment Data Source Matrix

This matrix defines how local development, Vercel Preview, and Vercel Production should source project data. `AGENTS.md` remains the architecture source of truth.

## Environment Roles

| Environment | Purpose | Runtime | Data rule |
|---|---|---|---|
| Local Dev | Fast feature work | Next dev server on the developer machine | Mock providers are allowed; Prisma is used when local Postgres is running |
| Local Production Build | Preflight verification only | Local `next build` / `next start` behavior | Uses production build behavior, but not customer production data |
| Vercel Preview | Staging truth for QA | Vercel serverless runtime with deployment protection | Uses preview database and preview secrets; mock providers allowed only when real credentials are not available |
| Vercel Production | Customer live site | Vercel production runtime and customer domain | Uses production database and production secrets; release-critical data must not depend on mock identity/CMS sources |

## Source Rules By Domain

| Domain | Local Dev | Vercel Preview | Vercel Production | Canonical owner |
|---|---|---|---|---|
| Auth users and sessions | Better Auth with local DB when available; mock auth only for tests/dev fallback | Better Auth with preview DB | Better Auth with production DB | Prisma `User`, `Account`, `Session` |
| Admin roles | Prisma role mapping first; seeded email inference only in tests/dev fallback | Prisma `AppAuthRoleMapping` | Prisma `AppAuthRoleMapping`; no inferred role writes | `apps/next/server/services/auth` |
| Admin user list | DB-first; mock CMS role preview only when no DB users are available in non-release mode | DB-first | DB-only | `/api/admin/users` + Prisma |
| CMS shell/content | Mock CMS may provide fallback base content | Prisma-backed CMS overlays plus preview DB state | Prisma-backed CMS; mock only explicit fallback for unavailable seed content | `apps/next/server/services/cms` |
| CMS release blocks | Mock release data may seed local lifecycle smoke; page config/version JSON is dev fallback only | Preview DB plus Prisma-backed page config/version snapshots | Prisma-backed releases plus page config/version snapshots; no `.data` dependency | CMS release/page services |
| Products/catalog | Generated mock ERP data or Odoo adapter | Mock or Odoo depending credentials | Real provider preferred; mock only if contractually accepted for demo delivery | Provider registry -> adapter |
| Search | Mock search or Meilisearch | Mock or Meilisearch depending credentials | Meilisearch when provisioned | `SearchProvider` |
| Payments | Mock/custom gateway | Mock/custom gateway sandbox | Real gateway/COD settlement config | `PaymentProvider` |
| Notifications | Mock/email/push adapter | Mock/email/push sandbox | Real email/push credentials | `NotificationProvider` |
| Operational audit/reconciliation | Local `.data` acceptable for dev-only queues | Preview-safe storage until Prisma migration | Should be Prisma-backed for customer production operations | Server services |

## Practical Flow

1. Use Local Dev for speed.
2. Run `yarn bootstrap:preview` before hosted QA; add `--apply` only when the target database is correct.
3. Run `yarn verify:provider-readiness` to see whether the current env is `customer-ready` or `demo-only`.
4. Run local quality gates and production build before hosted QA.
5. Use Vercel Preview as the staging truth.
6. Promote to Vercel Production only after Preview matches customer expectations, then run `yarn bootstrap:production --apply` against the production env.

## Provider Readiness Gate

`yarn verify:provider-readiness` prints every release-sensitive domain, its active source, and whether the env is customer-ready.

Required customer-production domains:

| Domain | Customer-ready source |
|---|---|
| Auth | Better Auth + Prisma DB |
| CMS shell/content | App CMS + Prisma DB |
| CMS page config | Prisma `CmsPageConfig` |
| CMS page versions | Prisma `CmsPageVersion` |
| Release lifecycle | Non-mock release provider |
| Product/category/brand | Real commerce/catalog provider |
| Order | Real order/payment network provider |
| Payment | Real custom/payment gateway provider |

Optional-but-recommended domains:

| Domain | Customer-ready source |
|---|---|
| Search | Meilisearch |
| Notifications | Email or Expo push provider |

When `APP_ENV=production` or `APP_ENV=staging` and `STRICT_PROVIDER_READINESS=true`, mock-backed required domains fail the readiness command.

## Cleanup Priority

1. Keep admin users DB-first.
2. Replace remaining mock release/provider domains needed for a real customer launch.
